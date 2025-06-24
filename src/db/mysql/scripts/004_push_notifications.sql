CREATE TABLE push_subscriptions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    device_type ENUM('web', 'android', 'ios') DEFAULT 'web',
    endpoint VARCHAR(2000) NOT NULL,
    p256dh VARCHAR(255),
    auth VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT (NOW()),
    FOREIGN KEY (user_id) REFERENCES user_account(id),
    UNIQUE KEY(user_id, endpoint(255))
);
