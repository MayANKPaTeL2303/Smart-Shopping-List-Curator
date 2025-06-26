from pymongo import MongoClient  # type: ignore
from sentence_transformers import SentenceTransformer
import numpy as np
import os
import json
from dotenv import load_dotenv  # type: ignore
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Load environment variables
load_dotenv()

# DB and model setup
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client["shopping"]
products_collection = db["products"]

model = SentenceTransformer("all-MiniLM-L6-v2")

# Cosine similarity function
def cosine_similarity(vec1, vec2):
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

@csrf_exempt
def index(request):
    if request.method == "POST":
        try:
            # Parse JSON body
            data = json.loads(request.body.decode("utf-8"))
            items_text = data.get("items", "")
        except Exception as e:
            return JsonResponse({"error": "Invalid JSON body"}, status=400)

        if not items_text:
            return JsonResponse({"items": []}, status=200)

        raw_items = [item.strip() for item in items_text.split(",") if item.strip()]

        # Get product list with embeddings from MongoDB
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

    # Optional fallback for GET
    return JsonResponse({"message": "Send a POST request with shopping items."}, status=200)
