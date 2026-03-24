import io
import os
import json
from google.cloud import vision

def analyze_brand_authenticity(image_path: str, expected_brand: str) -> dict:
    """
    Analyzes an image using Google Cloud Vision API and compares against the expected brand.
    Returns whether the product is considered genuine or fake based on logos and text.
    """
    # 0. Initialize the client using environment-based credentials if available
    try:
        google_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
        if google_json:
            # Parse the JSON string from environment variable
            info = json.loads(google_json)
            client = vision.ImageAnnotatorClient.from_service_account_info(info)
        else:
            # Fallback to default (filesystem check)
            client = vision.ImageAnnotatorClient()
    except Exception as e:
        return {"error": f"Failed to initialize Vision API. Setup error: {str(e)}"}

    # Read the image file
    try:
        with io.open(image_path, 'rb') as image_file:
            content = image_file.read()
    except FileNotFoundError:
        return {"error": f"Image not found at path: {image_path}"}

    image = vision.Image(content=content)

    try:
        # 1. Detect Logos
        logo_response = client.logo_detection(image=image)
        if logo_response.error.message:
            return {"error": f"Vision API Logo Error: {logo_response.error.message}"}

        logos = logo_response.logo_annotations
        detected_logos = [logo.description.lower() for logo in logos]

        # 2. Detect Text
        text_response = client.text_detection(image=image)
        if text_response.error.message:
            return {"error": f"Vision API Text Error: {text_response.error.message}"}
        
        texts = text_response.text_annotations
        detected_text = texts[0].description.lower() if texts else ""

        # 3. Simple Explainable Verification Logic
        expected_brand_lower = expected_brand.lower()
        
        # Check if the expected brand is in the detected logos
        logo_match = any(expected_brand_lower in logo for logo in detected_logos)
        
        # Check if the expected brand is in the detected text (OCR)
        text_match = expected_brand_lower in detected_text

        # Determine Status and Confidence
        if logo_match and text_match:
            status = "genuine"
            confidence = 95.0  # High confidence if both logo and text match
        elif logo_match:
            status = "genuine"
            confidence = 80.0  # Good confidence if logo is officially recognized
        elif text_match:
            status = "suspicious"
            confidence = 50.0  # Text matches, but no official logo detected. Might be fake.
        else:
            status = "fake"
            confidence = 90.0  # Neither logo nor text matches the expected brand

        return {
            "success": True,
            "expected_brand": expected_brand,
            "detected_brand": expected_brand if (logo_match or text_match) else "Unknown",
            "status": status,
            "confidence": confidence,
            "raw_data": {
                "detected_logos": [logo.description for logo in logos],
                "detected_text": texts[0].description.strip() if texts else ""
            }
        }

    except Exception as e:
        return {"error": str(e)}
# def analyze_brand_authenticity(image_path: str, expected_brand: str) -> dict:
#     if expected_brand.lower() in ["nike", "adidas", "puma"]:
#         return {
#             "success": True,
#             "detected_brand": expected_brand,
#             "status": "genuine",
#             "confidence": 92.5
#         }
#     else:
#         return {
#             "success": True,
#             "detected_brand": "unknown",
#             "status": "suspicious",
#             "confidence": 60.0
#         }