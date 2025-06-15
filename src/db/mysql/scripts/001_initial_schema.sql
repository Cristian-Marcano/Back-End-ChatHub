CREATE TABLE user_account (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    keyword VARCHAR(320) NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE user_account_info (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    photo VARCHAR(2000) NOT NULL,
    about VARCHAR(200) NOT NULL,
    user_id BINARY(16) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_account(id)
);

CREATE TABLE friendship (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    primary_user_id BINARY(16) NOT NULL,
    secondary_user_id BINARY(16) NOT NULL,
    primary_state ENUM('pending', 'blocked', 'accepted') DEFAULT 'pending',
    secondary_state ENUM('pending', 'blocked', 'accepted') DEFAULT 'pending',
    create_at TIMESTAMP NOT NULL DEFAULT (NOW()),
    update_at TIMESTAMP,
    FOREIGN KEY (primary_user_id) REFERENCES user_account(id),
    FOREIGN KEY (secondary_user_id) REFERENCES user_account(id),
    CONSTRAINT check_different_users CHECK (primary_user_id <> secondary_user_id),
    CONSTRAINT check_user_order CHECK (primary_user_id < secondary_user_id),
    UNIQUE KEY(primary_user_id, secondary_user_id)
);

CREATE TABLE chat (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    create_at TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE friendship_chat (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    friendship_id INT UNSIGNED UNIQUE NOT NULL,
    chat_id INT UNSIGNED NOT NULL,
    primary_nickname VARCHAR(100),
    secondary_nickname VARCHAR(100),
    FOREIGN KEY (friendship_id) REFERENCES friendship(id),
    FOREIGN KEY (chat_id) REFERENCES chat(id)
);

CREATE TABLE group_chat (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL,
    create_by BINARY(16) NOT NULL,
    chat_id INT UNSIGNED UNIQUE NOT NULL,
    FOREIGN KEY (create_by) REFERENCES user_account(id),
    FOREIGN KEY (chat_id) REFERENCES chat(id)
);

CREATE TABLE group_members (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id BINARY(16) NOT NULL,
    group_chat_id INT UNSIGNED NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT (NOW()),
    FOREIGN KEY (member_id) REFERENCES user_account(id),
    FOREIGN KEY (group_chat_id) REFERENCES group_chat(id),
    UNIQUE KEY(member_id, group_chat_id)
);

CREATE TABLE message (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_sending_id BINARY(16) NOT NULL,
    chat_id INT UNSIGNED NOT NULL,
    msg_text TEXT NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT (NOW()), 
    update_at TIMESTAMP,
    censored BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_sending_id) REFERENCES user_account(id),
    FOREIGN KEY (chat_id) REFERENCES chat(id)
);

CREATE TABLE message_view (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    message_id INT UNSIGNED NOT NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT (NOW()),
    FOREIGN KEY (user_id) REFERENCES user_account(id),
    FOREIGN KEY (message_id) REFERENCES message(id),
    UNIQUE KEY(user_id, message_id)
);

CREATE TABLE temp_emails (
    email VARCHAR(320) PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    keyword VARCHAR(100) NOT NULL,
    cod INT UNSIGNED NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT (NOW())
);