from pydantic import BaseModel, EmailStr, Field

class RegisterInput(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8)
    subscription_type_id: int = Field(gt=0)

class LoginInput(BaseModel):
    email: EmailStr
    password: str