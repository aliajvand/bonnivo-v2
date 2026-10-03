import asyncio
import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GROQ_API_KEY")
model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

async def test_groq():
    print(f"[*] Testing Groq API with model: {model}")
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant. Output valid JSON."},
                    {"role": "user", "content": "Return a JSON object with title_fa and seo_title for Royal Canin Cat Food."},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2,
            },
        )
        print("Status Code:", resp.status_code)
        if resp.status_code == 200:
            content = resp.json()["choices"][0]["message"]["content"]
            print("Content:", content)
        else:
            print("Error Text:", resp.text)

if __name__ == "__main__":
    asyncio.run(test_groq())
