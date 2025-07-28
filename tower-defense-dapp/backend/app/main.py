from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from app.db import SessionLocal, Player, init_db
from datetime import datetime
import json

init_db()
app = FastAPI()

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PlayerUpdate(BaseModel):
    address: str
    score: int
    towers: int

@app.get("/api/leaderboard")
def leaderboard(limit: int = 10):
    with SessionLocal() as db:
        rows = db.execute(select(Player).order_by(Player.score.desc()).limit(limit)).scalars().all()
        return [{"address": r.address, "score": r.score, "towers": r.towers} for r in rows]

@app.post("/api/sync")
def sync(update: PlayerUpdate):
    with SessionLocal() as db:
        p = db.execute(select(Player).where(Player.address == update.address)).scalar_one_or_none()
        if p is None:
            p = Player(address=update.address, score=update.score, towers=update.towers, last_seen=datetime.utcnow())
            db.add(p)
        else:
            p.score = update.score
            p.towers = update.towers
            p.last_seen = datetime.utcnow()
        db.commit()
        return {"ok": True}

# Simple chat manager
class ConnectionManager:
    def __init__(self):
        self.active = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active.discard(websocket)

    async def broadcast(self, message: dict):
        data = json.dumps(message)
        to_drop = []
        for ws in self.active:
            try:
                await ws.send_text(data)
            except Exception:
                to_drop.append(ws)
        for ws in to_drop:
            self.disconnect(ws)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def chat_ws(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                payload = json.loads(raw)
            except Exception:
                continue
            # echo/broadcast
            if isinstance(payload, dict) and payload.get("type") == "chat":
                await manager.broadcast({"type": "chat", "user": payload.get("user", "anon"), "message": payload.get("message", "")})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
