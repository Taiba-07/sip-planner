import httpx
import time
from fastapi import APIRouter, HTTPException

router = APIRouter()

_cache: dict = {}
CACHE_TTL = 300  # 5 minutes

def get_cached(key: str):
    if key in _cache:
        data, ts = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
    return None

def set_cached(key: str, data):
    _cache[key] = (data, time.time())

TOP_FUNDS = [
    {"code": 120503, "name": "Mirae Asset Large Cap Fund",       "category": "large"},
    {"code": 118989, "name": "Axis Bluechip Fund",               "category": "large"},
    {"code": 125497, "name": "Parag Parikh Flexi Cap Fund",      "category": "flexi"},
    {"code": 120716, "name": "Mirae Asset Emerging Bluechip",    "category": "mid"},
    {"code": 135781, "name": "Nippon India Small Cap Fund",      "category": "small"},
    {"code": 120828, "name": "SBI Small Cap Fund",               "category": "small"},
    {"code": 122639, "name": "Axis Midcap Fund",                 "category": "mid"},
    {"code": 119598, "name": "HDFC Mid-Cap Opportunities Fund",  "category": "mid"},
]

@router.get("/")
async def get_top_funds():
    cached = get_cached("top_funds")
    if cached:
        return cached

    results = []
    async with httpx.AsyncClient(timeout=10.0) as client:
        for fund in TOP_FUNDS:
            try:
                resp = await client.get(
                    f"https://api.mfapi.in/mf/{fund['code']}/latest"
                )
                resp.raise_for_status()
                data     = resp.json()
                nav_data = data.get("data", [{}])[0]
                results.append({
                    "schemeCode": fund["code"],
                    "schemeName": fund["name"],
                    "category":   fund["category"],
                    "nav":        float(nav_data.get("nav", 0)),
                    "date":       nav_data.get("date", ""),
                })
            except Exception:
                continue

    set_cached("top_funds", results)
    return results

@router.get("/{fund_code}/history")
async def get_fund_history(fund_code: int, days: int = 365):
    cache_key = f"history_{fund_code}_{days}"
    cached = get_cached(cache_key)
    if cached:
        return cached

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(f"https://api.mfapi.in/mf/{fund_code}")
            resp.raise_for_status()
            raw = resp.json()
        except Exception:
            raise HTTPException(status_code=502, detail="Could not reach MFAPI")

    all_data = raw.get("data", [])[:days]
    result = {
        "schemeCode": fund_code,
        "schemeName": raw.get("meta", {}).get("scheme_name", ""),
        "data": [
            {"date": d["date"], "nav": float(d["nav"])}
            for d in all_data
            if d.get("nav")
        ],
    }
    result["data"].reverse()

    set_cached(cache_key, result)
    return result