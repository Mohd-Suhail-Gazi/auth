from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the directory containing this file to sys.path to allow local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import shutil
import uuid

from vision_service import analyze_brand_authenticity
from db import engine, get_db
from models import Base, ScanHistory

# Create the database tables
Base.metadata.create_all(bind=engine)

# Auto-set Google Credentials
# Priority 2: Local file path (default fallback - only used if GOOGLE_CREDENTIALS_JSON env var is missing)
if not os.getenv("GOOGLE_CREDENTIALS_JSON"):
    CREDENTIALS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "credentials", "sylvan-chess-490510-k6-9210ee07c4a2.json")
    if not os.path.exists(CREDENTIALS_PATH):
        CREDENTIALS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "credentials", "key.json")
    
    if os.path.exists(CREDENTIALS_PATH):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDENTIALS_PATH

app = FastAPI(title="Fake Brand Detector API", version="1.0.0")

# Allow requests from the React frontend (Environment-based)
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
# Clean up whitespace and ensure common production URLs are included
origins = [o.strip() for o in origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount the uploads directory to serve images statically
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Fake Brand Detector API is running"}

@app.post("/analyze")
async def analyze_product(
    file: UploadFile = File(...),
    expected_brand: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Core API Flow:
    1. Upload & save image
    2. Run Google Vision API
    3. Detect brand & apply fake detection logic
    4. Store result in DB
    5. Return comprehensive response
    """
    # 1. Save Image
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_extension}"
    file_location = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    # 2 & 3. Run Vision API and Fake Detection Logic
    analysis = analyze_brand_authenticity(file_location, expected_brand)
    
    # 4. Store Result in DB
    db_id = None
    if analysis.get("success"):
        db_scan = ScanHistory(
            image_path=f"/uploads/{unique_filename}",
            expected_brand=expected_brand,
            detected_brand=analysis.get("detected_brand", "Unknown"),
            status=analysis.get("status", "error"),
            confidence=analysis.get("confidence", 0.0)
        )
        db.add(db_scan)
        db.commit()
        db.refresh(db_scan)
        db_id = db_scan.id
    
    # 5. Return Response
    return {
        "success": analysis.get("success", False),
        "message": analysis.get("error", "Analysis complete"),
        "data": {
            "id": db_id,
            "filename": unique_filename,
            "file_url": f"/uploads/{unique_filename}",
            "analysis_result": analysis
        }
    }

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    """
    Retrieve the scan history from the database, newest first.
    """
    scans = db.query(ScanHistory).order_by(ScanHistory.timestamp.desc()).all()
    return {"success": True, "history": scans}
