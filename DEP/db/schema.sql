-- schema.sql

-- Drop tables if they exist to allow easy resetting
DROP TABLE IF EXISTS volunteer_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS papers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create the Users table
-- 1. Create the Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('AUTHOR', 'ADMIN', 'VOLUNTEER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, email)
);

-- 2. Create the Papers table
CREATE TABLE papers (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL, 
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author_name VARCHAR(255)  -- Added to persist author name at time of submission
);

-- 3. Create the Events table 
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create the Volunteer Registration junction table
CREATE TABLE volunteer_registrations (
    id SERIAL PRIMARY KEY,
    volunteer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    UNIQUE(volunteer_id, event_id) 
);

-- 5. Create Hostel Requests table
CREATE TABLE hostel_requests (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'REQUESTED_BY_AUTHOR' CHECK (status IN ('REQUESTED_BY_AUTHOR', 'FORWARDED_TO_HOSTEL', 'APPROVED_BY_HOSTEL', 'SUBMITTED_BY_AUTHOR')),
    hostel_start_date DATE,
    hostel_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(author_id, paper_id)
);

