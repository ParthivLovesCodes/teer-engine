from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, Date, String
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from pydantic import BaseModel
from datetime import date, timedelta
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from collections import Counter
# --- 1. DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./teer_data.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TeerResult(Base):
    __tablename__ = "teer_results"
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True) 
    result_date = Column(Date, index=True)
    fr = Column(Integer)
    sr = Column(Integer)



# --- 2. PYDANTIC SCHEMAS ---
class ResultCreate(BaseModel):
    city: str
    result_date: date
    fr: int
    sr: int

class ResultResponse(ResultCreate):
    id: int
    class Config:
        from_attributes = True

# --- NEW: Prediction Database Model ---
class TeerPrediction(Base):
    __tablename__ = "teer_predictions"
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True)
    target_date = Column(String, unique=True, index=True) # e.g., '2026-10-22'
    numbers = Column(String) # Comma-separated list of all generated targets

class PredictionCreate(BaseModel):
    city: str
    target_date: str
    numbers: str
Base.metadata.create_all(bind=engine)
# --- 3. CORE PREDICTION LOGIC ---
PROFILES = {
    "V6.0": {
        "w_recent_sr": 0.6, "w_recent_fr": 0.3, "w_house": 0.2, 
        "w_ending": 0.2, "w_infect": 0.3, "w_cold": 0.15, "decay": 0.75
    }
}

def get_value(digit):
    val_map = {0:5, 1:6, 2:7, 3:8, 4:9, 5:0, 6:1, 7:2, 8:3, 9:4}
    return val_map[digit]

def generate_shield(n):
    h = n // 10
    e = n % 10
    palti = (e * 10) + h
    house_cut = (get_value(h) * 10) + e
    ending_cut = (h * 10) + get_value(e)
    full_cut = (get_value(h) * 10) + get_value(e)
    family = [n, palti, house_cut, ending_cut, full_cut]
    return list(dict.fromkeys(family))

