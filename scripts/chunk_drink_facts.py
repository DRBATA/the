import openai
import json

# Set your OpenAI API key (use env variable or .env in production!)
openai.api_key = "YOUR_OPENAI_API_KEY_HERE"

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

# Load your batch of products (expects products.jsonl with one product per line)
batch = []
with open("products.jsonl") as f:
    for _ in range(2):  # Change 2 to desired batch size
        line = f.readline()
        if not line:
            break
        batch.append(json.loads(line))

prompt = f"""For each of these products, output **exactly** 5–6 chunks as JSON:\n{json.dumps(batch, indent=2)}\nChunks must follow the schema:\n- id: brand_slug + layer (e.g. 'humantra_snapshot')\n- text: concise prose (≤250 tokens)\n- metadata: as we discussed (brand, sugar_free, price_aed_serving, sodium_mg, …, data_type)\nReturn via the `make_chunks` function."""

resp = openai.ChatCompletion.create(
    model="gpt-4-0613",
    messages=[{"role": "user", "content": prompt}],
    functions=functions,
    function_call={"name": "make_chunks"}
)

# Parse out the JSON
chunks = json.loads(resp["choices"][0]["message"]["function_call"]["arguments"])["chunks"]

# Save the chunks to a file for upload
with open("drink_chunks.jsonl", "w") as out:
    for chunk in chunks:
        out.write(json.dumps(chunk) + "\n")

print(f"Wrote {len(chunks)} chunks to drink_chunks.jsonl. Ready for vector store upload!")
