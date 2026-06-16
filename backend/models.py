from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String, unique=True, index=True, nullable=False)
    name       = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    portfolio_items = relationship("PortfolioItem", back_populates="user")
    goals           = relationship("Goal", back_populates="user")


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"))
    fund_code   = Column(Integer, nullable=False)
    fund_name   = Column(String, nullable=False)
    units       = Column(Float, nullable=False)
    buy_nav     = Column(Float, nullable=False)
    invested_on = Column(DateTime, default=datetime.utcnow)
    created_at  = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="portfolio_items")


class Goal(Base):
    __tablename__ = "goals"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"))
    name           = Column(String, nullable=False)
    target_amount  = Column(Float, nullable=False)
    target_years   = Column(Integer, nullable=False)
    risk_level     = Column(String, default="moderate")
    monthly_sip    = Column(Float, nullable=False)
    created_at     = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="goals")