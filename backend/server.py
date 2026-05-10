from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ----------------- Models -----------------
class EventBase(BaseModel):
    title: str
    date: str  # ISO date YYYY-MM-DD
    start_time: str  # HH:MM
    duration_minutes: int = 60
    type: Literal["task", "resource"] = "task"
    cognitive_impact: int = 0  # -100..100
    social_impact: int = 0
    sensory_impact: int = 0
    note: Optional[str] = None
    template_id: Optional[str] = None


class EventCreate(EventBase):
    pass


class Event(EventBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class EventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    type: Optional[Literal["task", "resource"]] = None
    cognitive_impact: Optional[int] = None
    social_impact: Optional[int] = None
    sensory_impact: Optional[int] = None
    note: Optional[str] = None


class Template(BaseModel):
    id: str
    name: str
    icon: str
    type: Literal["task", "resource"]
    cognitive_impact: int
    social_impact: int
    sensory_impact: int
    duration_minutes: int


class DayEnergy(BaseModel):
    date: str
    cognitive: int
    social: int
    sensory: int
    fatigue_score: int  # 0..100 (higher = more fatigue)
    overload: bool
    events_count: int


# ----------------- Templates -----------------
TEMPLATES: List[Template] = [
    Template(id="medecin", name="Médecin", icon="stethoscope", type="task",
             cognitive_impact=-15, social_impact=-40, sensory_impact=-25, duration_minutes=60),
    Template(id="restaurant", name="Restaurant", icon="utensils", type="task",
             cognitive_impact=-10, social_impact=-35, sensory_impact=-30, duration_minutes=90),
    Template(id="travail-profond", name="Travail profond", icon="brain", type="task",
             cognitive_impact=-40, social_impact=-5, sensory_impact=-15, duration_minutes=120),
    Template(id="reunion", name="Réunion", icon="users", type="task",
             cognitive_impact=-25, social_impact=-30, sensory_impact=-15, duration_minutes=60),
    Template(id="courses", name="Courses", icon="shopping-cart", type="task",
             cognitive_impact=-15, social_impact=-20, sensory_impact=-35, duration_minutes=45),
    Template(id="marche", name="Marche en forêt", icon="trees", type="resource",
             cognitive_impact=10, social_impact=5, sensory_impact=30, duration_minutes=45),
    Template(id="sieste", name="Sieste", icon="moon", type="resource",
             cognitive_impact=25, social_impact=10, sensory_impact=20, duration_minutes=30),
    Template(id="sport", name="Sport", icon="dumbbell", type="resource",
             cognitive_impact=15, social_impact=5, sensory_impact=10, duration_minutes=45),
    Template(id="lecture", name="Lecture", icon="book-open", type="resource",
             cognitive_impact=-5, social_impact=15, sensory_impact=20, duration_minutes=30),
    Template(id="meditation", name="Méditation", icon="lotus", type="resource",
             cognitive_impact=20, social_impact=10, sensory_impact=25, duration_minutes=15),
]


# ----------------- Helpers -----------------
def compute_day_energy(events: List[dict]) -> dict:
    cognitive = 100
    social = 100
    sensory = 100
    for e in events:
        cognitive += e.get("cognitive_impact", 0)
        social += e.get("social_impact", 0)
        sensory += e.get("sensory_impact", 0)
    cognitive = max(0, min(100, cognitive))
    social = max(0, min(100, social))
    sensory = max(0, min(100, sensory))
    avg = (cognitive + social + sensory) / 3
    fatigue_score = int(round(100 - avg))
    overload = cognitive < 20 or social < 20 or sensory < 20
    return {
        "cognitive": cognitive,
        "social": social,
        "sensory": sensory,
        "fatigue_score": fatigue_score,
        "overload": overload,
    }


# ----------------- Routes -----------------
@api_router.get("/")
async def root():
    return {"message": "Atypic Calendar API"}


@api_router.get("/templates", response_model=List[Template])
async def get_templates():
    return TEMPLATES


@api_router.get("/events/count")
async def events_count():
    n = await db.events.count_documents({})
    return {"count": n}


@api_router.get("/events", response_model=List[Event])
async def list_events(start_date: Optional[str] = None, end_date: Optional[str] = None):
    query = {}
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["date"] = {"$gte": start_date}
    docs = await db.events.find(query, {"_id": 0}).to_list(2000)
    docs.sort(key=lambda x: (x.get("date", ""), x.get("start_time", "")))
    return [Event(**d) for d in docs]


@api_router.get("/events/by-date/{date}", response_model=List[Event])
async def events_by_date(date: str):
    docs = await db.events.find({"date": date}, {"_id": 0}).to_list(500)
    docs.sort(key=lambda x: x.get("start_time", ""))
    return [Event(**d) for d in docs]


@api_router.post("/events/check")
async def check_event(payload: EventCreate):
    """Check if adding an event would push any energy below 0. Returns projected energies."""
    docs = await db.events.find({"date": payload.date}, {"_id": 0}).to_list(500)
    cog = 100 + sum(e.get("cognitive_impact", 0) for e in docs) + payload.cognitive_impact
    soc = 100 + sum(e.get("social_impact", 0) for e in docs) + payload.social_impact
    sen = 100 + sum(e.get("sensory_impact", 0) for e in docs) + payload.sensory_impact
    blocked = cog < 0 or soc < 0 or sen < 0
    blocked_axes = []
    if cog < 0:
        blocked_axes.append("cognitive")
    if soc < 0:
        blocked_axes.append("social")
    if sen < 0:
        blocked_axes.append("sensory")
    return {
        "blocked": blocked,
        "blocked_axes": blocked_axes,
        "projected": {
            "cognitive": max(0, min(100, cog)),
            "social": max(0, min(100, soc)),
            "sensory": max(0, min(100, sen)),
        },
        "raw": {"cognitive": cog, "social": soc, "sensory": sen},
    }


@api_router.post("/events", response_model=Event)
async def create_event(payload: EventCreate):
    # Validate energy capacity
    docs = await db.events.find({"date": payload.date}, {"_id": 0}).to_list(500)
    cog = 100 + sum(e.get("cognitive_impact", 0) for e in docs) + payload.cognitive_impact
    soc = 100 + sum(e.get("social_impact", 0) for e in docs) + payload.social_impact
    sen = 100 + sum(e.get("sensory_impact", 0) for e in docs) + payload.sensory_impact
    if cog < 0 or soc < 0 or sen < 0:
        raise HTTPException(
            status_code=400,
            detail="Cette activité dépasse votre capacité énergétique actuelle.",
        )
    event = Event(**payload.dict())
    await db.events.insert_one(event.dict())
    return event


@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, payload: EventUpdate):
    existing = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    await db.events.update_one({"id": event_id}, {"$set": updates})
    updated = await db.events.find_one({"id": event_id}, {"_id": 0})
    return Event(**updated)


