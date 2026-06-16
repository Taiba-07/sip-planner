import sys
import os

# Allow imports from parent directory (backend/)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analytics.metrics import compute_metrics


def generate_nav_data(start_nav: float, days: int, daily_growth: float = 0.0003):
    """Helper to generate fake NAV data for testing"""
    import datetime
    data = []
    nav = start_nav
    date = datetime.date(2024, 1, 1)
    for i in range(days):
        data.append({
            "date": date.strftime("%d-%m-%Y"),
            "nav": round(nav, 4)
        })
        nav *= (1 + daily_growth)
        date += datetime.timedelta(days=1)
    return data


def test_compute_metrics_returns_empty_for_insufficient_data():
    """Less than 30 days should return empty dict"""
    data = generate_nav_data(100, 10)
    result = compute_metrics(data)
    assert result == {}


def test_compute_metrics_returns_all_keys():
    """A full year of growing NAV should return all expected keys"""
    data = generate_nav_data(100, 400)
    result = compute_metrics(data)

    expected_keys = {
        "cagr", "volatility", "sharpe", "sortino", "maxDrawdown",
        "return1M", "return3M", "return6M", "return1Y",
        "currentNav", "dataPoints"
    }
    assert expected_keys.issubset(result.keys())


def test_cagr_is_positive_for_growing_fund():
    """A steadily growing fund should have positive CAGR"""
    data = generate_nav_data(100, 400, daily_growth=0.0005)
    result = compute_metrics(data)
    assert result["cagr"] > 0


def test_cagr_is_negative_for_declining_fund():
    """A steadily declining fund should have negative CAGR"""
    data = generate_nav_data(100, 400, daily_growth=-0.0005)
    result = compute_metrics(data)
    assert result["cagr"] < 0


def test_current_nav_matches_last_data_point():
    """currentNav should equal the most recent NAV value"""
    data = generate_nav_data(100, 400)
    result = compute_metrics(data)
    assert result["currentNav"] == round(data[-1]["nav"], 2)


def test_data_points_matches_input_length():
    """dataPoints should equal the number of NAV entries provided"""
    data = generate_nav_data(50, 365)
    result = compute_metrics(data)
    assert result["dataPoints"] == 365


def test_max_drawdown_is_negative_or_zero():
    """Max drawdown should never be a positive number"""
    data = generate_nav_data(100, 400, daily_growth=0.0002)
    result = compute_metrics(data)
    assert result["maxDrawdown"] <= 0


def test_constant_nav_has_zero_volatility():
    """A fund with completely flat NAV should have ~0 volatility"""
    import datetime
    data = []
    date = datetime.date(2024, 1, 1)
    for i in range(100):
        data.append({"date": date.strftime("%d-%m-%Y"), "nav": 100.0})
        date += datetime.timedelta(days=1)

    result = compute_metrics(data)
    assert result["volatility"] == 0