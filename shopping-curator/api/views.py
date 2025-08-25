from pymongo import MongoClient 
from sentence_transformers import SentenceTransformer
from langchain_google_genai import ChatGoogleGenerativeAI
import numpy as np
import os
import json
from dotenv import load_dotenv
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .chain import get_chain, get_chain_recipe
from mistral_ocr_inference import run_mistral_ocr

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client["shopping"]
products_collection = db["products"]

# Model for embedding
model = SentenceTransformer("all-MiniLM-L6-v2")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-001",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)
chain = get_chain(llm=llm)
recipe_chain = get_chain_recipe(llm=llm)

# To find the similarity 
def cosine_similarity(vec1, vec2):
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

def parse_recipe_ingredients(recipe_response):
    ingredients = []

    raw_ingredients = [item.strip() for item in recipe_response.split(",") if item.strip()]

    for ingredient in raw_ingredients:
        parts = ingredient.split("|")
        if len(parts) >= 3:
            name = parts[0].strip()
            quantity = parts[1].strip()
            unit = parts[2].strip()

            ingredients.append({
                "name": name,
                "quantity": quantity,
                "unit": unit,
                "search_term": name 
            })
        else:
            ingredients.append({
                "name": ingredient,
                "quantity": None,
                "unit": None,
                "search_term": ingredient
            })
    return ingredients

def get_product_recommendations(search_term, all_products, top_k=5):
    """Get product recommendations for a given search term."""
    query_embedding = model.encode(search_term).tolist()
    scored = []

    for product in all_products:
        if "embedding" in product:
            score = cosine_similarity(query_embedding, product["embedding"])
            scored.append((score, product))

    # Get top matches
    top_matches = sorted(scored, key=lambda x: x[0], reverse=True)[:top_k]
    return [match[1] for match in top_matches]

def process_shopping_mode(items_text, all_products):
    """Process shopping list items and return recommendations."""
    response = chain.invoke({"input": items_text})
    print("Response:", response)

    raw_items = [item.strip() for item in response.split(",") if item.strip()]
    
    result = []
    for item in raw_items:
        recommendations = get_product_recommendations(item, all_products)
        result.append({
            "name": item.capitalize(),
            "recommendations": recommendations
        })
    
    return result

def process_recipe_mode(recipe_name, servings, all_products):
    """Process recipe and return ingredients with recommendations."""
    try:
        recipe_response = recipe_chain.invoke({
            "recipe_name": recipe_name,
            "servings": servings
        })
        print(f"Recipe Response: {recipe_response}")

        ingredients = parse_recipe_ingredients(recipe_response)
        
        categories = {}
        
        for ingredient in ingredients:
            # Get product recommendations for this ingredient
            recommendations = get_product_recommendations(
                ingredient["search_term"], 
                all_products
            )
            
            # Add quantity and unit info to recommendations
            enhanced_recommendations = []
            for rec in recommendations:
                enhanced_rec = rec.copy()
                if ingredient["quantity"] and ingredient["unit"]:
                    enhanced_rec["quantity"] = ingredient["quantity"]
                    enhanced_rec["unit"] = ingredient["unit"]
                enhanced_recommendations.append(enhanced_rec)
            
            # Categorize ingredient
            category = categorize_ingredient(ingredient["name"])
            
            if category not in categories:
                categories[category] = []
            
            categories[category].append({
                "name": ingredient["name"],
                "quantity": ingredient["quantity"],
                "unit": ingredient["unit"],
                "recommendations": enhanced_recommendations
            })
        
        result = []
        for category_name, items in categories.items():
            category_recommendations = []
            for item in items:
                for rec in item["recommendations"]:
                    category_recommendations.append({
                        "name": rec["name"],
                        "brand": rec.get("brand", ""),
                        "price": rec.get("price", ""),
                        "quantity": rec.get("quantity"),
                        "unit": rec.get("unit"),
                        "category": rec.get("category", "")
                    })
            
            result.append({
                "name": category_name,
                "recommendations": category_recommendations
            })
        
        return result

    except Exception as e:
        print(f"Error processing recipe: {e}")
        return process_shopping_mode(recipe_name, all_products)
    

def categorize_ingredient(ingredient_name):
    """Simple ingredient categorization."""
    ingredient_lower = ingredient_name.lower()
    
    # Protein categorization
    proteins = ["chicken", "beef", "pork", "fish", "salmon", "turkey", "ham", "bacon", 
               "egg", "tofu", "beans", "lentils", "chickpeas", "shrimp", "crab", "lobster"]
    if any(protein in ingredient_lower for protein in proteins):
        return "Proteins"
    
    # Dairy categorization
    dairy = ["milk", "cheese", "butter", "cream", "yogurt", "sour cream", "cottage cheese"]
    if any(dairy_item in ingredient_lower for dairy_item in dairy):
        return "Dairy & Eggs"
    
    # Vegetables categorization
    vegetables = ["onion", "garlic", "tomato", "potato", "carrot", "celery", "pepper", 
                 "lettuce", "spinach", "broccoli", "cauliflower", "cucumber", "mushroom"]
    if any(veg in ingredient_lower for veg in vegetables):
        return "Fresh Produce"
    
    # Pantry staples
    pantry = ["flour", "sugar", "salt", "pepper", "oil", "vinegar", "spice", "herb", 
             "rice", "pasta", "bread", "sauce", "stock", "broth"]
    if any(pantry_item in ingredient_lower for pantry_item in pantry):
        return "Pantry Staples"
    
    return "Other Ingredients"


