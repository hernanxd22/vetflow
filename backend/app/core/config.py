from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "vetflow-secret-key"

    class Config:
        env_file = ".env"

settings = Settings()