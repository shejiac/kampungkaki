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
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS kampung_kaki.t_requests (
    request_id SERIAL PRIMARY KEY,   
    requester_id INT NOT NULL,        
    helper_id INT,                     
    request_title TEXT, 
    request_type TEXT, 
    request_description TEXT, 
    request_location TEXT, 
    request_initial_meet BOOLEAN, 
    request_time VARCHAR(255), 
    request_approx_duration VARCHAR(255), 
    request_priority TEXT,
    request_status TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    CONSTRAINT fk_requester FOREIGN KEY (requester_id) REFERENCES kampung_kaki.t_users(user_id),
    CONSTRAINT fk_helper FOREIGN KEY (helper_id) REFERENCES kampung_kaki.t_users(user_id)
);

CREATE TABLE IF NOT EXISTS kampung_kaki.t_accepted_requests (
    request_id SERIAL PRIMARY KEY,   
    requester_id INT NOT NULL,        
    helper_id INT,                     
    request_start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    request_end_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    request_total_time INT,
    request_status TEXT,
    CONSTRAINT fk_requester FOREIGN KEY (requester_id) REFERENCES kampung_kaki.t_users(user_id),
    CONSTRAINT fk_helper FOREIGN KEY (helper_id) REFERENCES kampung_kaki.t_users(user_id)
);
