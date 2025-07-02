# **SAMA Tool – Solar Alone Multiobjective Advisor**

SAMA is a web application that helps users configure and optimize renewable energy systems. Users input geographic, economic, and technical parameters through a guided interface to simulate various configurations and analyze results.

---

## 🚀 Features

* **Geography & Economy:** Input location and economic data
* **Grid Info:** Define grid-related parameters
* **System Configuration:** Set up PV, Inverter, Battery, Wind, Diesel, etc.
* **Optimization Settings:** Choose objectives and constraints
* **Component Details:** Configure technical parameters for each system part
* **Results:** Visualize simulation summaries, graphs, and time series

---

## ⚙️ Setup Instructions

### 1. **Clone the repository**

```bash
git clone <repository-url>
cd SAMA
```

### 2. **Backend Setup (Python/Flask)**

#### Create & activate a virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

#### Install dependencies

```bash
pip install -r requirements.txt
```

#### Database Setup (First-time users)

**Prerequisites:**
- PostgreSQL must be installed on your system
  - **macOS**: `brew install postgresql` or download from postgresql.org
  - **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
  - **Windows**: [Download the official PostgreSQL installer for Windows](https://www.postgresql.org/download/windows) and follow the setup instructions. 

**Setup Steps:**

1. **Create environment file:**
   ```bash
   # Create .env file in backend directory
   cat > .env << EOF
   # Database Configuration
   DATABASE_URL=postgresql://sama_user:sama_pass@localhost:5432/sama_db
   PG_DB=sama_db
   PG_USER=sama_user
   PG_PASS=sama_pass
   PG_HOST=localhost
   PG_PORT=5432
   PG_SUPERPASS=postgres
   
   # App Configuration
   SECRET_KEY=your-secret-key-here
   FLASK_DEBUG=True
   EOF
   ```

2. **Run database setup script:**
   ```bash
   python admin_setup_db.py
   ```
   
   This script will:
   - Create a PostgreSQL user and database
   - Set up all required tables
   - Configure the database connection

3. **Verify database setup:**
   ```bash
   python app.py
   ```
   
   The app should start without database errors. If you see "Tables created successfully" in the logs, the setup was successful.

#### Run the Flask server

```bash
python app.py
```

### 3. **Frontend Setup (Electron)**

#### Create environment file

```bash
cd ../frontend
# Create .env file for frontend
cat > .env << EOF
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Backend API URL
VITE_API_URL=http://127.0.0.1:5000
EOF
```

**Note:** You'll need to replace the Firebase configuration values with your actual Firebase project credentials. You can find these in your Firebase project console under Project Settings > General > Your apps.

#### Install dependencies and run

```bash
npm install
npm run dev
```

---

## 🧭 Usage Guide

1. **Start Assessment:** Choose location and input economic data
2. **Configure Components:** Follow the step-by-step UI
3. **Run Simulation:** Analyze performance through results pages

---

Contributions welcome!
