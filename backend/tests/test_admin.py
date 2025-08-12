import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.core.security import create_access_token
from app.db.models import User, Domain, Skill

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client():
    return TestClient(app)

@pytest.fixture(scope="function")
def admin_user(db_session):
    user = User(
        email="admin@test.com",
        name="Admin User",
        hashed_password="hashed_password",
        role="super-user"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def admin_token(admin_user):
    return create_access_token(data={"sub": admin_user.email})

@pytest.fixture(scope="function")
def sample_domains(db_session):
    domains = [
        Domain(name="Embedded", description="Embedded systems"),
        Domain(name="IT", description="Information Technology"),
        Domain(name="AI", description="Artificial Intelligence")
    ]
    for domain in domains:
        db_session.add(domain)
    db_session.commit()
    return domains

@pytest.fixture(scope="function")
def sample_skills(db_session, sample_domains):
    skills = []
    for domain in sample_domains:
        skill = Skill(
            name=f"Skill in {domain.name}",
            category="Technical",
            description=f"Description for {domain.name} skill",
            domain_id=domain.id
        )
        db_session.add(skill)
        skills.append(skill)
    db_session.commit()
    return skills

class TestAdminEndpoints:
    def test_get_domains(self, client, sample_domains):
        """Test getting all domains."""
        response = client.get("/api/v1/admin/domains")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 3
        assert any(domain["name"] == "Embedded" for domain in data)
        assert any(domain["name"] == "IT" for domain in data)
        assert any(domain["name"] == "AI" for domain in data)
    
    def test_get_skills_without_domain_filter(self, client, sample_skills):
        """Test getting all skills without domain filter."""
        response = client.get("/api/v1/admin/skills")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 3
        assert all("domain_id" in skill for skill in data)
    
    def test_get_skills_with_domain_filter(self, client, sample_domains, sample_skills):
        """Test getting skills filtered by domain."""
        domain_id = sample_domains[0].id
        response = client.get(f"/api/v1/admin/skills?domain_id={domain_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["domain_id"] == domain_id
    
    def test_get_users_without_filters(self, client, admin_token, admin_user):
        """Test getting users without filters."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/api/v1/admin/users", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["email"] == admin_user.email
    
    def test_get_users_with_domain_filter(self, client, admin_token, sample_domains, admin_user):
        """Test getting users filtered by domain."""
        # Update admin user to have a domain
        admin_user.domain_id = sample_domains[0].id
        client.app.dependency_overrides[get_db]().commit()
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get(f"/api/v1/admin/users?domain_id={sample_domains[0].id}", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["domain"]["id"] == sample_domains[0].id
    
    def test_create_user_with_skills(self, client, admin_token, sample_domains, sample_skills):
        """Test creating a new user with skills."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        user_data = {
            "email": "newuser@test.com",
            "name": "New User",
            "password": "password123",
            "role": "employee",
            "department": "Engineering",
            "experience": 3,
            "domain_id": sample_domains[0].id,
            "skill_ids": [sample_skills[0].id]
        }
        
        response = client.post("/api/v1/admin/users", json=user_data, headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["name"] == user_data["name"]
        assert data["role"] == user_data["role"]
        assert data["domain"]["id"] == sample_domains[0].id
        assert len(data["skills"]) == 1
        assert data["skills"][0]["id"] == sample_skills[0].id
    
    def test_get_stats(self, client, admin_token, sample_domains, sample_skills, admin_user):
        """Test getting dashboard statistics."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/api/v1/admin/stats", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["total_users"] == 1
        assert data["total_skills"] == 3
        assert data["total_domains"] == 3
        assert "users_by_role" in data
        assert "skills_by_domain" in data
    
    def test_unauthorized_access(self, client):
        """Test that unauthorized users cannot access admin endpoints."""
        # Test without token
        response = client.get("/api/v1/admin/users")
        assert response.status_code == 401
        
        response = client.post("/api/v1/admin/users", json={})
        assert response.status_code == 401
        
        response = client.get("/api/v1/admin/stats")
        assert response.status_code == 401

class TestDomainEndpoints:
    def test_get_domains_pagination(self, client, sample_domains):
        """Test domain pagination."""
        response = client.get("/api/v1/admin/domains?skip=1&limit=2")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 2

class TestSkillEndpoints:
    def test_get_skills_pagination(self, client, sample_skills):
        """Test skill pagination."""
        response = client.get("/api/v1/admin/skills?skip=1&limit=2")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 2

class TestUserEndpoints:
    def test_get_users_pagination(self, client, admin_token, admin_user):
        """Test user pagination."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/api/v1/admin/users?skip=0&limit=10", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1
    
    def test_get_users_with_role_filter(self, client, admin_token, admin_user):
        """Test getting users filtered by role."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/api/v1/admin/users?role=super-user", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["role"] == "super-user" 