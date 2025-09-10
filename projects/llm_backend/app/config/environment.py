from dotenv import load_dotenv
import os
from pydantic_settings import BaseSettings

load_dotenv(".env.local", override=True)

class Settings(BaseSettings):
    # LLM Settings
    llama3_url: str = os.getenv("LLAMA3_URL", "")
    llama3_api_key: str = os.getenv("LLAMA3_KEY", "")
    kiss_ki_url: str = os.getenv("KISS_KI_URL", "")
    kiss_ki_api_key: str = os.getenv("KISS_KI_KEY", "")
    kiss_ki_model: str = os.getenv("KISS_KI_MODEL", "")
    prompt_language: str = os.getenv("PROMPT_LANGUAGE", "en")
    
    # Database Settings
    database_url: str = os.getenv("DATABASE_URL", "mongodb://localhost:27017")
    
    # Authentication Settings
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    session_token_expire_days: int = int(os.getenv("SESSION_TOKEN_EXPIRE_DAYS", "7"))
    
    # Google OAuth Settings
    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")
    google_client_secret: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    # Email Settings (for support)
    email_sender_email: str = os.getenv("EMAIL_SENDER_EMAIL", "")
    email_sender_password: str = os.getenv("EMAIL_SENDER_PASSWORD", "")
    support_email_recipient: str = os.getenv("SUPPORT_EMAIL_RECIPIENT", "")
    
    model_config = {"env_file": ".env.local"}

def get_settings() -> Settings:
    return Settings()

# Legacy variables for backward compatibility
llama3_url = os.getenv("LLAMA3_URL", "")
llama3_api_key = os.getenv("LLAMA3_KEY", "")
kiss_ki_url = os.getenv("KISS_KI_URL", "")
kiss_ki_api_key = os.getenv("KISS_KI_KEY", "")
kiss_ki_model = os.getenv("KISS_KI_MODEL", "")
prompt_language = os.getenv("PROMPT_LANGUAGE", "en")
