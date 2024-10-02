from dotenv import load_dotenv
import os

load_dotenv(".env.local", override=True)

llama3_url = os.getenv("LLAMA3_URL", "")
llama3_api_key = os.getenv("LLAMA3_KEY", "")
