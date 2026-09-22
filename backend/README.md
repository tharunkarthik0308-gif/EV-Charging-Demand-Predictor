# EV Charging Demand Predictor - Java Backend

Spring Boot REST API backend powered by MySQL.

## Structure
- **`com.evpredictor.model`**: Contains entity definitions (`Zone`, `DemandRecord`, `Vehicle`) and polymorphic station hierarchies (`Station`, `FastChargingStation`, etc.).
- **`com.evpredictor.forecast`**: Math forecasting interface, abstract class, and concrete implementations (SMA, WMA, Linear Regression) alongside `ForecastResult` DTO.
- **`com.evpredictor.repository`**: Standard JpaRepositories.
- **`com.evpredictor.service`**: Business logic covering ensemble forecasting, gap analysis, dynamic PriorityQueue ranking, asset recommendations, report generation, and database seeding.
- **`com.evpredictor.controller`**: REST controllers.

## Prerequisites
- Java 17 or higher
- Maven installed
- MySQL Server running on port 3306

## Commands
- **Run the backend**:
  ```bash
  mvn spring-boot:run
  ```
- **Execute unit tests**:
  ```bash
  mvn test
  ```
