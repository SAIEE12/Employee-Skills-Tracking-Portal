from pydantic import BaseModel, EmailStr
from typing import Optional

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str
    avatar: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[int] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    avatar: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[int] = None
    
    class Config:
        from_attributes = True 
class LoginResponse(Token):
    user: UserResponse