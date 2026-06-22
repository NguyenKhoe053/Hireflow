-- CREATE DATABASE tuyenthuctap;
-- USE tuyenthuctap;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('candidate', 'recruiter') NOT NULL,
  skills TEXT,
  bio TEXT,
  resume_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  location VARCHAR(100),
  type VARCHAR(50),
  salary_range VARCHAR(100),
  description TEXT,
  requirements TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(50) PRIMARY KEY,
  job_id VARCHAR(50) NOT NULL,
  candidate_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'applied', -- applied, screening, interviewing, offered, rejected
  resume_url VARCHAR(255),
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interviews (
  id VARCHAR(50) PRIMARY KEY,
  application_id VARCHAR(50) NOT NULL,
  scheduled_at DATETIME,
  interviewer_name VARCHAR(100),
  meeting_link VARCHAR(255),
  score INT, -- 1-5
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
