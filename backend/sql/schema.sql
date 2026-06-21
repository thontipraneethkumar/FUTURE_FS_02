-- Mini CRM database schema (MySQL)
-- Run this once against your MySQL server:
--   mysql -u root -p < sql/schema.sql

CREATE DATABASE IF NOT EXISTS mini_crm
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mini_crm;

-- Admin users who can log into the dashboard
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads captured from website contact forms (or added manually)
CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  source VARCHAR(100) NOT NULL DEFAULT 'website',
  message TEXT,
  status ENUM('new', 'contacted', 'converted') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Follow-up notes attached to a lead (one lead can have many notes over time)
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- A few sample leads so the dashboard isn't empty on first run (optional)
INSERT INTO leads (name, email, phone, source, message, status) VALUES
  ('Asha Rao', 'asha.rao@example.com', '9876543210', 'website', 'Interested in your web design package.', 'new'),
  ('Vikram Iyer', 'vikram.iyer@example.com', '9876501234', 'instagram', 'Saw your ad, want pricing details.', 'contacted'),
  ('Priya Menon', 'priya.menon@example.com', '9876512345', 'referral', 'Referred by an existing client, ready to sign.', 'converted');
