# Orchestrator Agent (V1.1) - Minimal Chat Routing Example
# Requires: FastAPI, httpx (for async agent calls), uvicorn

from fastapi import FastAPI, Request
from pydantic import BaseModel
import httpx
import asyncio

app = FastAPI()

# Example endpoints for each agent (adjust as needed)
AGENT_ENDPOINTS = {
    "hydration": "http://localhost:8001/agent/hydration",
    "weather": "http://localhost:8002/agent/weather",
    "activity": "http://localhost:8003/agent/activity",
    "nutrition": "http://localhost:8004/agent/nutrition",
    "drinks": "http://localhost:8005/agent/drinks"
}

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    # Simple keyword-based routing (replace with LLM intent detection as needed)
    msg = req.message.lower()
    tasks = []
    if any(w in msg for w in ["drink", "hydration", "urine", "fluid", "water"]):
        tasks.append(call_agent("hydration", req))
    if any(w in msg for w in ["weather", "heat", "humidity", "temperature"]):
        tasks.append(call_agent("weather", req))
    if any(w in msg for w in ["step", "activity", "exercise", "workout", "run"]):
        tasks.append(call_agent("activity", req))
    if any(w in msg for w in ["food", "meal", "recipe", "nutrition", "choline", "ferment"]):
        tasks.append(call_agent("nutrition", req))
    if any(w in msg for w in ["label", "drink label", "scan", "eco score"]):
        tasks.append(call_agent("drinks", req))
    if not tasks:
        # Default to hydration agent if unsure
        tasks.append(call_agent("hydration", req))
    results = await asyncio.gather(*tasks)
    # Aggregate responses
    response = "\n---\n".join(results)
    return {"response": response}

@app.post("/log_hydration")
def log_hydration(log: HydrationLog):
    data = log.dict()
    # volume_ml is legacy, add for compatibility
    data["volume_ml"] = data["fluid_ml"]
    result = supabase_client.table("hydration_logs").insert(data).execute()
    if result.error:
        raise HTTPException(status_code=500, detail=str(result.error))
    return {"success": True, "message": "Hydration event logged."}

@app.get("/get_hydration_status")
def get_hydration_status(user_id: str):
    logs = supabase_client.table("hydration_logs").select("*").eq("user_id", user_id).execute()
    if logs.error:
        raise HTTPException(status_code=500, detail=str(logs.error))
    total_ml = sum((log.get("volume_ml") or log.get("fluid_ml") or 0) * (log.get("hydration_multiplier", 1.0) or 1.0) for log in logs.data)
    return {
        "user_id": user_id,
        "total_hydration_ml": total_ml,
        "log_count": len(logs.data),
        "logs": logs.data,
    }

async def call_agent(agent: str, req: ChatRequest) -> str:
    url = AGENT_ENDPOINTS[agent]
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(url, json=req.dict())
            if r.status_code == 200:
                return f"[{agent.capitalize()} Agent]: {r.json().get('response', r.text)}"
            else:
                return f"[{agent.capitalize()} Agent]: Error {r.status_code}"
    except Exception as e:
        return f"[{agent.capitalize()} Agent]: Exception {e}"

# To run: uvicorn orchestrator:app --reload
