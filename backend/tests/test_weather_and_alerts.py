import pytest
from unittest.mock import AsyncMock, patch
from app.services.alerts.advisory_engine import advisory_engine

def test_alerts_listing_and_filtering(client):
    res = client.get("/api/v1/alerts")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert data["active_count"] > 0
    assert "alerts" in data
    
    # Check severity filtering
    severe_res = client.get("/api/v1/alerts?severity=Severe")
    assert severe_res.status_code == 200
    severe_data = severe_res.json()
    for item in severe_data["alerts"]:
        assert item["severity"].lower() == "severe"

def test_alerts_simulated_tag_present(client):
    res = client.get("/api/v1/alerts")
    assert res.status_code == 200
    alerts = res.json()["alerts"]
    simulated_alerts = [a for a in alerts if a["is_simulated"]]
    assert len(simulated_alerts) > 0
    for a in simulated_alerts:
        assert "SIMULATED" in a["title"]

def test_advisory_rules_engine_rain_umbrella():
    # Mock heavy rain scenario
    weather_rainy = {
        "current": {"temperature": 27.0, "rain": 4.5, "wind_speed": 20.0, "weather_code": 65},
        "hourly": [{"precipitation_probability": 85} for _ in range(12)]
    }
    advisories = advisory_engine.evaluate_weather(weather_rainy)
    categories = [adv.category for adv in advisories]
    assert "Rain & Umbrella" in categories
    assert "Agriculture & Irrigation" in categories

    umbrella_adv = next(a for a in advisories if a.category == "Rain & Umbrella")
    assert "High Probability of Rain" in umbrella_adv.headline
    assert umbrella_adv.level in ["Warning", "Caution"]

def test_advisory_rules_engine_heatwave():
    weather_hot = {
        "current": {"temperature": 42.5, "apparent_temperature": 44.0, "rain": 0.0, "wind_speed": 10.0, "weather_code": 0},
        "hourly": [{"precipitation_probability": 0} for _ in range(12)]
    }
    advisories = advisory_engine.evaluate_weather(weather_hot)
    heat_adv = next(a for a in advisories if a.category == "Heat Safety & Exposure")
    assert heat_adv.level in ["Emergency", "Warning"]
    assert "Severe Heat Warning" in heat_adv.headline

def test_nwp_integration_status(client):
    res = client.get("/api/v1/nwp/status")
    assert res.status_code == 200
    data = res.json()
    assert "open_meteo" in data
    assert data["open_meteo"]["status"] == "OPERATIONAL"
    assert "imd_mausam" in data
    assert data["imd_mausam"]["status"] == "PENDING_CREDENTIALS"
