CREATE TABLE IF NOT EXISTS kampung_kaki.t_users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255),
    email TEXT,
    phone_number VARCHAR(255),
    postal_code VARCHAR(255),
    home_address TEXT,
    via_points VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
);