def get_infection_data(current_city: str, db: Session):
    other_city = 'Shillong' if current_city.lower() == 'khanapara' else 'Khanapara'
    last_result = db.query(TeerResult).filter(TeerResult.city == other_city).order_by(TeerResult.result_date.desc()).first()
    
    if last_result:
        return (last_result.fr // 10, last_result.fr % 10), (last_result.sr // 10, last_result.sr % 10), other_city
    return None, None, None

# --- 4. FASTAPI APPLICATION ---
app = FastAPI(title="Teer Prediction API - V6.0 Evasion Protocol")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all frontend domains to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/results", response_model=ResultResponse)
def add_daily_result(result: ResultCreate, db: Session = Depends(get_db)):
    existing = db.query(TeerResult).filter(
        TeerResult.city == result.city, TeerResult.result_date == result.result_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Result already exists.")
        
    db_result = TeerResult(**result.model_dump())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result
@app.get("/api/history/{city}")
def get_history(city: str, limit: int = 100, db: Session = Depends(get_db)):
    results = db.query(TeerResult).filter(TeerResult.city == city.capitalize()).order_by(TeerResult.result_date.desc()).limit(limit).all()
    return results
@app.get("/api/predict/{city}")
def generate_prediction(city: str, db: Session = Depends(get_db)):
    # Fetch 30 days of data for the learning model
    results = db.query(TeerResult).filter(TeerResult.city == city.capitalize()).order_by(TeerResult.result_date.desc()).limit(30).all()
    
    if not results:
        raise HTTPException(status_code=400, detail="Need history data to predict")
        
    scores = {i: 0.0 for i in range(100)}
    
    # --- PHASE 1: V6.0 BASE LOGIC (Time Decay & Gravity) ---
    for i, row in enumerate(results):
        decay = 0.95 ** i # Recent days are mathematically heavier
        scores[row.fr] += 1.0 * decay
        scores[row.sr] += 0.6 * decay
        
        # Standard Value Cuts (+50)
        cut_fr = (row.fr + 50) % 100
        cut_sr = (row.sr + 50) % 100
        scores[cut_fr] += 0.4 * decay
        scores[cut_sr] += 0.2 * decay

    # --- PHASE 2: V7.0 DYNAMIC LEARNING MODULE ---
    # 1. Analyze current trends
    recent_7_fr = [r.fr for r in results[:7]]
    odd_count = sum(1 for n in recent_7_fr if n % 2 != 0)
    is_odd_heavy = odd_count > 3
    
    all_nums = [r.fr for r in results] + [r.sr for r in results]
    hot_numbers = [num for num, count in Counter(all_nums).most_common(5)]
    
    joras = [0, 11, 22, 33, 44, 55, 66, 77, 88, 99]
    jora_hits = sum(1 for n in all_nums if n in joras)
    jora_trending = jora_hits >= 4 # If 4+ doubles dropped recently, bookies are pushing pairs
    
    # 2. Inject Dynamic Multipliers
    for num in scores:
        # A. Odd/Even Skew Riding
        if is_odd_heavy and num % 2 != 0:
            scores[num] += 1.5
        elif not is_odd_heavy and num % 2 == 0:
            scores[num] += 1.5
            
        # B. Hot Number Momentum
        if num in hot_numbers:
            scores[num] += 2.0
            
        # C. Jora (Double) Injection
        if jora_trending and num in joras:
            scores[num] += 2.5

    # --- PHASE 3: SELECT & FORMAT TARGETS ---
    sorted_targets = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    raw_bait = [x[0] for x in sorted_targets[:20]]
    
    shields = []
    # Generate Evasion Shields for the Top 5 most dangerous targets
    for bait in raw_bait[:5]: 
        evasion = [
            (bait + 50) % 100,             # Value cut
            (bait + 1) % 100,              # +1 shift
            (bait - 1) % 100,              # -1 shift
            int(str(bait)[::-1]) if bait > 9 else bait * 10 # Reverse (e.g. 42 -> 24)
        ]
        shields.append({
            "bait": f"{bait:02d}",
            "evasion_hits": [f"{h:02d}" for h in set(evasion)]
        })
        
    return {
        "raw_bait_targets": [f"{b:02d}" for b in raw_bait],
        "evasion_shields": shields
    }
@app.delete("/api/results/{result_id}")
def delete_result(result_id: int, db: Session = Depends(get_db)):
    db_result = db.query(TeerResult).filter(TeerResult.id == result_id).first()
    if not db_result:
        raise HTTPException(status_code=404, detail="Result not found")
    db.delete(db_result)
    db.commit()
    return {"message": "Deleted successfully"}
@app.get("/api/analytics/{city}")
def get_analytics(city: str, db: Session = Depends(get_db)):
    results = db.query(TeerResult).filter(TeerResult.city == city.capitalize()).order_by(TeerResult.result_date.desc()).limit(30).all()
    
    if not results:
        raise HTTPException(status_code=404, detail="Not enough data for analytics")

    fr_list = [r.fr for r in results]
    sr_list = [r.sr for r in results]
    all_nums = fr_list + sr_list

    num_counts = Counter(all_nums)
    # Expanded to show top 8 to handle ties better
    hot_numbers = [num for num, count in num_counts.most_common(8)]
    cold_numbers = [num for num, count in num_counts.most_common()[-8:]]

    # --- NEW: House and Ending Extraction ---
    # House = tens digit (e.g., 45 -> 4). Ending = units digit (e.g., 45 -> 5)
    houses = [n // 10 for n in all_nums]
    endings = [n % 10 for n in all_nums]
    
    hot_houses = [h for h, c in Counter(houses).most_common(3)]
    hot_endings = [e for e, c in Counter(endings).most_common(3)]

    joras = [0, 11, 22, 33, 44, 55, 66, 77, 88, 99]
    jora_hits = sum(1 for n in all_nums if n in joras)
    
    recent_7_fr = fr_list[:7]
    odd_count = sum(1 for n in recent_7_fr if n % 2 != 0)
    skew = "Odd-Heavy" if odd_count > 3 else "Even-Heavy"

    return {
        "days_analyzed": len(results),
        "hot_numbers": hot_numbers,
        "cold_numbers": cold_numbers,
        "hot_houses": hot_houses,
        "hot_endings": hot_endings,
        "jora_hits": jora_hits,
        "jora_probability": round((jora_hits / (len(results) * 2)) * 100, 1),
        "fr_odd_even_skew": skew,
        "odd_percentage": round((odd_count / 7) * 100, 1)
    }

# --- NEW: Save and Fetch Predictions ---
@app.post("/api/predictions")
def save_prediction(data: PredictionCreate, db: Session = Depends(get_db)):
    # Check if a prediction for this date already exists
    existing = db.query(TeerPrediction).filter(
        TeerPrediction.city == data.city.capitalize(),
        TeerPrediction.target_date == data.target_date
    ).first()
    
    if existing:
        existing.numbers = data.numbers
    else:
        new_pred = TeerPrediction(city=data.city.capitalize(), target_date=data.target_date, numbers=data.numbers)
        db.add(new_pred)
    
    db.commit()
    return {"message": "Prediction archived for tracking!"}

@app.get("/api/predictions/{city}")
def get_predictions(city: str, db: Session = Depends(get_db)):
    preds = db.query(TeerPrediction).filter(TeerPrediction.city == city.capitalize()).all()
    # Return as a dictionary { "2026-10-22": "45,12,89...", ... }
    return {p.target_date: p.numbers for p in preds}