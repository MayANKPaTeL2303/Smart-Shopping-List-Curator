from pymongo import MongoClient
from dotenv import load_dotenv 
import os
import numpy as np
from sentence_transformers import SentenceTransformer 

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

products.extend([
    # 🎂 Ready-Made Birthday Cakes
    {'name': 'Bakery Fresh Chocolate Birthday Cake 8 inch', 'brand': 'Bakery Fresh', 'price': '$12.99', 'category': 'Bakery'},
    {'name': 'Bakery Fresh Vanilla Birthday Cake 8 inch', 'brand': 'Bakery Fresh', 'price': '$11.99', 'category': 'Bakery'},
    {'name': 'Bakery Fresh Red Velvet Cake 8 inch', 'brand': 'Bakery Fresh', 'price': '$14.49', 'category': 'Bakery'},
    {'name': 'Bakery Fresh Birthday Cupcake Pack 12 ct', 'brand': 'Bakery Fresh', 'price': '$7.99', 'category': 'Bakery'},

    # 🎉 Party Supplies
    {'name': 'Party City Colorful Paper Plates 20 ct', 'brand': 'Party City', 'price': '$3.49', 'category': 'Party Supplies'},
    {'name': 'Party City Birthday Balloons Pack 10 ct', 'brand': 'Party City', 'price': '$4.99', 'category': 'Party Supplies'},
    {'name': 'Amscan Plastic Table Cover 108x54 inch', 'brand': 'Amscan', 'price': '$2.97', 'category': 'Party Supplies'},
    {'name': 'Wilton Happy Birthday Cake Topper', 'brand': 'Wilton', 'price': '$5.29', 'category': 'Party Supplies'},

    # ☕ Coffee & Tea
    {'name': 'Dunkin’ Original Blend Ground Coffee 12 oz', 'brand': 'Dunkin’', 'price': '$6.99', 'category': 'Coffee'},
    {'name': 'Twinings English Breakfast Tea 20 ct', 'brand': 'Twinings', 'price': '$3.79', 'category': 'Tea'},

    # 🍫 Confectionery & Snacks
    {'name': 'KitKat Chocolate Wafer Bar 1.5 oz', 'brand': 'KitKat', 'price': '$1.25', 'category': 'Confectionery'},
    {'name': 'Snickers Chocolate Bar 1.86 oz', 'brand': 'Snickers', 'price': '$1.19', 'category': 'Confectionery'},
    {'name': 'Pringles Original Chips 5.5 oz', 'brand': 'Pringles', 'price': '$2.49', 'category': 'Snacks'},
    {'name': 'Doritos Nacho Cheese Chips 9.75 oz', 'brand': 'Doritos', 'price': '$3.99', 'category': 'Snacks'},

    # 🌰 Nuts & Dried Fruits
    {'name': 'Wonderful Pistachios Roasted Salted 16 oz', 'brand': 'Wonderful', 'price': '$8.99', 'category': 'Nuts'},
    {'name': 'Sun-Maid Raisins 20 oz', 'brand': 'Sun-Maid', 'price': '$4.29', 'category': 'Dried Fruits'},

    # 🥫 Sauces & Spices
    {'name': 'Tabasco Original Hot Sauce 5 oz', 'brand': 'Tabasco', 'price': '$3.45', 'category': 'Sauces'},
    {'name': 'Sriracha Hot Chili Sauce 17 oz', 'brand': 'Huy Fong', 'price': '$4.15', 'category': 'Sauces'},
    {'name': 'McCormick Black Pepper 3 oz', 'brand': 'McCormick', 'price': '$2.89', 'category': 'Spices'},
    {'name': 'McCormick Ground Cinnamon 2.37 oz', 'brand': 'McCormick', 'price': '$3.15', 'category': 'Spices'},

    # 🥛 Dairy Alternatives
    {'name': 'Silk Almond Milk Original 64 oz', 'brand': 'Silk', 'price': '$3.49', 'category': 'Dairy Alternatives'},
    {'name': 'Oatly Oat Milk 64 oz', 'brand': 'Oatly', 'price': '$4.29', 'category': 'Dairy Alternatives'},

    # 👶 Baby Products
    {'name': 'Gerber Rice Cereal 8 oz', 'brand': 'Gerber', 'price': '$2.89', 'category': 'Baby Food'},
    {'name': 'Pampers Baby Dry Diapers Size 3 32 ct', 'brand': 'Pampers', 'price': '$8.97', 'category': 'Baby Care'},
    {'name': 'Huggies Natural Care Baby Wipes 56 ct', 'brand': 'Huggies', 'price': '$2.49', 'category': 'Baby Care'},

    # 🐟 Seafood & Meat
    {'name': 'Chicken Breast Boneless Skinless 1 lb', 'brand': 'Fresh Meat', 'price': '$4.99', 'category': 'Meat'},
    {'name': 'Salmon Fillet Fresh 1 lb', 'brand': 'Fresh Seafood', 'price': '$8.99', 'category': 'Seafood'},
    {'name': 'Shrimp Large Raw 2 lb Bag', 'brand': 'Fresh Seafood', 'price': '$12.49', 'category': 'Seafood'},
])



# Insert into MongoDB
for product in products:
    description = f"{product['name']} {product['brand']} {product['category']}"
    embedding = model.encode(description).tolist()
    product["embedding"] = embedding
    collection.insert_one(product)

print("Products with embeddings inserted.")
