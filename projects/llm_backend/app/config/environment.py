from dotenv import load_dotenv
import os

load_dotenv(".env.local", override=True)

llama3_url = os.getenv("LLAMA3_URL", "")
llama3_api_key = os.getenv("LLAMA3_KEY", "")

kiss_ki_url = os.getenv("KISS_KI_URL", "")
kiss_ki_api_key = os.getenv("KISS_KI_KEY", "")
kiss_ki_model = os.getenv("KISS_KI_MODEL", "")

prompt_language = os.getenv("PROMPT_LANGUAGE", "en")
