CREATE TABLE IF NOT EXISTS email_change_requests (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    user_id BINARY(16) NOT NULL,
    old_email VARCHAR(255) NOT NULL,
    new_email VARCHAR(255) NOT NULL,
    old_code INT NOT NULL,
    new_code INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE
);

CREATE EVENT IF NOT EXISTS remove_expired_email_change_requests
ON SCHEDULE EVERY 1 HOUR
DO
DELETE FROM email_change_requests WHERE created_at < NOW() - INTERVAL 1 HOUR;
