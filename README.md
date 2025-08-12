# Employee Skills Tracking Portal

A comprehensive web application for tracking employee skills, assessments, and learning paths with role-based access control and real-time analytics.

## Features

### 🚀 Core Functionality
- **User Management**: Employee, Trainer, Manager, and Super-User roles
- **Skill Tracking**: Domain-based skill organization and assessment
- **Learning Paths**: Structured learning journeys with progress tracking
- **Real-time Analytics**: Performance metrics and skill distribution
- **Notification System**: Automated alerts and updates

### 🎯 Admin Dashboard (New!)
- **Domain Management**: Embedded, IT, Semicon, AI domains
- **Skill Organization**: Categorized skills per domain
- **User Filtering**: Filter by domain, skills, role, and department
- **Dynamic User Creation**: Add users with domain selection and skill tagging
- **Real-time Statistics**: Live dashboard with user and skill metrics
- **Advanced Filtering**: Highlight and unselect skills dynamically

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping
- **SQLite**: Lightweight database (can be upgraded to PostgreSQL/MySQL)
- **Pydantic**: Data validation using Python type annotations
- **JWT**: Secure authentication with JSON Web Tokens

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible UI components
- **Lucide React**: Consistent icon library

### Testing
- **Backend**: pytest with FastAPI TestClient
- **Frontend**: Vitest + React Testing Library

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Employee-Skills-Tracking-Portal
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Initialize database and seed data
python seed_data.py

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Database Schema

### Core Tables
- **users**: User accounts with roles and profiles
- **domains**: Skill domains (Embedded, IT, Semicon, AI)
- **skills**: Skills organized by domain and category
- **user_skills**: Many-to-many relationship between users and skills
- **scores**: Skill assessments and feedback
- **learning_paths**: Structured learning journeys
- **notifications**: System alerts and updates

### Key Relationships
- Users belong to domains
- Skills are organized by domains
- Users can have multiple skills with proficiency levels
- Learning paths are assigned to employees by managers/trainers

## API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `POST /api/v1/auth/login` - User authentication

### Protected Endpoints
- `GET /api/v1/admin/domains` - List all domains
- `GET /api/v1/admin/skills` - List skills (with optional domain filter)
- `GET /api/v1/admin/users` - List users with filtering
- `POST /api/v1/admin/users` - Create new user with skills
- `GET /api/v1/admin/stats` - Dashboard statistics

### User Management
- `GET /api/v1/users` - List users (role-based access)
- `PUT /api/v1/users/{id}` - Update user profile
- `DELETE /api/v1/users/{id}` - Delete user

## Admin Dashboard Usage

### 1. Access Control
- Login with super-user or manager role
- Navigate to Admin Dashboard

### 2. User Management
- **Add Users**: Click "Add User" button
- **Domain Selection**: Choose from Embedded, IT, Semicon, AI
- **Skill Assignment**: Click skills to select/deselect (highlighted when active)
- **Role Assignment**: Employee, Trainer, Manager, Super-User

### 3. Filtering and Search
- **Domain Filter**: Select specific domain to filter users
- **Skill Filter**: Choose skills to find users with specific expertise
- **Role Filter**: Filter by user role
- **Department Filter**: Filter by department

### 4. Real-time Statistics
- Total users, skills, and domains
- Users by role breakdown
- Skills distribution across domains
- Average skills per user

## Development

### Running Tests

#### Backend Tests
```bash
cd backend
pytest tests/ -v
```

#### Frontend Tests
```bash
cd frontend
npm run test
```

### Code Quality
```bash
# Backend
cd backend
black app/
flake8 app/

# Frontend
cd frontend
npm run lint
npm run type-check
```

### Database Migrations
The application uses SQLAlchemy's `create_all()` for table creation. For production:

1. Install Alembic: `pip install alembic`
2. Initialize: `alembic init alembic`
3. Create migrations: `alembic revision --autogenerate -m "Description"`
4. Apply: `alembic upgrade head`

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./skills_tracking.db
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Sample Data

The seed script creates:
- **4 Domains**: Embedded, IT, Semicon, AI
- **20 Skills**: 5 skills per domain
- **5 Sample Users**: Different roles and skill combinations

### Default Admin Account
- **Email**: admin@company.com
- **Password**: admin123
- **Role**: super-user

## Deployment

### Docker
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Production Considerations
- Use PostgreSQL or MySQL instead of SQLite
- Set up proper CORS configuration
- Implement rate limiting
- Use environment-specific configuration
- Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the test files for usage examples
