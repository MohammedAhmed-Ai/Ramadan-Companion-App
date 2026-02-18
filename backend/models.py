from sqlalchemy import Column, Integer, String, Boolean, Date, Float, Text
from .database import Base

class DailyRecord(Base):
    __tablename__ = "daily_records"

    date = Column(Date, primary_key=True, index=True)

    # Fard Prayers
    fajr = Column(Boolean, default=False)
    dhuhr = Column(Boolean, default=False)
    asr = Column(Boolean, default=False)
    maghrib = Column(Boolean, default=False)
    isha = Column(Boolean, default=False)

    # Sunnah Prayers
    fajr_sunnah = Column(Boolean, default=False)
    dhuhr_sunnah = Column(Boolean, default=False)
    maghrib_sunnah = Column(Boolean, default=False)
    isha_sunnah = Column(Boolean, default=False)

    # Night Prayers
    taraweeh = Column(Boolean, default=False)
    shaf_and_witr = Column(Boolean, default=False)
    qiyam = Column(Boolean, default=False)

    # Quran
    quran_reading = Column(Boolean, default=False)
    juz_read = Column(String, nullable=True)

    # Habits / Adhkar
    morning_adhkar = Column(Boolean, default=False)
    evening_adhkar = Column(Boolean, default=False)
    dua_before_iftar = Column(Boolean, default=False)

    # Productivity
    ai_study_session = Column(Boolean, default=False) # Changed from study_session to align with plan

    # Journaling
    daily_journal = Column(Text, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    ai_encouraging_message = Column(Text, nullable=True)
