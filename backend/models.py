import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from db import Base

class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    expected_brand = Column(String, nullable=False)
    detected_brand = Column(String, nullable=False)
    status = Column(String, nullable=False) # "genuine", "suspicious", "fake"
    confidence = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
