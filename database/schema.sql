CREATE DATABASE IF NOT EXISTS calcmaster_pro;
USE calcmaster_pro;

CREATE TABLE IF NOT EXISTS calculation_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  calculator_type VARCHAR(100) NOT NULL,
  input_data TEXT NOT NULL,
  result TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_calculator_type (calculator_type),
  INDEX idx_timestamp (timestamp)
);
