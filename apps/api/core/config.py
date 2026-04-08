# apps/api/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str
    
    DML_AUTH_KEY: str
    DML_AUTH_SECRET: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_EXPIRE_MINUTES: int
    FRONTEND_URL: str

    # Snipe-IT Configuration
    SNIPEIT_BASE_URL: str
    SNIPEIT_API_TOKEN: str
    SNIPEIT_TIMEOUT_SECONDS: int = 10
    SNIPEIT_DEPLOYABLE_STATUS_LABELS: str = "Ready to Deploy"  # Comma-separated list for dynamic resolution

    @property
    def DATABASE_URI(self) -> str:
        """
        Property that dynamically builds the valid SQLModel database URI.
        """
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Configuration to read from the .env file
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

# Create a global instance to import in other files
settings = Settings()