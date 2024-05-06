from sqlalchemy import Column, Integer, Float, String, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql.sqltypes import DateTime

DATABASE_URL = "sqlite:///./hemophilia_tracker.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    factor_levels = relationship("FactorLevel", back_populates="user")

class FactorLevel(Base):
    __tablename__ = 'factor_levels'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    intake_factor_level = Column(Float)
    hours_after_measurement = Column(Float)
    timestamp = Column(DateTime)

    user = relationship("User", back_populates="factor_levels")

Base.metadata.create_all(bind=engine)
