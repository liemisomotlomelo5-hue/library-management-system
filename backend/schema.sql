-- Library Management System Database Schema
-- Run this in MySQL to set up the database

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  isbn VARCHAR(20) UNIQUE NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  membership_id VARCHAR(50) UNIQUE NOT NULL,
  role ENUM('admin', 'member', 'librarian') DEFAULT 'member',
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT,
  type ENUM('borrow', 'return', 'add_stock') NOT NULL,
  quantity INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Sample books only (no default users — create your own via the app)
INSERT INTO books (title, author, genre, isbn, quantity) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', '9780743273565', 5),
('To Kill a Mockingbird', 'Harper Lee', 'Fiction', '9780061120084', 3),
('1984', 'George Orwell', 'Dystopian', '9780451524935', 4),
('Pride and Prejudice', 'Jane Austen', 'Romance', '9780141439518', 2),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', '9780547928227', 1);
