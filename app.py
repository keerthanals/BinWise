
from google import genai
from google.genai import types

import PIL.Image

image = PIL.Image.open('images/borad.jpg')

client = genai.Client(api_key="AIzaSyA2D5SILB7r5W6RgW7oxFn0i_IA6mE5Nw0")
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=["What is this image?", image])

print(response.text)