from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable
from langchain_core.output_parsers import StrOutputParser
import os
from dotenv import load_dotenv

load_dotenv()

def get_chain(llm) -> Runnable:
    
    # Fixed template with proper variable names and better structure
    prompt = ChatPromptTemplate.from_template(
        '''You are a universal item breakdown specialist. Your task is to analyze any input and return a comma-separated list of basic components, ingredients, materials, or constituent items. Consider the items that can be available in the supermarkets like Walmart

        Rules:
        1. If the input contains basic items/materials, return them as-is in CSV format
        2. If the input contains complex products, assemblies, or compound items, break them down into their fundamental components
        3. Focus on essential, core components - **avoid overly specific or optional parts**
        4. Use simple, commonly understood names for components
        5. Do not include processes, quantities, tools, or methods in the component names
        6. Return ONLY the comma-separated values with no additional text, explanations, or formatting
        7. Use lowercase for consistency unless proper nouns are required
        8. Separate each component with a comma and single space

        Examples:
        Input: milk potato bread
        Output: milk, potato, bread

        Input: laptop
        Output: laptop

        Input: pencil
        Output: pencil

        Input: bicycle
        Output: frame, wheels, tires, chain, pedals, handlebars, brakes, seat, gears

        Input: hang a photo frame on the wall
        Output: photo frame, nail, hammer, buckle

        Input: a complex dish like lasagna
        Output: pasta, cheese, tomato sauce, ground meat, vegetables, herbs

        Now process this input: {input}'''
    )

    # Create a runnable that formats inputs and passes them to the chain
    chain = prompt | llm | StrOutputParser()

    return chain

def get_chain_recipe(llm) -> Runnable:

    prompt = ChatPromptTemplate.from_template(
        '''You are a professional recipe ingredient specialist. Your task is to analyze a recipe name and serving size, then return a structured list of ingredients with quantities that can be purchased from supermarkets like Walmart.

        Rules:
        1. Given a recipe name and serving size, provide a comprehensive ingredient list
        2. Include realistic quantities based on the serving size provided
        3. Use common measurement units (cups, tablespoons, teaspoons, pounds, ounces, pieces, etc.)
        4. Focus on ingredients that can be purchased at supermarkets
        5. Group similar ingredients logically (proteins, vegetables, dairy, pantry staples, etc.)
        6. Include essential seasonings and basic ingredients
        7. Return in the format: "ingredient_name|quantity|unit" separated by commas
        8. Use practical quantities that account for package sizes (e.g., don't ask for 0.25 eggs)
        9. Consider standard recipe proportions and scaling
        10. Include common pantry staples that might be needed

        Examples:
        Input: Chicken Tikka Masala for 4 servings
        Output: chicken breast|2|pounds, basmati rice|1|cup, onion|1|large, garlic|4|cloves, ginger|1|inch piece, tomato sauce|1|can, coconut milk|1|can, yogurt|1|cup, garam masala|2|tablespoons, turmeric|1|teaspoon, cumin|1|teaspoon, salt|1|teaspoon, vegetable oil|2|tablespoons, cilantro|1|bunch

        Input: Chocolate Chip Cookies for 2 servings
        Output: all-purpose flour|1|cup, butter|4|tablespoons, brown sugar|1/4|cup, white sugar|2|tablespoons, egg|1|large, vanilla extract|1/2|teaspoon, baking soda|1/4|teaspoon, salt|1/4|teaspoon, chocolate chips|1/3|cup

        Input: Caesar Salad for 6 servings
        Output: romaine lettuce|2|heads, parmesan cheese|1/2|cup, croutons|1|cup, caesar dressing|1/2|cup, anchovies|4|fillets, lemon|1|whole, garlic|2|cloves, olive oil|1/4|cup, black pepper|1/2|teaspoon

        Now process this recipe: {recipe_name} for {servings} servings'''
    )

    chain = prompt | llm | StrOutputParser()

    return chain

def get_chain_recipe_advanced(llm) -> Runnable:
    # Advanced recipe chain that returns JSON-structured data for better parsing
    prompt = ChatPromptTemplate.from_template(
        '''You are an expert culinary assistant and shopping specialist. Given a recipe name and serving size, provide a comprehensive ingredient list optimized for grocery shopping.

        Your response should be in JSON format with the following structure:
        {{
            "recipe_info": {{
                "name": "recipe name",
                "servings": number,
                "prep_time": "estimated prep time",
                "cook_time": "estimated cook time"
            }},
            "categories": [
                {{
                    "name": "category name (e.g., Proteins, Vegetables, Dairy, Pantry)",
                    "ingredients": [
                        {{
                            "name": "ingredient name",
                            "quantity": "amount needed",
                            "unit": "measurement unit",
                            "notes": "optional shopping notes"
                        }}
                    ]
                }}
            ]
        }}

        Guidelines:
        1. Scale quantities appropriately for the serving size
        2. Use realistic measurements that align with package sizes
        3. Group ingredients into logical shopping categories
        4. Include essential seasonings and cooking basics
        5. Consider substitutions for hard-to-find ingredients
        6. Provide helpful shopping notes when relevant
        7. Focus on ingredients available in major supermarkets
        8. Ensure quantities make sense for home cooking

        Recipe: {recipe_name}
        Servings: {servings}
        
        Return only the JSON response with no additional text.'''
    )

    chain = prompt | llm | StrOutputParser()

    return chain