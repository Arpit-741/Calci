-- Insert a calculation
INSERT INTO calculation_history (calculator_type, input_data, result)
VALUES (?, ?, ?);

-- View recent history
SELECT id, calculator_type, input_data, result, timestamp
FROM calculation_history
ORDER BY timestamp DESC
LIMIT 200;

-- Search history
SELECT id, calculator_type, input_data, result, timestamp
FROM calculation_history
WHERE calculator_type LIKE ? OR input_data LIKE ? OR result LIKE ?
ORDER BY timestamp DESC;

-- Delete one history record
DELETE FROM calculation_history WHERE id = ?;

-- Clear all history
DELETE FROM calculation_history;
