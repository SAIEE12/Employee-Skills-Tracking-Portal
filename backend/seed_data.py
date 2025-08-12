#!/usr/bin/env python3
"""
Seed script to populate the database with initial data for the Employee Skills Tracking Portal.
This script creates domains, skills, and sample users.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.db import crud
from app.utils.password import get_password_hash
from app.db.models import Domain, Skill, User, user_skills
from sqlalchemy import text

def seed_domains():
    """Seed domains with predefined data."""
    domains_data = [
        {"name": "Embedded", "description": "Embedded systems and IoT development"},
        {"name": "IT", "description": "Information Technology and Infrastructure"},
        {"name": "Semicon", "description": "Semiconductor and Hardware Engineering"},
        {"name": "AI", "description": "Artificial Intelligence and Machine Learning"}
    ]
    
    domains = []
    for domain_data in domains_data:
        domain = crud.create_domain(
            db=db,
            name=domain_data["name"],
            description=domain_data["description"]
        )
        domains.append(domain)
        print(f"Created domain: {domain.name}")
    
    return domains

def seed_skills(domains):
    """Seed skills for each domain."""
    skills_data = {
        "Embedded": [
            {"name": "C Programming", "category": "Programming", "description": "Low-level C programming for embedded systems"},
            {"name": "RTOS", "category": "Operating Systems", "description": "Real-time operating systems"},
            {"name": "Microcontrollers", "category": "Hardware", "description": "Microcontroller programming and interfacing"},
            {"name": "Embedded Linux", "category": "Operating Systems", "description": "Linux for embedded devices"},
            {"name": "Firmware Development", "category": "Development", "description": "Firmware and bootloader development"}
        ],
        "IT": [
            {"name": "Network Administration", "category": "Networking", "description": "Network setup and maintenance"},
            {"name": "System Administration", "category": "Systems", "description": "Server and system management"},
            {"name": "Cloud Computing", "category": "Cloud", "description": "AWS, Azure, GCP platforms"},
            {"name": "Cybersecurity", "category": "Security", "description": "Security protocols and practices"},
            {"name": "Database Management", "category": "Databases", "description": "SQL and NoSQL databases"}
        ],
        "Semicon": [
            {"name": "VLSI Design", "category": "Design", "description": "Very Large Scale Integration design"},
            {"name": "Digital Design", "category": "Design", "description": "Digital circuit design"},
            {"name": "Analog Design", "category": "Design", "description": "Analog circuit design"},
            {"name": "Physical Design", "category": "Design", "description": "Physical layout and verification"},
            {"name": "Verification", "category": "Testing", "description": "Design verification and validation"}
        ],
        "AI": [
            {"name": "Machine Learning", "category": "ML", "description": "Supervised and unsupervised learning"},
            {"name": "Deep Learning", "category": "ML", "description": "Neural networks and deep learning"},
            {"name": "Computer Vision", "category": "AI", "description": "Image and video processing"},
            {"name": "NLP", "category": "AI", "description": "Natural Language Processing"},
            {"name": "Data Science", "category": "Analytics", "description": "Data analysis and visualization"}
        ]
    }
    
    skills = []
    for domain in domains:
        domain_skills = skills_data.get(domain.name, [])
        for skill_data in domain_skills:
            skill = crud.create_skill(
                db=db,
                name=skill_data["name"],
                category=skill_data["category"],
                description=skill_data["description"],
                domain_id=domain.id
            )
            skills.append(skill)
            print(f"Created skill: {skill.name} in domain {domain.name}")
    
    return skills

def seed_users(domains, skills):
    """Seed sample users with skills."""
    users_data = [
        {
            "email": "john.embedded@company.com",
            "name": "John Smith",
            "password": "password123",
            "role": "employee",
            "department": "Engineering",
            "experience": 5,
            "domain": "Embedded",
            "skills": ["C Programming", "RTOS", "Microcontrollers"]
        },
        {
            "email": "sarah.it@company.com",
            "name": "Sarah Johnson",
            "password": "password123",
            "role": "employee",
            "department": "IT",
            "experience": 3,
            "domain": "IT",
            "skills": ["Network Administration", "System Administration", "Cloud Computing"]
        },
        {
            "email": "mike.semicon@company.com",
            "name": "Mike Wilson",
            "password": "password123",
            "role": "employee",
            "department": "Hardware",
            "experience": 7,
            "domain": "Semicon",
            "skills": ["VLSI Design", "Digital Design", "Physical Design"]
        },
        {
            "email": "emma.ai@company.com",
            "name": "Emma Davis",
            "password": "password123",
            "role": "employee",
            "department": "Research",
            "experience": 4,
            "domain": "AI",
            "skills": ["Machine Learning", "Deep Learning", "Computer Vision"]
        },
        {
            "email": "admin@company.com",
            "name": "Admin User",
            "password": "admin123",
            "role": "super-user",
            "department": "Management",
            "experience": 10,
            "domain": "IT",
            "skills": ["System Administration", "Cybersecurity"]
        }
    ]
    
    users = []
    for user_data in users_data:
        # Find domain
        domain = next((d for d in domains if d.name == user_data["domain"]), None)
        
        # Create user
        user = crud.create_user(
            db=db,
            email=user_data["email"],
            name=user_data["name"],
            password=user_data["password"],
            role=user_data["role"],
            department=user_data["department"],
            experience=user_data["experience"],
            domain_id=domain.id if domain else None
        )
        
        # Assign skills
        if user_data["skills"]:
            skill_ids = []
            for skill_name in user_data["skills"]:
                skill = next((s for s in skills if s.name == skill_name), None)
                if skill:
                    skill_ids.append(skill.id)
            
            if skill_ids:
                # Remove existing skills
                db.execute(user_skills.delete().where(user_skills.c.user_id == user.id))
                
                # Add new skills
                for skill_id in skill_ids:
                    db.execute(user_skills.insert().values(
                        user_id=user.id,
                        skill_id=skill_id
                    ))
                db.commit()
        
        users.append(user)
        print(f"Created user: {user.name} ({user.role})")
    
    return users

def main():
    """Main seeding function."""
    global db
    db = SessionLocal()
    
    try:
        print("Starting database seeding...")
        
        # Clear existing data (optional - comment out if you want to preserve data)
        print("Clearing existing data...")
        db.execute(text("DELETE FROM user_skills"))
        db.execute(text("DELETE FROM scores"))
        db.execute(text("DELETE FROM learning_steps"))
        db.execute(text("DELETE FROM learning_paths"))
        db.execute(text("DELETE FROM notifications"))
        db.execute(text("DELETE FROM users"))
        db.execute(text("DELETE FROM skills"))
        db.execute(text("DELETE FROM domains"))
        db.commit()
        
        # Seed domains
        print("\nSeeding domains...")
        domains = seed_domains()
        
        # Seed skills
        print("\nSeeding skills...")
        skills = seed_skills(domains)
        
        # Seed users
        print("\nSeeding users...")
        users = seed_users(domains, skills)
        
        print(f"\nSeeding completed successfully!")
        print(f"Created {len(domains)} domains")
        print(f"Created {len(skills)} skills")
        print(f"Created {len(users)} users")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main() 