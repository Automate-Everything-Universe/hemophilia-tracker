from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(255), unique=True, nullable=True)
    last_name = Column(String(255), unique=True, nullable=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    peak_level = Column(Float(2), nullable=True)
    time_elapsed = Column(Float(2), nullable=True)
    second_level_measurement = Column(Float(2), nullable=True)
    weekly_infusions = Column(String(1000), nullable=True)

class UserLog(Base):
    __tablename__ = "user_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    ip_address = Column(String)
    browser = Column(String)
    operating_system = Column(String)
    language_preferences = Column(String)
    time_zone = Column(String)
    referrer = Column(String)
    cookies = Column(String)
    route_accessed = Column(String)
    number_of_pictures = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

