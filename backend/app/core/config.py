
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "proyec1"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"

settings = Settings() 