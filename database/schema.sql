-- Database Schema for EV Charging Demand Predictor

CREATE DATABASE IF NOT EXISTS ev_charging_db;
USE ev_charging_db;

-- 1. Zones Table
CREATE TABLE IF NOT EXISTS zones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    population_density DOUBLE NOT NULL,
    avg_daily_traffic INT NOT NULL
);

-- 2. Stations Table (using Single Table Inheritance)
CREATE TABLE IF NOT EXISTS stations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_id BIGINT NOT NULL,
    station_type VARCHAR(30) NOT NULL,
    base_charging_rate DOUBLE NOT NULL,
    num_ports INT NOT NULL,
    operational BOOLEAN NOT NULL,
    daily_session_capacity INT NOT NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- 3. Demand Records Table
CREATE TABLE IF NOT EXISTS demand_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_id BIGINT NOT NULL,
    date DATE NOT NULL,
    sessions_count INT NOT NULL,
    peak_hour INT NOT NULL,
    avg_wait_time_minutes DOUBLE NOT NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- 4. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    battery_capacity DOUBLE NOT NULL,
    current_soc DOUBLE NOT NULL,
    target_soc DOUBLE NOT NULL
);