@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str):
    res = await db.events.delete_one({"id": event_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"ok": True}


@api_router.get("/energy/{date}", response_model=DayEnergy)
async def get_day_energy(date: str):
    docs = await db.events.find({"date": date}, {"_id": 0}).to_list(500)
    energy = compute_day_energy(docs)
    return DayEnergy(date=date, events_count=len(docs), **energy)


@api_router.get("/energy")
async def get_range_energy(start_date: str, end_date: str):
    docs = await db.events.find(
        {"date": {"$gte": start_date, "$lte": end_date}}, {"_id": 0}
    ).to_list(2000)
    by_date: dict = {}
    for d in docs:
        by_date.setdefault(d["date"], []).append(d)

    # Build list of all dates in range
    start = datetime.fromisoformat(start_date).date()
    end = datetime.fromisoformat(end_date).date()
    days = []
    cur = start
    while cur <= end:
        ds = cur.isoformat()
        e = compute_day_energy(by_date.get(ds, []))
        days.append({
            "date": ds,
            "events_count": len(by_date.get(ds, [])),
            **e,
        })
        cur += timedelta(days=1)
    return {"days": days}


@api_router.get("/stats")
async def get_stats(start_date: Optional[str] = None, end_date: Optional[str] = None):
    today = datetime.now(timezone.utc).date()
    if not start_date:
        start_date = (today - timedelta(days=6)).isoformat()
    if not end_date:
        end_date = today.isoformat()

    docs = await db.events.find(
        {"date": {"$gte": start_date, "$lte": end_date}}, {"_id": 0}
    ).to_list(2000)
    by_date: dict = {}
    for d in docs:
        by_date.setdefault(d["date"], []).append(d)

    start = datetime.fromisoformat(start_date).date()
    end = datetime.fromisoformat(end_date).date()
    days = []
    overload_days = 0
    cog_sum = soc_sum = sen_sum = fat_sum = 0
    cur = start
    n = 0
    while cur <= end:
        ds = cur.isoformat()
        e = compute_day_energy(by_date.get(ds, []))
        days.append({"date": ds, **e, "events_count": len(by_date.get(ds, []))})
        if e["overload"]:
            overload_days += 1
        cog_sum += e["cognitive"]
        soc_sum += e["social"]
        sen_sum += e["sensory"]
        fat_sum += e["fatigue_score"]
        n += 1
        cur += timedelta(days=1)

    return {
        "start_date": start_date,
        "end_date": end_date,
        "days": days,
        "averages": {
            "cognitive": round(cog_sum / n) if n else 100,
            "social": round(soc_sum / n) if n else 100,
            "sensory": round(sen_sum / n) if n else 100,
            "fatigue_score": round(fat_sum / n) if n else 0,
        },
        "overload_days": overload_days,
        "total_events": len(docs),
    }


@api_router.get("/suggestions/{date}")
async def get_suggestions(date: str):
    docs = await db.events.find({"date": date}, {"_id": 0}).to_list(500)
    energy = compute_day_energy(docs)
    suggestions = []

    if energy["cognitive"] < 30:
        suggestions.append({
            "type": "cognitive",
            "message": "Votre réserve cognitive devient faible. Une pause silencieuse pourrait aider.",
        })
    if energy["social"] < 30:
        suggestions.append({
            "type": "social",
            "message": "Votre réserve sociale devient faible. Privilégiez du temps seul ce soir.",
        })
    if energy["sensory"] < 30:
        suggestions.append({
            "type": "sensory",
            "message": "Votre réserve sensorielle est basse. Évitez les environnements bruyants.",
        })

    # Check for back-to-back tasks
    tasks = sorted([e for e in docs if e.get("type") == "task"], key=lambda x: x.get("start_time", ""))
    if len(tasks) >= 2:
        suggestions.append({
            "type": "pause",
            "message": "Ajoutez une pause entre vos rendez-vous pour respirer.",
        })

    if energy["fatigue_score"] > 60 and not any(e.get("type") == "resource" for e in docs):
        suggestions.append({
            "type": "resource",
            "message": "Une activité ressource (marche, sieste, lecture) pourrait vous aider.",
        })

    if not suggestions:
        suggestions.append({
            "type": "calm",
            "message": "Votre journée semble équilibrée. Prenez soin de vous.",
        })

    return {"date": date, "energy": energy, "suggestions": suggestions}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
