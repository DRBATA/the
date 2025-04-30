import openai
import json
import re
import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(dotenv_path=".env.local")

# Set up OpenAI client (uses env var for API key)
client = openai.OpenAI()

# Regex pattern to split by product headings (customize as needed)
PRODUCT_HEADING_PATTERN = r"^([A-Z][A-Za-z0-9\- ]+):"  # e.g. 'Humantra:'

# Read your deep dive text
with open("agents/drinks/deepdive.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Find all product sections
splits = list(re.finditer(PRODUCT_HEADING_PATTERN, text, re.MULTILINE))
products = []
for i, match in enumerate(splits):
    start = match.end()
    end = splits[i+1].start() if i+1 < len(splits) else len(text)
    product_name = match.group(1).strip()
    product_text = text[start:end].strip()
    if product_text:
        products.append({"name": product_name, "text": product_text})

print(f"Found {len(products)} products.")

# Define the function schema for chunk generation
functions = [{
    "name": "make_chunks",
    "description": "Generate 5–6 chunk objects per product",
    "parameters": {
        "type": "object",
        "properties": {
            "chunks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "text": {"type": "string"},
                        "metadata": {"type": "object"}
                    },
                    "required": ["id", "text", "metadata"]
                }
            }
        },
        "required": ["chunks"]
    }
}]

all_chunks = []
for prod in products:
    prompt = f"""For the following product, generate 5–6 JSON chunks with id, text, and metadata (brand, sugar_free, price_aed_serving, sodium_mg, etc.) as per the schema below.\n\nProduct name: {prod['name']}\nProduct details:\n{prod['text']}\n\nChunks must follow the schema:\n- id: brand_slug + layer (e.g. 'humantra_snapshot')\n- text: concise prose (≤250 tokens)\n- metadata: as discussed (brand, sugar_free, price_aed_serving, sodium_mg, …, data_type)\nReturn via the `make_chunks` function."""
    response = client.chat.completions.create(
        model="gpt-4-0613",
        messages=[{"role": "user", "content": prompt}],
        tools=[{"type": "function", "function": functions[0]}],
        tool_choice={"type": "function", "function": {"name": "make_chunks"}}
    )
    chunks = json.loads(response.choices[0].message.tool_calls[0].function.arguments)["chunks"]
    all_chunks.extend(chunks)
    print(f"Chunked {prod['name']} into {len(chunks)} chunks.")

# Save all chunks to a file for upload
with open("drink_chunks.jsonl", "w", encoding="utf-8") as out:
    for chunk in all_chunks:
        out.write(json.dumps(chunk) + "\n")

print(f"Wrote {len(all_chunks)} chunks to drink_chunks.jsonl. Ready for vector store upload!")
