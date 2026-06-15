from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import funds, market

app = FastAPI(title="SIPsmart API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(funds.router,  prefix="/funds",  tags=["funds"])
app.include_router(market.router, prefix="/market", tags=["market"])

@app.get("/")
def root():
    return {"message": "SIPsmart API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}