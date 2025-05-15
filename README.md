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

#### Run the Flask server

```bash
flask run
```

### 3. **Frontend Setup (React)**

```bash
cd ../frontend
npm install
npm start
```

---

## 🧭 Usage Guide

1. **Start Assessment:** Choose location and input economic data
2. **Configure Components:** Follow the step-by-step UI
3. **Run Simulation:** Analyze performance through results pages

---

Contributions welcome!
