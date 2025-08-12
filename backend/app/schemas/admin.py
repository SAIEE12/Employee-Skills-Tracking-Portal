from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreateWithSkills(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str
    department: Optional[str] = None
    experience: Optional[int] = None
    domain_id: str
    skill_ids: List[str] = []

class UserFilter(BaseModel):
    domain_id: Optional[str] = None
    skill_ids: Optional[List[str]] = None
    role: Optional[str] = None
    department: Optional[str] = None
    skip: int = 0
    limit: int = 100

class StatsResponse(BaseModel):
    total_users: int
    total_skills: int
    total_domains: int
    users_by_role: dict
    skills_by_domain: dict

class UserSkillAssignment(BaseModel):
    user_id: str
    skill_ids: List[str] 