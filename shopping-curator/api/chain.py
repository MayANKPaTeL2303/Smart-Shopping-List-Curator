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