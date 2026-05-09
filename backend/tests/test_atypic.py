"""Backend tests for Atypic Calendar API."""
import os
import pytest
import requests
from datetime import date, timedelta

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL") or "https://0988f4bb-9950-48f7-8395-1af641cf2f3c.preview.emergentagent.com"
API = BASE_URL.rstrip("/") + "/api"

# Use a unique test date far in the past to avoid collisions
TEST_DATE = "2099-01-15"
CLEANUP_IDS: list = []


@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    # Cleanup any created events on test date
    r = requests.get(f"{API}/events/by-date/{TEST_DATE}")
    if r.ok:
        for ev in r.json():
            requests.delete(f"{API}/events/{ev['id']}")


# ----------------- Templates -----------------
def test_templates_returns_10():
    r = requests.get(f"{API}/templates")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 10
    ids = {t["id"] for t in data}
    expected = {"medecin", "restaurant", "travail-profond", "reunion", "courses",
                "marche", "sieste", "sport", "lecture", "meditation"}
    assert expected.issubset(ids)
    # Ensure no _id leakage
    for t in data:
        assert "_id" not in t


# ----------------- Event creation & persistence -----------------
def test_create_event_and_get_by_date():
    # Cleanup first
    r = requests.get(f"{API}/events/by-date/{TEST_DATE}")
    for ev in r.json():
        requests.delete(f"{API}/events/{ev['id']}")

    payload = {
        "title": "TEST_Réunion",
        "date": TEST_DATE,
        "start_time": "10:00",
        "duration_minutes": 60,
        "type": "task",
        "cognitive_impact": -25,
        "social_impact": -30,
        "sensory_impact": -15,
    }
    r = requests.post(f"{API}/events", json=payload)
    assert r.status_code == 200, r.text
    ev = r.json()
    assert ev["title"] == "TEST_Réunion"
    assert "id" in ev
    assert "_id" not in ev
    CLEANUP_IDS.append(ev["id"])

    # GET to verify persistence
    r2 = requests.get(f"{API}/events/by-date/{TEST_DATE}")
    assert r2.status_code == 200
    items = r2.json()
    assert any(x["id"] == ev["id"] for x in items)
    for x in items:
        assert "_id" not in x


def test_events_by_date_sorted_by_start_time():
    # Add a 2nd event earlier in the day
    payload = {
        "title": "TEST_Earlier",
        "date": TEST_DATE,
        "start_time": "08:00",
        "duration_minutes": 30,
        "type": "task",
        "cognitive_impact": -5,
        "social_impact": -5,
        "sensory_impact": -5,
    }
    r = requests.post(f"{API}/events", json=payload)
    assert r.status_code == 200
    CLEANUP_IDS.append(r.json()["id"])

    r2 = requests.get(f"{API}/events/by-date/{TEST_DATE}")
    items = r2.json()
    times = [x["start_time"] for x in items]
    assert times == sorted(times)


# ----------------- Capacity exceeded -----------------
def test_create_event_blocked_when_capacity_exceeded():
    payload = {
        "title": "TEST_TooMuch",
        "date": TEST_DATE,
        "start_time": "14:00",
        "duration_minutes": 60,
        "type": "task",
        "cognitive_impact": -100,
        "social_impact": -100,
        "sensory_impact": -100,
    }
    r = requests.post(f"{API}/events", json=payload)
    assert r.status_code == 400
    body = r.json()
    assert "Cette activité dépasse votre capacité énergétique actuelle." in body.get("detail", "")


