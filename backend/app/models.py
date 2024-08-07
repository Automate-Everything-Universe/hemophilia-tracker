from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(255), unique=True, nullable=True)
    last_name = Column(String(255), unique=True, nullable=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    weekly_infusions = Column(String(1000), nullable=True)
    peak_level = Column(Float, nullable=False)

    measurements = relationship("Measurement", back_populates="user")


class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    peak_level = Column(Float(2), nullable=False)
    time_elapsed = Column(Float(2), nullable=False)
    second_level_measurement = Column(Float(2), nullable=False)
    decay_constant = Column(Float(2), nullable=False)
    halving_time = Column(Float(2), nullable=False)
    comment = Column(String(100), nullable=True)

    user = relationship("User", back_populates="measurements")