@csrf_exempt 
def get_recipe_ingredients(request):
    """Endpoint to get just the ingredients list for a recipe."""
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            recipe_name = data.get("recipe_name", "")
            servings = int(data.get("servings", 4))
            if servings <= 0:
                servings = 1

            if not recipe_name.strip():
                return JsonResponse({"error": "Recipe name is required"}, status=400)
            
            recipe_response = recipe_chain.invoke({
                "recipe_name": recipe_name,
                "servings": servings
            })
            
            ingredients = parse_recipe_ingredients(recipe_response)
            
            formatted_ingredients = []
            for ingredient in ingredients:
                display_text = ingredient['name']
                if ingredient.get('quantity') and ingredient.get('unit'):
                    display_text = f"{ingredient['quantity']} {ingredient['unit']} {ingredient['name']}"
                
                formatted_ingredients.append({
                    "name": ingredient["name"],
                    "quantity": ingredient.get("quantity"),
                    "unit": ingredient.get("unit"),
                    "display": display_text,
                    "category": categorize_ingredient(ingredient["name"])
                })

            
            print(formatted_ingredients)
            
            return JsonResponse({
                "recipe_name": recipe_name,
                "servings": servings,
                "ingredients": formatted_ingredients,
                "total_count": len(formatted_ingredients)
            }, status=200)
            
        except Exception as e:
            return JsonResponse({"error": f"Failed to fetch ingredients: {str(e)}"}, status=500)
    
    return JsonResponse({"error": "POST method required"}, status=405)

@csrf_exempt
def index(request):
    """Main endpoint for processing shopping lists and recipes."""
    if request.method == "POST":
        mode = "shopping"  
        items_text = ""
        recipe_name = ""
        servings = 4
        
        # Handle multipart form data(like image, text)
        if request.content_type and request.content_type.startswith("multipart/form-data"):
            mode = request.POST.get("mode", "shopping")
            
            if mode == "recipe":
                recipe_name = request.POST.get("recipe_name", "")
                servings = int(request.POST.get("servings", 4))
            else:
                items_text = request.POST.get("items", "")
            
            # Handle image upload (only for shopping mode)
            image_file = request.FILES.get("image")
            if image_file and mode == "shopping":
                try:
                    mistral_api_key = os.getenv("MISTRAL_API_KEY")
                    if mistral_api_key:
                        extracted_text = run_mistral_ocr(image_file, mistral_api_key)
                        items_text += ", " + extracted_text if items_text else extracted_text
                except Exception as e:
                    return JsonResponse({"error": f"OCR processing failed: {str(e)}"}, status=400)
        
        else:
            try:
                data = json.loads(request.body.decode("utf-8"))
                mode = data.get("mode", "shopping")
                
                if mode == 'recipe':
                    recipe_name = data.get("recipe_name", "")
                    servings = int(data.get("servings", 4))
                else:
                    items_text = data.get("items", "")
            except Exception:
                return JsonResponse({"error": "Invalid JSON body"}, status=400)

        if mode == 'recipe':
            if not recipe_name.strip():
                return JsonResponse({"error": "Recipe name is required"}, status=400)
        else:
            if not items_text.strip():
                return JsonResponse({"items": []}, status=200)
            
        try:
            all_products = list(products_collection.find({}, {
                "_id": 0,
                "embedding": 1,
                "name": 1,
                "brand": 1,
                "price": 1,
                "category": 1,
                "link": 1
            }))
            
            if not all_products:
                return JsonResponse({"error": "No products found in database"}, status=500)
                
        except Exception as e:
            return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

        try:
            if mode == "recipe":
                response_items = process_recipe_mode(recipe_name, servings, all_products)
                return JsonResponse({
                    "items": response_items,
                    "mode": "recipe",
                    "recipe_info": {
                        "name": recipe_name,
                        "servings": servings
                    }
                }, status=200)
            else:
                response_items = process_shopping_mode(items_text, all_products)
                return JsonResponse({
                    "items": response_items,
                    "mode": "shopping"
                }, status=200)
                
        except Exception as e:
            print(f"Processing error: {e}")
            return JsonResponse({"error": f"Processing failed: {str(e)}"}, status=500)

    return JsonResponse({
        "message": "Send a POST request with shopping items, image, or recipe information.",
        "modes": {
            "shopping": "Send 'items' field with shopping list or upload image",
            "recipe": "Send 'mode': 'recipe', 'recipe_name', and 'servings' fields"
        }
    }, status=200)

def health_check(request):
    """Health check endpoint."""
    try:
        db.command("ping")
        return JsonResponse({
            "status": "healthy",
            "database": "connected",
            "model": "loaded"
        }, status=200)
    except Exception as e:
        return JsonResponse({
            "status": "unhealthy",
            "error": str(e)
        }, status=500)