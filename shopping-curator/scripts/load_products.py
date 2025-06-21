from pymongo import MongoClient # type: ignore
from dotenv import load_dotenv # type: ignore
import os
import numpy as np
from sentence_transformers import SentenceTransformer # type: ignore

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

load_dotenv()
# Connect to MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client["shopping"]
collection = db["products"]

# Clear old data
collection.delete_many({})

# Dummy data
products = [
    # Dairy
    {"name": "Great Value Whole Milk 1 gal", "brand": "Great Value", "price": "$3.27", "category": "Dairy"},
    {"name": "Great Value Unsalted Butter 1 lb", "brand": "Great Value", "price": "$3.98", "category": "Dairy"},
    {"name": "Sargento Shredded Cheddar Cheese 8 oz", "brand": "Sargento", "price": "$2.78", "category": "Dairy"},
    {"name": "Chobani Greek Yogurt 5.3 oz", "brand": "Chobani", "price": "$1.22", "category": "Dairy"},

    # Beverages
    {"name": "Coca-Cola Soda 12 Pack 12 oz Cans", "brand": "Coca-Cola", "price": "$6.68", "category": "Beverages"},
    {"name": "Pepsi 2L Bottle", "brand": "Pepsi", "price": "$1.96", "category": "Beverages"},
    {"name": "Starbucks Frappuccino Coffee Drink 13.7 oz", "brand": "Starbucks", "price": "$2.98", "category": "Beverages"},
    {"name": "Great Value Purified Water 40 Bottles", "brand": "Great Value", "price": "$4.38", "category": "Beverages"},

    # Snacks
    {"name": "Pringles Original Chips 5.5 oz", "brand": "Pringles", "price": "$1.96", "category": "Snacks"},
    {"name": "Doritos Nacho Cheese Chips 9.25 oz", "brand": "Doritos", "price": "$3.98", "category": "Snacks"},
    {"name": "Oreo Chocolate Sandwich Cookies 14.3 oz", "brand": "Oreo", "price": "$3.67", "category": "Snacks"},
    {"name": "Nature Valley Crunchy Granola Bars 12 ct", "brand": "Nature Valley", "price": "$3.94", "category": "Snacks"},

    # Canned Goods
    {"name": "Bush’s Best Baked Beans 28 oz", "brand": "Bush’s Best", "price": "$2.68", "category": "Canned Food"},
    {"name": "Hunt’s Diced Tomatoes 14.5 oz", "brand": "Hunt’s", "price": "$1.28", "category": "Canned Food"},
    {"name": "Del Monte Sweet Corn 15.25 oz", "brand": "Del Monte", "price": "$1.58", "category": "Canned Food"},

    # Breakfast
    {"name": "Eggo Homestyle Waffles 10 ct", "brand": "Eggo", "price": "$2.98", "category": "Frozen Food"},
    {"name": "Kellogg's Corn Flakes Cereal 18 oz", "brand": "Kellogg's", "price": "$3.64", "category": "Cereal"},
    {"name": "Quaker Instant Oatmeal Variety Pack", "brand": "Quaker", "price": "$3.99", "category": "Cereal"},

    # Condiments & Spreads
    {"name": "Jif Creamy Peanut Butter 16 oz", "brand": "Jif", "price": "$2.48", "category": "Condiments"},
    {"name": "Smucker’s Strawberry Jam 20 oz", "brand": "Smucker’s", "price": "$3.58", "category": "Condiments"},
    {"name": "Hellmann's Real Mayonnaise 30 oz", "brand": "Hellmann’s", "price": "$4.77", "category": "Condiments"},

    # Cleaning
    {"name": "Lysol Disinfectant Spray 19 oz", "brand": "Lysol", "price": "$6.47", "category": "Cleaning"},
    {"name": "Mr. Clean Multi-Surface Cleaner 45 oz", "brand": "Mr. Clean", "price": "$3.12", "category": "Cleaning"},
    {"name": "Clorox Disinfecting Wipes 75 ct", "brand": "Clorox", "price": "$4.98", "category": "Cleaning"},

    # Health & Hygiene
    {"name": "Neutrogena Face Wash 6 oz", "brand": "Neutrogena", "price": "$7.88", "category": "Personal Care"},
    {"name": "Head & Shoulders Classic Shampoo 13.5 oz", "brand": "Head & Shoulders", "price": "$6.94", "category": "Hair Care"},
    {"name": "Old Spice Deodorant Stick 3 oz", "brand": "Old Spice", "price": "$4.97", "category": "Personal Care"},
    {"name": "Sensodyne Toothpaste 4 oz", "brand": "Sensodyne", "price": "$6.47", "category": "Toothpaste"},

    # Household
    {"name": "Ziploc Gallon Storage Bags 60 ct", "brand": "Ziploc", "price": "$8.72", "category": "Household"},
    {"name": "Glad Trash Bags 13 Gallon 80 ct", "brand": "Glad", "price": "$15.96", "category": "Household"},
    {"name": "Reynolds Wrap Aluminum Foil 75 ft", "brand": "Reynolds", "price": "$4.36", "category": "Household"},


     # Dairy
    {"name": "Great Value Whole Milk 1 gal", "brand": "Great Value", "price": "$3.27", "category": "Dairy"},
    {"name": "Great Value Large White Eggs  12 ct", "brand": "Great Value", "price": "$2.18", "category": "Dairy"},
    {"name": "Sargento Shredded Mozzarella Cheese 8 oz", "brand": "Sargento", "price": "$2.98", "category": "Dairy"},
    {"name": "Chobani Vanilla Greek Yogurt 32 oz", "brand": "Chobani", "price": "$5.46", "category": "Dairy"},

    # Beverages
    {"name": "Coca-Cola Soda 12 Pack 12 oz", "brand": "Coca-Cola", "price": "$6.68", "category": "Beverages"},
    {"name": "Pepsi 2L Bottle", "brand": "Pepsi", "price": "$1.96", "category": "Beverages"},
    {"name": "Gatorade Thirst Quencher 32 oz", "brand": "Gatorade", "price": "$1.44", "category": "Beverages"},
    {"name": "Lipton Iced Tea Lemon 12 Pack", "brand": "Lipton", "price": "$6.49", "category": "Beverages"},

    # Snacks
    {"name": "Lay’s Classic Potato Chips 8 oz", "brand": "Lay’s", "price": "$3.48", "category": "Snacks"},
    {"name": "Doritos Cool Ranch 9.25 oz", "brand": "Doritos", "price": "$3.98", "category": "Snacks"},
    {"name": "Oreo Family Size Cookies 19.1 oz", "brand": "Oreo", "price": "$4.38", "category": "Snacks"},
    {"name": "Nature Valley Oats & Honey Bars 12 ct", "brand": "Nature Valley", "price": "$3.94", "category": "Snacks"},

    # Fruits & Veggies
    {"name": "Fresh Bananas 1 lb", "brand": "Fresh Produce", "price": "$0.58", "category": "Fruits"},
    {"name": "Red Delicious Apples 3 lb Bag", "brand": "Fresh Produce", "price": "$4.27", "category": "Fruits"},
    {"name": "Green Bell Peppers 3 ct", "brand": "Fresh Produce", "price": "$2.74", "category": "Vegetables"},
    {"name": "Baby Carrots 1 lb Bag", "brand": "Fresh Produce", "price": "$1.38", "category": "Vegetables"},

    # Canned & Dry Goods
    {"name": "Bush’s Baked Beans 28 oz", "brand": "Bush’s", "price": "$2.68", "category": "Canned Food"},
    {"name": "Hunt’s Tomato Sauce 15 oz", "brand": "Hunt’s", "price": "$0.98", "category": "Canned Food"},
    {"name": "Great Value Pinto Beans 1 lb", "brand": "Great Value", "price": "$1.18", "category": "Dry Goods"},
    {"name": "Uncle Ben’s Long Grain Rice 2 lb", "brand": "Uncle Ben’s", "price": "$2.96", "category": "Dry Goods"},

    # Condiments
    {"name": "Heinz Tomato Ketchup 38 oz", "brand": "Heinz", "price": "$3.84", "category": "Condiments"},
    {"name": "Hellmann’s Real Mayonnaise 30 oz", "brand": "Hellmann’s", "price": "$4.77", "category": "Condiments"},
    {"name": "French’s Yellow Mustard 20 oz", "brand": "French’s", "price": "$2.19", "category": "Condiments"},
    {"name": "Sweet Baby Ray’s BBQ Sauce 28 oz", "brand": "Sweet Baby Ray’s", "price": "$2.98", "category": "Condiments"},

    # Cleaning
    {"name": "Lysol Disinfectant Spray 19 oz", "brand": "Lysol", "price": "$6.47", "category": "Cleaning"},
    {"name": "Clorox Disinfecting Wipes 75 ct", "brand": "Clorox", "price": "$4.98", "category": "Cleaning"},
    {"name": "Tide Liquid Laundry Detergent 92 oz", "brand": "Tide", "price": "$12.94", "category": "Cleaning"},
    {"name": "Gain Flings Laundry Pods 35 ct", "brand": "Gain", "price": "$10.97", "category": "Cleaning"},

    # Bathroom Essentials
    {"name": "Charmin Ultra Soft Toilet Paper 12 Mega Rolls", "brand": "Charmin", "price": "$14.76", "category": "Household"},
    {"name": "Bounty Paper Towels 6 Rolls", "brand": "Bounty", "price": "$9.97", "category": "Household"},
    {"name": "Scott Paper Towels 6 Rolls", "brand": "Scott", "price": "$8.49", "category": "Household"},

    # Hygiene
    {"name": "Colgate Total Whitening Toothpaste 5.1 oz", "brand": "Colgate", "price": "$3.97", "category": "Toothpaste"},
    {"name": "Dove Men+Care Body Wash 18 oz", "brand": "Dove", "price": "$6.97", "category": "Body Care"},
    {"name": "Head & Shoulders Classic Shampoo 13.5 oz", "brand": "Head & Shoulders", "price": "$6.94", "category": "Hair Care"},
    {"name": "Old Spice Red Zone Deodorant 3 oz", "brand": "Old Spice", "price": "$4.97", "category": "Deodorant"},

    # Frozen Food
    {"name": "Hot Pockets Pepperoni Pizza 2 ct", "brand": "Hot Pockets", "price": "$2.48", "category": "Frozen Food"},
    {"name": "DiGiorno Rising Crust Pepperoni Pizza", "brand": "DiGiorno", "price": "$6.98", "category": "Frozen Food"},
    {"name": "Ore-Ida Golden Fries 32 oz", "brand": "Ore-Ida", "price": "$2.98", "category": "Frozen Food"},

    # Breakfast
    {"name": "Kellogg’s Frosted Flakes 24 oz", "brand": "Kellogg’s", "price": "$4.28", "category": "Cereal"},
    {"name": "Quaker Old Fashioned Oats 42 oz", "brand": "Quaker", "price": "$4.78", "category": "Cereal"},
    {"name": "Eggo Homestyle Waffles 10 ct", "brand": "Eggo", "price": "$2.98", "category": "Frozen Breakfast"},

    # Pet Supplies
    {"name": "Purina Dog Chow Complete 16.5 lb", "brand": "Purina", "price": "$14.98", "category": "Pet Supplies"},
    {"name": "IAMS Indoor Cat Food 16 lb", "brand": "IAMS", "price": "$23.48", "category": "Pet Supplies"},
]



# Insert into MongoDB
for product in products:
    description = f"{product['name']} {product['brand']} {product['category']}"
    embedding = model.encode(description).tolist()  # Convert to list for JSON
    product["embedding"] = embedding
    collection.insert_one(product)

print("Products with embeddings inserted.")
