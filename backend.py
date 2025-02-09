from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from PIL import Image
import io
import base64
from typing import Dict
import uvicorn
import json
app = FastAPI()

from google import genai
from google.genai import types

import PIL.Image

client = genai.Client(api_key="AIzaSyDHCXvHyVdX6w7mMEu0bQSHeC3JWPb9slw")
# Add CORS middleware to allow cross-origin requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development).  **CHANGE THIS IN PRODUCTION**
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/", response_class=HTMLResponse)
async def home():
    with open("static/index.html", "r", encoding="utf-8") as file:
        html_content = file.read()
    return HTMLResponse(content=html_content)





@app.post("/score")
async def get_recycle_score(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB") # Convert to RGB to handle various image formats
        image = compress_image(image)
      

    except Exception as e:
        print(f"Error processing image: {e}") # Print error for debugging
        raise HTTPException(status_code=500, detail=f"Error processing image: {e}")
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

give the final score only
add 3 ways we can reuse the object
don't reply if object is a human or animal
expected format: 
response_str: {'desc': $decription_of_object, 'score': $score, 'reuse': [{'title': title_of_first, 'content': content_of_first}, {'title': title_of_second, 'content': content_of_second},{...} ]}
""", image])
    print(response.text)
    res = response.text.replace('```json', '').replace('```', '').replace('response_str:', '')
    res_json = json.loads(res.replace('\'','\"'))
    return res_json
app.mount("/", StaticFiles(directory="static"), name="static")
# uvicorn.run(app, port=8000)
