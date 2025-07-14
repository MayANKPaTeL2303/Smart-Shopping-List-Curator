from pymongo import MongoClient 
from sentence_transformers import SentenceTransformer
from langchain_google_genai import ChatGoogleGenerativeAI
import numpy as np
import os
import json
from dotenv import load_dotenv
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .chain import get_chain
from mistral_ocr_inference import run_mistral_ocr

# Load environment variables
load_dotenv()

# DB and model setup
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client["shopping"]
products_collection = db["products"]

model = SentenceTransformer("all-MiniLM-L6-v2")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-001",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)
rag_chain = get_chain(llm=llm)

def cosine_similarity(vec1, vec2):
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

@csrf_exempt
def index(request):
    if request.method == "POST":
        items_text = ""

        if request.content_type.startswith("multipart/form-data"):
            # Get text input
            items_text = request.POST.get("items", "")
            image_file = request.FILES.get("image")

            if image_file:
                try:
                    # Use Mistral OCR instead of Tesseract
                    mistral_api_key = os.getenv("MISTRAL_API_KEY")
                    extracted_text = run_mistral_ocr(image_file, mistral_api_key)
                    items_text += ", " + extracted_text
                except Exception as e:
                    return JsonResponse({"error": str(e)}, status=400)

        else:  # Handle JSON request
            try:
                data = json.loads(request.body.decode("utf-8"))
                items_text = data.get("items", "")
            except Exception:
                return JsonResponse({"error": "Invalid JSON body"}, status=400)

        if not items_text.strip():
            return JsonResponse({"items": []}, status=200)

        # Use Gemini to extract structured item list
        response = rag_chain.invoke({"input": items_text})
        print("RAG Response:", response)

        raw_items = [item.strip() for item in response.split(",") if item.strip()]

        # Get all products from DB
        all_products = list(products_collection.find({}, {
            "_id": 0,
            "embedding": 1,
            "name": 1,
            "brand": 1,
            "price": 1,
            "category": 1
        }))

        response = []
        for item in raw_items:
            query_embedding = model.encode(item).tolist()
            scored = []

            for product in all_products:
                if "embedding" in product:
                    score = cosine_similarity(query_embedding, product["embedding"])
                    scored.append((score, product))

            # Top 5 matches
            top_matches = sorted(scored, key=lambda x: x[0], reverse=True)[:5]
            recommendations = [match[1] for match in top_matches]

            response.append({
                "name": item.capitalize(),
                "recommendations": recommendations
            })

        return JsonResponse({"items": response}, status=200)

    return JsonResponse({"message": "Send a POST request with shopping items or image."}, status=200)
