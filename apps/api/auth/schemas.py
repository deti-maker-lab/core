from pydantic import BaseModel, EmailStr

class UserData(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str