from pydantic import BaseModel
from typing import Optional
from datetime import date

class DailyRecordBase(BaseModel):
    fajr: bool = False
    dhuhr: bool = False
    asr: bool = False
    maghrib: bool = False
    isha: bool = False
    
    fajr_sunnah: bool = False
    dhuhr_sunnah: bool = False
    maghrib_sunnah: bool = False
    isha_sunnah: bool = False
    
    taraweeh: bool = False
    shaf_and_witr: bool = False
    qiyam: bool = False
    
    quran_reading: bool = False
    juz_read: Optional[str] = None
    
    morning_adhkar: bool = False
    evening_adhkar: bool = False
    dua_before_iftar: bool = False
    
    ai_study_session: bool = False
    
    daily_journal: Optional[str] = None
    sentiment_score: Optional[float] = None
    ai_encouraging_message: Optional[str] = None

class DailyRecordCreate(DailyRecordBase):
    date: date

class DailyRecordUpdate(DailyRecordBase):
    pass

class DailyRecord(DailyRecordBase):
    date: date

    class Config:
        from_attributes = True
