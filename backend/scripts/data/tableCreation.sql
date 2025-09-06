CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE kampung_kaki.t_users (
    user_id VARCHAR(128) PRIMARY KEY, 
    user_name VARCHAR(255),
    phone_number VARCHAR(255),
    home_address TEXT,
    pwd BOOLEAN,
    volunteer BOOLEAN,
    via_hours INTERVAL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Requests table
CREATE TABLE IF NOT EXISTS kampung_kaki.t_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id VARCHAR(128) NOT NULL,  -- FK to Firebase UID
    volunteer_id VARCHAR(128),           -- FK to Firebase UID
    request_title TEXT, 
    request_type TEXT, 
    request_description TEXT, 
    request_location TEXT, 
    request_initial_meet BOOLEAN, 
    request_time VARCHAR(255), 
    request_approx_duration INTERVAL, 
    request_priority TEXT,
    request_status TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_requester_requests FOREIGN KEY (requester_id) REFERENCES kampung_kaki.t_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_volunteer_requests FOREIGN KEY (volunteer_id) REFERENCES kampung_kaki.t_users(user_id) ON DELETE SET NULL
);

-- Accepted requests table
CREATE TABLE IF NOT EXISTS kampung_kaki.t_accepted_requests (
    request_id UUID PRIMARY KEY,
    requester_id VARCHAR(128) NOT NULL,
    volunteer_id VARCHAR(128),
    request_start_time TIMESTAMP, 
    request_end_time TIMESTAMP, 
    request_total_time INTERVAL,
    request_status TEXT,
    CONSTRAINT fk_request_accepted FOREIGN KEY (request_id) REFERENCES kampung_kaki.t_requests(request_id) ON DELETE CASCADE,
    CONSTRAINT fk_requester_accepted FOREIGN KEY (requester_id) REFERENCES kampung_kaki.t_users(user_id),
    CONSTRAINT fk_volunteer_accepted FOREIGN KEY (volunteer_id) REFERENCES kampung_kaki.t_users(user_id)
);

-- Chats table
CREATE TABLE IF NOT EXISTS kampung_kaki.t_chats (
    chat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL,
    requester_id VARCHAR(128) NOT NULL,
    volunteer_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_request_chats FOREIGN KEY (request_id) REFERENCES kampung_kaki.t_requests(request_id) ON DELETE CASCADE,
    CONSTRAINT fk_requester_chats FOREIGN KEY (requester_id) REFERENCES kampung_kaki.t_users(user_id),
    CONSTRAINT fk_volunteer_chats FOREIGN KEY (volunteer_id) REFERENCES kampung_kaki.t_users(user_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS kampung_kaki.t_chats_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES kampung_kaki.t_chats(chat_id) ON DELETE CASCADE,
    sender_id VARCHAR(128) REFERENCES kampung_kaki.t_users(user_id) ON DELETE SET NULL,
    message_type TEXT NOT NULL DEFAULT 'user',       -- user | system
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
