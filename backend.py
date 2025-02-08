from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import base64
from typing import Dict
import uvicorn
app = FastAPI()

from google import genai
from google.genai import types

import PIL.Image

client = genai.Client(api_key="AIzaSyA2D5SILB7r5W6RgW7oxFn0i_IA6mE5Nw0")
# Add CORS middleware to allow cross-origin requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development).  **CHANGE THIS IN PRODUCTION**
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/score")
async def get_score(request: Request):
 
        data: Dict = await request.json()
        image_data = data.get("image")

        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")

        # Decode base64 image
        try:
            image_bytes = base64.b64decode(image_data.split(",")[1])  # Remove data URL prefix
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error decoding image: {e}")

        response = client.models.generate_content(
            model="gemini-1.5-pro",
            contents=["""give the recycle score value for the given image in total of 100. based on how different way it can be recycled.
u can take these points into account
Base Score
Lining Deduction
Wax Deduction (Assumed less problematic)
Adhesive Deduction
Specialized Facility Addition
Composting Potential Addition

give the final score only""", image])
        print(response.text)
        return {'score': int(response.text) }

uvicorn.run(app, port=8000)