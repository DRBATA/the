from fastapi import FastAPI, Query, File, UploadFile, Form
from pydantic import BaseModel
from typing import List, Union, Optional
import json
import os

app = FastAPI()

# --- Data Models ---
class DrinkMetadata(BaseModel):
    brand: Union[List[str], str]
    sugar_free: Union[List[bool], bool]
    price_aed_serving: Union[List[str], List[float], str, float]
    sodium_mg: Union[List[str], List[int], str, int]
    data_type: Optional[str] = None
    # Optional extended fields for detailed drinks
    format: Optional[str] = None
    potassium_mg: Optional[int] = None
    magnesium_mg: Optional[int] = None
    calcium_mg: Optional[int] = None
    calories_kcal: Optional[int] = None
    hydration_factor: Optional[int] = None
    available_in_uae: Optional[bool] = None
    last_checked: Optional[str] = None

class DrinkChunk(BaseModel):
    id: str
    text: str
    metadata: DrinkMetadata

# --- Load Data ---
CHUNKS_FILE = os.path.join(os.path.dirname(__file__), '../../drink_chunks.jsonl')
chunks = []
if os.path.exists(CHUNKS_FILE):
    with open(CHUNKS_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            data = json.loads(line)
            # Flexible handling for different chunk metadata
            chunk = DrinkChunk(
                id=data['id'],
                text=data['text'],
                metadata=DrinkMetadata(**data['metadata'])
            )
            chunks.append(chunk)

# --- API Endpoints ---
@app.get('/get_drink_info', response_model=DrinkChunk)
def get_drink_info(drink_id: str = Query(..., description="Unique drink or product identifier")):
    for chunk in chunks:
        if chunk.id == drink_id:
            return chunk
    return {"error": "Drink not found"}

@app.get('/list_drinks', response_model=List[str])
def list_drinks():
    return [chunk.id for chunk in chunks]

@app.get('/search_drinks', response_model=List[DrinkChunk])
def search_drinks(query: str = Query(..., description="Search term for drink text or brand")):
    results = []
    query_lower = query.lower()
    for chunk in chunks:
        if query_lower in chunk.text.lower() or (isinstance(chunk.metadata.brand, list) and any(query_lower in b.lower() for b in chunk.metadata.brand)) or (isinstance(chunk.metadata.brand, str) and query_lower in chunk.metadata.brand.lower()):
            results.append(chunk)
    return results

# --- New: Analyze Drink Label ---
class NutritionInfo(BaseModel):
    sodium_mg: Optional[int]
    potassium_mg: Optional[int]
    sugar_g: Optional[int]
    caffeine_mg: Optional[int]
    eco_score: Optional[str]

@app.post("/analyze_drink_label", response_model=NutritionInfo)
async def analyze_drink_label(user_id: str = Form(...), image: UploadFile = File(...)):
    # Placeholder: In production, run OCR/image analysis here!
    # For now, return dummy data
    return NutritionInfo(
        sodium_mg=200,
        potassium_mg=100,
        sugar_g=0,
        caffeine_mg=50,
        eco_score="B"
    )

# --- New: Log Hydration Event ---
class HydrationEvent(BaseModel):
    user_id: str
    drink_id: str
    volume_ml: int
    timestamp: Optional[str]

@app.post("/log_hydration_event")
def log_hydration_event(event: HydrationEvent):
    # In production, save to database!
    return {"status": "success", "event": event}
