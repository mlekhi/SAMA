# SAMA Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Development Workflow](#development-workflow)
7. [Key Components](#key-components)
8. [Data Flow](#data-flow)
9. [Contributing Guidelines](#contributing-guidelines)

## Project Overview

SAMA (Solar Analysis and Modeling Application) is a web-based application for optimizing renewable energy systems. It helps users design and analyze solar photovoltaic systems, wind turbines, battery storage, and diesel generators to find the most cost-effective and efficient energy solutions.

### Key Features
- **Multi-component optimization**: PV, Wind, Battery, Diesel Generator, Grid
- **Geographic analysis**: Location-based solar and wind data
- **Economic modeling**: Cost analysis, tax incentives, grid pricing
- **Real-time optimization**: Particle Swarm Optimization (PSO) algorithm
- **Visual results**: Generated charts and analysis reports
- **User authentication**: Firebase-based user management

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Sama          │
│   (React)       │◄──►│   (Flask)       │◄──►│   Engine        │
│                 │    │                 │    │   (Python)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Firebase      │    │   SQLite        │    │   Generated     │
│   Auth          │    │   Database      │    │   Files         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### System Architecture Diagram

```
User Interface Layer
├── React Frontend (Electron)
│   ├── Authentication (Firebase)
│   ├── Form Components
│   └── Results Display
│
API Layer
├── Flask Backend
│   ├── REST API Endpoints
│   ├── Authentication Middleware
│   ├── Database Operations
│   └── File Management
│
Business Logic Layer
├── Python Optimization Engine
│   ├── PSO Algorithm
│   ├── Component Models
│   ├── Economic Calculations
│   └── Data Processing
│
Data Layer
├── SQLite Database
│   ├── User Configurations
│   ├── Geographic Data
│   └── Economic Parameters
├── Generated Files
│   ├── Analysis Charts
│   └── Data Reports
└── External APIs
    ├── Solar Data
    ├── Wind Data
    └── Geographic Services
```

## Technology Stack

### Frontend
- **React 18**: UI framework
- **Electron**: Desktop application wrapper
- **Material-UI**: Component library
- **React Router**: Navigation
- **Firebase Auth**: User authentication
- **OpenStreetMap**: Geographic data

### Backend
- **Flask**: Web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Database
- **Firebase Admin**: Authentication verification
- **CORS**: Cross-origin resource sharing

### Optimization Engine
- **Python 3.8+**: Core language
- **NumPy**: Numerical computations
- **Matplotlib**: Chart generation
- **Pandas**: Data manipulation
- **PSO Algorithm**: Custom optimization implementation

## Project Structure

```
SAMA-new/
├── frontend/                          # React/Electron frontend
│   ├── src/
│   │   ├── renderer/                  # Main application code
│   │   │   ├── components/            # Reusable UI components
│   │   │   ├── pages/                 # Page components
│   │   │   │   ├── optional/          # Optional component configs
│   │   │   │   └── ...
│   │   │   ├── App.jsx                # Main app component
│   │   │   └── index.js               # Entry point
│   │   └── main/                      # Electron main process
│   ├── package.json
│   └── electron-builder.json
│
├── backend/                           # Flask backend
│   ├── app.py                         # Main Flask application
│   ├── models.py                      # Database models
│   ├── config.py                      # Configuration
│   ├── sama_python/                   # Optimization engine
│   │   ├── pso.py                     # PSO algorithm
│   │   ├── swarm.py                   # Swarm implementation
│   │   ├── Results.py                 # Results generation
│   │   ├── Fitness.py                 # Fitness functions
│   │   └── ...
│   ├── sama.db                        # SQLite database
│   └── requirements.txt
│
├── README.md
└── CONTRIBUTING.md
```

## Getting Started

### Prerequisites
- Node.js 16+
- Python 3.8+
- Git

## Development Workflow

### Data Flow Diagram

```
User Input → Frontend Forms → API Calls → Backend Processing → Database Storage
     ↓
Optimization Request → Python Engine → PSO Algorithm → Results Generation
     ↓
Generated Files → File Storage → Frontend Display → User Download
```

### User Journey

1. **Authentication**: User logs in via Firebase
2. **Geography & Economy**: Set location and economic parameters
3. **Optimization Settings**: Configure PSO algorithm parameters
4. **System Configuration**: Define system lifetime and constraints
5. **Component Selection**: Choose PV, Wind, Battery, Diesel, Grid
6. **Component Configuration**: Set technical and economic parameters
7. **Analysis**: Run optimization and generate results
8. **Results**: View charts and download files

## Key Components

### Frontend Components

#### Core Pages
- **Geography.jsx**: Location selection and economic parameters
- **Optimization.jsx**: PSO algorithm configuration
- **SystemConfig.jsx**: System parameters and component selection
- **Grid.jsx**: Grid connection configuration
- **Results.jsx**: Analysis results and file downloads

#### Optional Components
- **PV.jsx**: Photovoltaic system configuration
- **Inverter.jsx**: Inverter specifications
- **Battery.jsx**: Battery storage configuration
- **Diesel.jsx**: Diesel generator configuration

#### Reusable Components
- **Search.jsx**: Address search with OpenStreetMap
- **Map.jsx**: Interactive map display
- **NextPageButton.jsx**: Navigation button
- **SaveMessageAlert.jsx**: Status notifications

### Backend Components

#### API Endpoints
```python
# User Management
POST /api/geography-economy     # Save location and economic data
POST /api/optimization          # Save optimization parameters
POST /api/system-config         # Save system configuration
POST /api/grid                  # Save grid configuration
POST /api/pv-config             # Save PV configuration
POST /api/inverter-config       # Save inverter configuration
POST /api/battery-config        # Save battery configuration
POST /api/dg-config             # Save diesel generator configuration
POST /api/submit                # Run optimization analysis
GET  /api/files/{user_id}       # Get generated files
GET  /api/download/{user_id}/{type}/{filename}  # Download files
```

#### Database Models
```python
class GeographyEconomy(db.Model):
    # Location and economic parameters
    
class Optimization(db.Model):
    # PSO algorithm parameters
    
class SystemConfig(db.Model):
    # System configuration and component selection
    
class Grid(db.Model):
    # Grid connection parameters
    
class PhotovoltaicSystem(db.Model):
    # PV system specifications
    
class Inverter(db.Model):
    # Inverter specifications
    
class Battery(db.Model):
    # Battery storage parameters
    
class DieselGenerator(db.Model):
    # Diesel generator parameters
```

### Optimization Engine

#### PSO Algorithm Flow
```
1. Initialize Population
   ├── Random positions for each particle
   ├── Velocity vectors
   └── Personal best positions
   
2. Evaluate Fitness
   ├── Calculate system cost
   ├── Check constraints (LPSP, RE%)
   └── Return fitness value
   
3. Update Particles
   ├── Update velocities
   ├── Update positions
   └── Update personal bests
   
4. Repeat until convergence
   ├── Max iterations reached
   └── Or fitness threshold met
   
5. Generate Results
   ├── Optimal configuration
   ├── Cost analysis
   └── Performance charts
```

## Data Flow

### Detailed Data Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │  Frontend   │    │   Backend   │    │  Database   │
│  Input      │───►│   Forms     │───►│   API       │───►│   Storage   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Generated   │◄───│  Python     │◄───│  InData     │◄───│  User Data  │
│  Files      │    │  Engine     │    │  Class      │    │  Loading    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ File        │    │ PSO         │    │ Component   │    │ SQLite      │
│ Storage     │    │ Algorithm   │    │ Models      │    │ Database    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Contributing Guidelines

### Code Style

#### Frontend (React/JavaScript)
- Use functional components with hooks
- Follow Material-UI design patterns
- Use consistent naming conventions
- Add PropTypes for component validation

#### Backend (Python)
- Follow PEP 8 style guide
- Use type hints where appropriate
- Add docstrings to functions
- Use SQLAlchemy for database operations

### Documentation

- Update this file for architectural changes
- Add inline code comments
- Update API documentation
- Create user guides for new features

## Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**
   - Check `firebase_service_account.json` configuration
   - Verify Firebase project settings
   - Ensure CORS is properly configured

2. **Database Connection Issues**
   - Check SQLite file permissions
   - Verify database schema migrations
   - Ensure proper database initialization

3. **Optimization Engine Errors**
   - Check Python dependencies
   - Verify input data validation
   - Review PSO algorithm parameters

4. **File Generation Issues**
   - Check file system permissions
   - Verify output directory exists
   - Review matplotlib backend configuration

## Performance Considerations

### Optimization
- PSO algorithm performance depends on population size and iterations
- Database queries are optimized with proper indexing
- File generation uses efficient matplotlib backends

### Scalability
- SQLite suitable for single-user deployments
- Consider PostgreSQL for multi-user scenarios
- File storage can be moved to cloud storage