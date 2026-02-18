from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from . import crud, models, schemas
from .database import SessionLocal, engine, get_db
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ramadan Tracking App")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins matching user request
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
@app.post("/records/", response_model=schemas.DailyRecord)
def create_daily_record(record: schemas.DailyRecordCreate, db: Session = Depends(get_db)):
    db_record = crud.get_record(db, record_date=record.date)
    if db_record:
        raise HTTPException(status_code=400, detail="Record for this date already exists")
    return crud.create_record(db=db, record=record)

@app.get("/records/{record_date}", response_model=schemas.DailyRecord)
def read_daily_record(record_date: date, db: Session = Depends(get_db)):
    db_record = crud.get_record(db, record_date=record_date)
    if db_record is None:
        return schemas.DailyRecord(date=record_date) 
    return db_record

@app.put("/records/{record_date}", response_model=schemas.DailyRecord)
def update_daily_record(record_date: date, record: schemas.DailyRecordUpdate, db: Session = Depends(get_db)):
    db_record = crud.get_record(db, record_date=record_date)
    if not db_record:
         new_record_data = schemas.DailyRecordCreate(date=record_date, **record.model_dump())
         return crud.create_record(db=db, record=new_record_data)
         
    return crud.update_record(db=db, record_date=record_date, record_update=record)

@app.get("/records/", response_model=List[schemas.DailyRecord])
def read_records(skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    return crud.get_records(db, skip=skip, limit=limit)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

@app.post("/sentiment-analysis/")
def sentiment_analysis(text: str):
    if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
         return {
            "sentiment_score": 0.0,
            "ai_encouraging_message": "⚠️ Please configure GEMINI_API_KEY in .env file to use AI features."
        }

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"You are a spiritual Ramadan companion. The user wrote this about their day: '{text}'. Reply in short, warm, encouraging Arabic (max 2 sentences) validating their feelings and motivating them."
        response = model.generate_content(prompt)
        ai_message = response.text
        
        return {
            "sentiment_score": 0.9, 
            "ai_encouraging_message": ai_message
        }
        
    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "sentiment_score": 0.0,
            "ai_encouraging_message": "عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي. حاول مرة أخرى."
        }

# Mount static files
app.mount("/js", StaticFiles(directory="frontend/js"), name="js")
# We can mount the whole frontend directory to /static if needed, 
# but mounting specific folders keeps root clean for API and HTML routes.
# If user adds css folder later, we can mount it too.

# Frontend Routes
@app.get("/")
def read_root():
    return FileResponse("frontend/index.html")

@app.get("/stats")
def read_stats():
    return FileResponse("frontend/stats.html")
