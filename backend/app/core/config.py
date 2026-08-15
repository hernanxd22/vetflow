
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "proyec1"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""

    N8N_WEBHOOK_URL: str = ""
    # Shared secret sent to the n8n webhook so it can reject direct calls.
    N8N_WEBHOOK_TOKEN: str = ""

    # Signing key for access tokens. Must be set in production.
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480

    # Comma-separated list of allowed browser origins. "*" allows any origin.
    CORS_ORIGINS: str = "*"

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    def get_cors_origins(self) -> list[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        return origins or ["*"]

    class Config:
        env_file = ".env"

settings = Settings()