def test_check_event_blocked_true():
    payload = {
        "title": "TEST_Check",
        "date": TEST_DATE,
        "start_time": "15:00",
        "duration_minutes": 60,
        "type": "task",
        "cognitive_impact": -100,
        "social_impact": 0,
        "sensory_impact": 0,
    }
    r = requests.post(f"{API}/events/check", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["blocked"] is True
    assert "cognitive" in data["blocked_axes"]


def test_check_event_blocked_false():
    payload = {
        "title": "TEST_Check2",
        "date": "2099-02-20",
        "start_time": "09:00",
        "duration_minutes": 60,
        "type": "task",
        "cognitive_impact": -10,
        "social_impact": -10,
        "sensory_impact": -10,
    }
    r = requests.post(f"{API}/events/check", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["blocked"] is False
    assert data["blocked_axes"] == []


# ----------------- Energy -----------------
def test_get_day_energy():
    r = requests.get(f"{API}/energy/{TEST_DATE}")
    assert r.status_code == 200
    data = r.json()
    assert data["date"] == TEST_DATE
    for k in ["cognitive", "social", "sensory"]:
        assert 0 <= data[k] <= 100
    assert "fatigue_score" in data
    assert "overload" in data
    assert isinstance(data["overload"], bool)


def test_get_range_energy_fills_empty_days():
    r = requests.get(f"{API}/energy", params={"start_date": "2099-03-01", "end_date": "2099-03-07"})
    assert r.status_code == 200
    data = r.json()
    assert "days" in data
    assert len(data["days"]) == 7
    # Empty range should be all 100
    for d in data["days"]:
        assert d["cognitive"] == 100
        assert d["social"] == 100
        assert d["sensory"] == 100
        assert d["events_count"] == 0


# ----------------- Stats -----------------
def test_get_stats():
    r = requests.get(f"{API}/stats")
    assert r.status_code == 200
    data = r.json()
    assert "averages" in data
    assert "overload_days" in data
    assert "total_events" in data
    assert "days" in data
    for k in ["cognitive", "social", "sensory", "fatigue_score"]:
        assert k in data["averages"]


# ----------------- Suggestions -----------------
def test_get_suggestions_default_calm():
    r = requests.get(f"{API}/suggestions/2099-04-10")
    assert r.status_code == 200
    data = r.json()
    assert "suggestions" in data
    assert len(data["suggestions"]) >= 1
    # When no events, should have calm suggestion
    types = [s["type"] for s in data["suggestions"]]
    assert "calm" in types


# ----------------- Update / Delete -----------------
def test_update_event():
    payload = {
        "title": "TEST_Update_Original",
        "date": "2099-05-01",
        "start_time": "11:00",
        "duration_minutes": 30,
        "type": "task",
        "cognitive_impact": -10,
        "social_impact": -10,
        "sensory_impact": -10,
    }
    r = requests.post(f"{API}/events", json=payload)
    assert r.status_code == 200
    eid = r.json()["id"]

    r2 = requests.put(f"{API}/events/{eid}", json={"title": "TEST_Update_Modified"})
    assert r2.status_code == 200
    assert r2.json()["title"] == "TEST_Update_Modified"

    # Verify
    r3 = requests.get(f"{API}/events/by-date/2099-05-01")
    found = [x for x in r3.json() if x["id"] == eid]
    assert len(found) == 1
    assert found[0]["title"] == "TEST_Update_Modified"

    # Cleanup
    requests.delete(f"{API}/events/{eid}")


def test_delete_event():
    payload = {
        "title": "TEST_ToDelete",
        "date": "2099-06-01",
        "start_time": "11:00",
        "duration_minutes": 30,
        "type": "task",
        "cognitive_impact": -5,
        "social_impact": -5,
        "sensory_impact": -5,
    }
    r = requests.post(f"{API}/events", json=payload)
    eid = r.json()["id"]

    r2 = requests.delete(f"{API}/events/{eid}")
    assert r2.status_code == 200
    assert r2.json().get("ok") is True

    # Verify gone
    r3 = requests.get(f"{API}/events/by-date/2099-06-01")
    assert not any(x["id"] == eid for x in r3.json())

    # Delete again -> 404
    r4 = requests.delete(f"{API}/events/{eid}")
    assert r4.status_code == 404
