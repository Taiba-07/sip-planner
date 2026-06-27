from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import PortfolioItem, User
from pydantic import BaseModel
from datetime import datetime
import httpx

router = APIRouter(tags=["portfolio"])

class AddHoldingRequest(BaseModel):
    email: str
    fund_code: int
    fund_name: str
    units: float
    buy_nav: float
    invested_on: str  # "YYYY-MM-DD"

async def get_current_nav(fund_code: int) -> float:
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"https://api.mfapi.in/mf/{fund_code}/latest")
            data = r.json()
            return float(data["data"][0]["nav"])
    except:
        return 0.0

@router.post("/add")
async def add_holding(req: AddHoldingRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        user = User(email=req.email)
        db.add(user)
        db.commit()
        db.refresh(user)
    item = PortfolioItem(
        user_id=user.id,
        fund_code=req.fund_code,
        fund_name=req.fund_name,
        units=req.units,
        buy_nav=req.buy_nav,
        invested_on=datetime.strptime(req.invested_on, "%Y-%m-%d"),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "Holding added", "id": item.id}

@router.get("/{email}")
async def get_portfolio(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"holdings": [], "total_invested": 0, "total_current": 0}
    items = db.query(PortfolioItem).filter(PortfolioItem.user_id == user.id).all()
    holdings = []
    total_invested = 0
    total_current = 0
    for item in items:
        current_nav = await get_current_nav(item.fund_code)
        invested = item.units * item.buy_nav
        current = item.units * current_nav
        pnl = current - invested
        pnl_pct = (pnl / invested * 100) if invested > 0 else 0
        holdings.append({
            "id": item.id,
            "fund_code": item.fund_code,
            "fund_name": item.fund_name,
            "units": item.units,
            "buy_nav": item.buy_nav,
            "current_nav": current_nav,
            "invested": round(invested, 2),
            "current_value": round(current, 2),
            "pnl": round(pnl, 2),
            "pnl_pct": round(pnl_pct, 2),
            "invested_on": item.invested_on.strftime("%Y-%m-%d"),
        })
        total_invested += invested
        total_current += current
    return {
        "holdings": holdings,
        "total_invested": round(total_invested, 2),
        "total_current": round(total_current, 2),
        "total_pnl": round(total_current - total_invested, 2),
        "total_pnl_pct": round((total_current - total_invested) / total_invested * 100, 2) if total_invested > 0 else 0,
    }

@router.delete("/{item_id}")
def delete_holding(item_id: int, db: Session = Depends(get_db)):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Holding not found")
    db.delete(item)
    db.commit()
    return {"message": "Holding deleted"}