CREATE TABLE IF NOT EXISTS kampung_kaki.t_users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255),
    email TEXT,
    phone_number VARCHAR(255),
    postal_code VARCHAR(255),
    home_address TEXT,
    pwd BOOLEAN,
    helper BOOLEAN,
    via_points VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS kampung_kaki.t_requests{
    requester_id SERIAL PRIMARY KEY, 
    helper_id SERIAL PRIMARY KEY, 
    request_title TEXT, 
    request_type TEXT, 
    request_description TEXT, 
    request_location TEXT, 
    request_intial_meet BOOLEAN, 
    request_time VARCHAR(255), 
    request_approx_duration VARCHAR(255), 
    req_priority TEXT
};