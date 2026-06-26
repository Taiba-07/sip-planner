from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User

router = APIRouter()

class UserUpsert(BaseModel):
    email: str
    name: str | None = None

@router.post("/upsert")
def upsert_user(payload: UserUpsert):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == payload.email).first()
        if not user:
            user = User(email=payload.email, name=payload.name)
            db.add(user)
            db.commit()
            db.refresh(user)
            return {"status": "created", "user_id": user.id}
        else:
            if payload.name and user.name != payload.name:
                user.name = payload.name
                db.commit()
            return {"status": "exists", "user_id": user.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()