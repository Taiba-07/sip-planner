import numpy as np
import pandas as pd
from typing import List, Dict

def compute_metrics(nav_data: List[Dict]) -> Dict:
    """
    Given a list of {"date": "...", "nav": float} dicts (oldest first),
    compute real financial metrics.
    """
    if len(nav_data) < 30:
        return {}

    df = pd.DataFrame(nav_data)
    df['date'] = pd.to_datetime(df['date'], dayfirst=True)
    df = df.sort_values('date').reset_index(drop=True)
    df['nav'] = df['nav'].astype(float)

    navs = df['nav'].values
    dates = df['date'].values

    # ── CAGR ──────────────────────────────────────────────
    years = (df['date'].iloc[-1] - df['date'].iloc[0]).days / 365.25
    cagr = ((navs[-1] / navs[0]) ** (1 / years) - 1) * 100 if years > 0 else 0

    # ── Daily returns ──────────────────────────────────────
    daily_returns = df['nav'].pct_change().dropna()

    # ── Annualized volatility ─────────────────────────────
    volatility = daily_returns.std() * np.sqrt(252) * 100

    # ── Sharpe ratio (risk-free = 6.5% RBI repo rate) ─────
    risk_free_daily = 0.065 / 252
    excess_returns = daily_returns - risk_free_daily
    sharpe = (excess_returns.mean() / daily_returns.std()) * np.sqrt(252) if daily_returns.std() > 0 else 0

    # ── Sortino ratio (only downside deviation) ────────────
    downside = daily_returns[daily_returns < 0]
    sortino = (excess_returns.mean() / downside.std()) * np.sqrt(252) if len(downside) > 0 and downside.std() > 0 else 0

    # ── Max drawdown ──────────────────────────────────────
    rolling_max = np.maximum.accumulate(navs)
    drawdowns = (navs - rolling_max) / rolling_max * 100
    max_drawdown = drawdowns.min()

    # ── 1M, 3M, 6M returns ────────────────────────────────
    def period_return(days: int) -> float:
        if len(df) < days:
            return 0
        past_nav = df['nav'].iloc[-days]
        return ((navs[-1] - past_nav) / past_nav) * 100

    return {
        "cagr":         round(cagr, 2),
        "volatility":   round(volatility, 2),
        "sharpe":       round(sharpe, 2),
        "sortino":      round(sortino, 2),
        "maxDrawdown":  round(max_drawdown, 2),
        "return1M":     round(period_return(21), 2),
        "return3M":     round(period_return(63), 2),
        "return6M":     round(period_return(126), 2),
        "return1Y":     round(period_return(252), 2),
        "currentNav":   round(float(navs[-1]), 2),
        "dataPoints":   len(df),
    }