-- User accounts table
-- This table stores all registered user accounts
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  isAdmin BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (username),
  INDEX (email)
);

-- Cart items table (updated with user relationship)
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  productType VARCHAR(50) NOT NULL,
  productId INT NOT NULL,
  productName VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  sessionId VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (userId),
  INDEX (sessionId),
  INDEX (productType, productId)
);

-- Orders table (updated with user relationship)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  customerName VARCHAR(255) NOT NULL,
  customerEmail VARCHAR(255) NOT NULL,
  customerPhone VARCHAR(50) NOT NULL,
  shippingAddress TEXT NOT NULL,
  totalAmount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX (userId),
  INDEX (status),
  INDEX (customerEmail)
);

-- Pre-create admin account
INSERT INTO users (username, password, firstName, lastName, email, isAdmin)
VALUES ('admin', '@Admin123', 'Admin', 'User', 'admin@bikeshop.com', TRUE)
ON DUPLICATE KEY UPDATE username = username;

-- Note: In production, passwords should be hashed using bcrypt or similar
