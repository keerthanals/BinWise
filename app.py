
from google import genai
from google.genai import types

import PIL.Image

image = PIL.Image.open('images/borad.jpg')

client = genai.Client(api_key="AIzaSyA2D5SILB7r5W6RgW7oxFn0i_IA6mE5Nw0")
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