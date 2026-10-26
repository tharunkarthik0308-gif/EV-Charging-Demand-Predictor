# EV Charging Demand Predictor

A data-driven decision support system to forecast electric vehicle (EV) charging demand, analyze capacity deficits, and rank underserved city zones using a Heap Priority Queue.

This is an enterprise-grade full-stack decision-support system demonstrating encapsulation, inheritance, polymorphism, abstraction, and time-series statistical modeling for smart EV infrastructure planning.

---

## 🚀 Technical Stack

- **Frontend**: React (TSX), TypeScript, Tailwind CSS, Recharts (charts), React Router, Axios, Lucide React (icons)
- **Backend**: Java 17+, Spring Boot 3.x, Spring Data JPA, Maven
- **Database**: MySQL

---

## 🏢 Architecture

```text
React + TypeScript Frontend (Port 5173)
                 ↓
               Axios
                 ↓
     REST API / JSON Response
                 ↓
   Java Spring Boot Backend (Port 8080)
                 ↓
            Service Layer
                 ↓
    Mathematical Forecasting Engine
                 ↓
          MySQL Database
```

---

## 🧬 Object-Oriented Programming (OOP) Implementation

This project implements core OOP principles in the charging station hierarchy:

```text
                 [abstract] Station
                         ↓
      ┌──────────────────┼──────────────────┐
      ↓                  ↓                  ↓
FastChargingStation  SlowChargingStation  SolarChargingStation
```

### OOP Concepts Demonstrated:
1. **Abstraction**: The class `Station` is declared `abstract` and exposes the signature `calculateChargingTime(Vehicle vehicle)`. Concrete subclasses handle charging math.
2. **Inheritance**: `FastChargingStation`, `SlowChargingStation`, and `SolarChargingStation` extend the properties and fields of `Station`.
3. **Polymorphism**: The `calculateChargingTime` method is overridden differently by each concrete station:
   - **Fast Charging**: Evaluates battery State of Charge (SoC). It runs at 90% efficiency below 80% SoC, then slows down to 40% efficiency to protect the battery.
   - **Slow Charging**: Operates at a constant 85% efficiency.
   - **Solar Charging**: Integrates solar conversion efficiency (average 75%).
4. **Encapsulation**: Class fields are private and exposed via public getters/setters (Lombok generated).

---

## 📈 Mathematical Forecasting Formulas

The Java forecasting engine does not use machine learning libraries. It implements pure time-series statistics:

1. **Simple Moving Average (SMA)**:
   Averages the latest $N$ values in the rolling window:
   $$SMA = \frac{\sum_{i=1}^N y_i}{N}$$
2. **Weighted Moving Average (WMA)**:
   Assigns weights $1, 2, \dots, N$ (where $N$ is the window size) prioritizing recent observations:
   $$WMA = \frac{\sum_{i=1}^N (y_i \times i)}{\sum_{i=1}^N i}$$
3. **Linear Regression (Ordinary Least Squares)**:
   Fits a trendline $y = mx + c$ over the latest $N$ points and projects future days:
   $$m = \frac{N\sum xy - \sum x\sum y}{N\sum x^2 - (\sum x)^2}$$
   $$c = \frac{\sum y - m\sum x}{N}$$
4. **Ensemble Final Forecast**:
   Calculated as the arithmetic mean of all three model forecasts for each future day $t$:
   $$\text{Final Forecast}_t = \frac{\text{SMA}_t + \text{WMA}_t + \text{LR}_t}{3}$$

---

## 💾 Database Schema

The system uses 4 tables managed by Hibernate / Spring Data JPA. DDL is located in [`database/schema.sql`](file:///c:/Users/tharu/OneDrive/Ev-charger/database/schema.sql):

- **`zones`**: Stores sector metrics (population density, average traffic).
- **`stations`**: Single-table inheritance structure containing all active charging stations.
- **`demand_records`**: 90 days of chronological session counts, peak hours, and average waiting times.
- **`vehicles`**: EV metadata for charging simulation.

---

## 📡 REST API Documentation

### Zones
- `GET /api/zones` - Returns list of all city sectors.
- `GET /api/zones/{id}` - Returns profile and stations of a specific zone.

### Stations
- `GET /api/stations` - Returns all active charging stations.
- `GET /api/stations/zone/{zoneId}` - Returns stations operating in a specific zone.

### Historical Demand
- `GET /api/demand/{zoneId}` - Returns 90 days of daily session counts for charting.

### Calculations & Analytics
- `POST /api/forecast` - Executes SMA, WMA, LR, and Final Forecast. Body: `{"zoneId": 1, "windowSize": 7, "horizon": 7}`.
- `GET /api/analysis/gaps` - Compares average forecasted demand with total operational capacity.
- `GET /api/analysis/priority` - Uses `PriorityQueue` to rank under-served zones.

### Simulation & Reporting
- `POST /api/simulation` - Computes simulated capacity increase. Body: `{"zoneId": 1, "stationType": "FAST", "count": 2, "commit": false}`. Setting `commit: true` writes them permanently to the DB.
- `GET /api/reports?format=txt|csv` - Triggers CSV or TXT report download.

---

## 🛠️ Setup Instructions

### 1. MySQL Setup
Start your MySQL server and create the database:
```sql
CREATE DATABASE ev_charging_db;
```
Configure your connection credentials in [`backend/src/main/resources/application.properties`](file:///c:/Users/tharu/OneDrive/Ev-charger/backend/src/main/resources/application.properties):
```properties
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
```

### 2. Run the Java Backend
```bash
cd backend
mvn spring-boot:run
```
*Note: Upon first start, the database will automatically be seeded with 6 zones, stations, and 90 days of synthetic seasonal time-series data.*

### 3. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 💬 Technical Questions & System Architecture Deep-Dive

**Q1: What is the main objective of this application?**  
*A:* It is a decision-support tool for smart city planners. It predicts future EV charging demand across city zones, compares the demand against existing charger capacities, and ranks under-served sectors using a heap-based Priority Queue so planners know exactly where to install new stations.

**Q2: How does the application avoid using Machine Learning while still doing "predictions"?**  
*A:* We use pure statistical forecasting algorithms (Simple Moving Average, Weighted Moving Average, and Ordinary Least-Squares Linear Regression) implemented directly in Java. These are standard time-series modeling techniques that do not require neural networks or ML libraries.

**Q3: How are OOP principles demonstrated in your code?**  
*A:* We have an abstract base class `Station` with common fields like `baseChargingRate` and `numPorts` and an abstract method `calculateChargingTime`. Subclasses `FastChargingStation`, `SlowChargingStation`, and `SolarChargingStation` inherit these fields and override the method using different physics/efficiency equations (Polymorphism).

**Q4: How does the Priority Queue rank under-served zones?**  
*A:* The backend queries all zones, runs a forecast, and filters out zones that have adequate capacity. The remaining under-served zones (deficit gap > 0) are added to a Java `PriorityQueue<Zone>`. The custom comparator prioritizes zones with the highest deficit gap. The Priority Score calculation also factors in population density and traffic.

**Q5: What is the difference between a Forecast Window and Forecast Horizon?**  
*A:* The *Forecast Window* is the number of recent historical data points (e.g., latest 7 days) used to train/parameterize the models. The *Forecast Horizon* is the number of future days (e.g., next 7 days) we want to predict.
