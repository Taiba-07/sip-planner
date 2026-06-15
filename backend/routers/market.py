import httpx
from fastapi import APIRouter

router = APIRouter()

INDICES = {
    "Nifty 50":     "^NSEI",
    "Sensex":       "^BSESN",
    "Nifty Midcap": "^NSEMDCP50",
}

@router.get("/indices")
async def get_indices():
    results = []
    async with httpx.AsyncClient(timeout=8.0) as client:
        for name, symbol in INDICES.items():
            try:
                url  = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
                resp = await client.get(
                    url, headers={"User-Agent": "Mozilla/5.0"}
                )
                data  = resp.json()
                meta  = data["chart"]["result"][0]["meta"]
                price = meta.get("regularMarketPrice", 0)
                prev  = meta.get("chartPreviousClose", price)
                change = round(((price - prev) / prev) * 100, 2)
                results.append({
                    "name":      name,
                    "price":     round(price, 2),
                    "changePct": change,
                })
            except Exception:
                continue
    return results