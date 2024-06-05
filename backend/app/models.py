from sqlalchemy import Column, Integer, String, Float
from .database import Base


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
