from sqlalchemy.orm import Session
from . import models, schemas
from datetime import date

def get_record(db: Session, record_date: date):
    return db.query(models.DailyRecord).filter(models.DailyRecord.date == record_date).first()

def get_records(db: Session, skip: int = 0, limit: int = 30):
    return db.query(models.DailyRecord).order_by(models.DailyRecord.date.desc()).offset(skip).limit(limit).all()

def create_record(db: Session, record: schemas.DailyRecordCreate):
    # Check if record exists
    existing_record = get_record(db, record.date)
    if existing_record:
        return existing_record
        
    db_record = models.DailyRecord(**record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def update_record(db: Session, record_date: date, record_update: schemas.DailyRecordUpdate):
    db_record = get_record(db, record_date)
    if not db_record:
        # If record doesn't exist, create it (upsert behavior for checking boxes on a new day)
        # However, update usually assumes existence. Let's return None if not found, 
        # but in UI usage, we usually fetch first.
        # Actually, let's implement upsert logic in the route or here.
        # For simplicity, if not found, we return None and let route handle 404.
        return None
    
    update_data = record_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_record, key, value)

    db.commit()
    db.refresh(db_record)
    return db_record
