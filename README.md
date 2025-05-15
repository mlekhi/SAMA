# Solar Alone Multiobjective Advisor

# SAMA Tool

## Overview
The SAMA Tool is a web application designed to help users configure and optimize renewable energy systems. It provides a step-by-step interface for entering geographical, economic, and technical parameters to simulate and analyze different energy configurations.

## Features
- **Geography & Economy**: Enter location and economic parameters.
- **Optimization**: Configure optimization settings for energy systems.
- **Grid Information**: Input grid-related parameters.
- **System Configuration**: Set up system components and parameters.
- **Component Information**: Detailed configuration for PV, Inverter, Diesel Generator, Battery, and Wind Turbine components.
- **Results**: View graphs, summaries, and time series data of the simulation results.

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd sama-tool
   ```

2. **Install Dependencies**:
   - **Backend**:
     ```bash
     cd backend
     pip install -r requirements.txt
     ```
   - **Frontend**:
     ```bash
     cd frontend
     npm install
     ```

3. **Run the Application**:
   - **Backend**:
     ```bash
     cd backend
     python app.py
     ```
   - **Frontend**:
     ```bash
     cd frontend
     npm start
     ```

4. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`.

## Usage
1. **Start Assessment**: Begin by selecting your location and entering economic parameters.
2. **Configure Components**: Follow the step-by-step guide to configure each component of your energy system.
3. **View Results**: After configuration, view the results in the graphs, summary, and time series sections.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
