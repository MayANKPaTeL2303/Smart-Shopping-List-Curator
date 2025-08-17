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

# Dummy data
products = [
    {'name': 'Ziploc Extra Bag 4 ct', 'brand': 'Ziploc', 'price': '$11.13', 'category': 'Household'},
    {'name': "Kellogg's Original Bottle 2 ct", 'brand': "Kellogg's", 'price': '$12.78', 'category': 'Cereal'},
    {'name': 'General Mills Original Pack 1 ct', 'brand': 'General Mills', 'price': '$15.29', 'category': 'Cereal'},
    {'name': "Kellogg's Extra Bottle 2 ct", 'brand': "Kellogg's", 'price': '$12.05', 'category': 'Cereal'},
    {'name': 'Ruffles Extra Bottle 4 ct', 'brand': 'Ruffles', 'price': '$3.66', 'category': 'Snacks'},
    {'name': 'Tide Liquid Pods 24 ct', 'brand': 'Tide', 'price': '$9.99', 'category': 'Cleaning'},
    {'name': 'Quaker Oats Classic Tin 42 oz', 'brand': 'Quaker', 'price': '$4.89', 'category': 'Cereal'},
    {'name': 'Lay’s Sour Cream Chips 6 oz', 'brand': 'Lay’s', 'price': '$3.59', 'category': 'Snacks'},
    {'name': 'Hellmann’s Olive Oil Mayo 30 oz', 'brand': 'Hellmann’s', 'price': '$5.27', 'category': 'Condiments'},
    {'name': 'Heinz Organic Ketchup 20 oz', 'brand': 'Heinz', 'price': '$2.96', 'category': 'Condiments'},
    {'name': 'Oreo Double Stuf 15.3 oz', 'brand': 'Oreo', 'price': '$3.99', 'category': 'Snacks'},
    {'name': 'Gatorade Lemon Lime 32 oz', 'brand': 'Gatorade', 'price': '$1.47', 'category': 'Beverages'},
    {'name': 'Pepsi Zero 2L Bottle', 'brand': 'Pepsi', 'price': '$1.96', 'category': 'Beverages'},
    {'name': 'Chobani Strawberry Yogurt 5.3 oz', 'brand': 'Chobani', 'price': '$1.38', 'category': 'Dairy'},
    {'name': 'Sargento Swiss Cheese 10 slices', 'brand': 'Sargento', 'price': '$3.49', 'category': 'Dairy'},
    {'name': 'Eggo Buttermilk Waffles 10 ct', 'brand': 'Eggo', 'price': '$2.99', 'category': 'Frozen Food'},
    {'name': 'Smucker’s Grape Jelly 18 oz', 'brand': 'Smucker’s', 'price': '$3.25', 'category': 'Condiments'},
    {'name': 'Bush’s Baked Beans Brown Sugar 28 oz', 'brand': 'Bush’s', 'price': '$2.84', 'category': 'Canned Food'},
    {'name': 'Uncle Ben’s Jasmine Rice 2 lb', 'brand': 'Uncle Ben’s', 'price': '$3.79', 'category': 'Dry Goods'},
    {'name': 'Nature Valley Protein Bars 10 ct', 'brand': 'Nature Valley', 'price': '$4.89', 'category': 'Snacks'},
    {'name': 'Colgate MaxFresh Toothpaste 6 oz', 'brand': 'Colgate', 'price': '$2.97', 'category': 'Toothpaste'},
    {'name': 'Old Spice Sport Deodorant 2.6 oz', 'brand': 'Old Spice', 'price': '$4.25', 'category': 'Deodorant'},
    {'name': 'Reynolds Non-Stick Foil 50 ft', 'brand': 'Reynolds', 'price': '$4.65', 'category': 'Household'},
    {'name': 'Charmin Ultra Strong 12 Rolls', 'brand': 'Charmin', 'price': '$13.94', 'category': 'Household'},
    {'name': 'Clorox Scentiva Wipes 70 ct', 'brand': 'Clorox', 'price': '$5.12', 'category': 'Cleaning'},
    {'name': 'Dove White Beauty Bar 4 ct', 'brand': 'Dove', 'price': '$6.47', 'category': 'Body Care'},
    {'name': 'Neutrogena Hydro Boost Gel 1.7 oz', 'brand': 'Neutrogena', 'price': '$8.97', 'category': 'Personal Care'},
    {'name': 'Scott Mega Paper Towels 6 ct', 'brand': 'Scott', 'price': '$8.49', 'category': 'Household'},
    {'name': 'Glad FlexNSeal Bags 20 ct', 'brand': 'Glad', 'price': '$3.29', 'category': 'Household'},
    {'name': 'Sensodyne Repair Toothpaste 4 oz', 'brand': 'Sensodyne', 'price': '$6.89', 'category': 'Toothpaste'},
    {'name': 'Hot Pockets Bacon Cheddar 2 ct', 'brand': 'Hot Pockets', 'price': '$2.68', 'category': 'Frozen Food'},
    {'name': 'DiGiorno Thin Crust Pizza', 'brand': 'DiGiorno', 'price': '$7.25', 'category': 'Frozen Food'},
    {'name': 'Green Giant Sweet Corn 15 oz', 'brand': 'Green Giant', 'price': '$1.74', 'category': 'Canned Food'},
    {'name': 'Lipton Peach Iced Tea 12 Pack', 'brand': 'Lipton', 'price': '$6.79', 'category': 'Beverages'},
    {'name': 'Great Value White Eggs 12 ct', 'brand': 'Great Value', 'price': '$2.12', 'category': 'Dairy'},
    {'name': 'French’s Classic Mustard 20 oz', 'brand': 'French’s', 'price': '$1.99', 'category': 'Condiments'},
    {'name': 'IAMS Adult Dog Food 15 lb', 'brand': 'IAMS', 'price': '$21.98', 'category': 'Pet Supplies'},
    {'name': 'Purina ONE Cat Chow 16 lb', 'brand': 'Purina', 'price': '$24.44', 'category': 'Pet Supplies'},
    {'name': 'Ore-Ida Tater Tots 32 oz', 'brand': 'Ore-Ida', 'price': '$3.12', 'category': 'Frozen Food'},
    {'name': 'Bounty Quick-Size Towels 6 ct', 'brand': 'Bounty', 'price': '$10.99', 'category': 'Household'},
    {'name': 'Gain Liquid Detergent 46 oz', 'brand': 'Gain', 'price': '$6.47', 'category': 'Cleaning'},
    {'name': 'Head & Shoulders 2-in-1 13.5 oz', 'brand': 'Head & Shoulders', 'price': '$6.94', 'category': 'Hair Care'},
    {'name': 'Nature Made Vitamin D3 90 ct', 'brand': 'Nature Made', 'price': '$9.74', 'category': 'Health'},
    {'name': 'Campbell’s Chicken Noodle 10.75 oz', 'brand': 'Campbell’s', 'price': '$1.48', 'category': 'Canned Food'},
    {'name': 'Great Value Apple Juice 64 oz', 'brand': 'Great Value', 'price': '$2.18', 'category': 'Beverages'},
    {'name': 'Fresh Express Salad Mix 12 oz', 'brand': 'Fresh Express', 'price': '$2.84', 'category': 'Vegetables'},
    {'name': 'Red Delicious Apples 3 lb', 'brand': 'Fresh Produce', 'price': '$4.27', 'category': 'Fruits'},
    {'name': 'Banquet Chicken Nuggets 24 oz', 'brand': 'Banquet', 'price': '$4.78', 'category': 'Frozen Food'},
    {'name': 'Jimmy Dean Sausage Patties 8 ct', 'brand': 'Jimmy Dean', 'price': '$5.29', 'category': 'Frozen Breakfast'},
    {'name': 'Oscar Mayer Bacon 16 oz', 'brand': 'Oscar Mayer', 'price': '$6.98', 'category': 'Meat'},
]


# Insert into MongoDB
for product in products:
    description = f"{product['name']} {product['brand']} {product['category']}"
    embedding = model.encode(description).tolist()
    product["embedding"] = embedding
    collection.insert_one(product)

print("Products with embeddings inserted.")
