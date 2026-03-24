-- =============================================
-- TOUR PACKAGE BOOKING SYSTEM - COMPLETE SCHEMA
-- =============================================

DROP DATABASE IF EXISTS tour_booking_system;
CREATE DATABASE tour_booking_system;
USE tour_booking_system;

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 2. TOURS TABLE
-- =============================================
CREATE TABLE tours (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    duration INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discounted_price DECIMAL(10, 2),
    max_group_size INT NOT NULL,
    available_seats INT NOT NULL,
    description TEXT,
    itinerary TEXT,
    inclusions TEXT,
    exclusions TEXT,
    image_url VARCHAR(500),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    category VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_destination (destination),
    INDEX idx_start_date (start_date),
    INDEX idx_category (category),
    CONSTRAINT chk_seats CHECK (available_seats >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 3. BOOKINGS TABLE
-- =============================================
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    tour_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    number_of_people INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_tour_id (tour_id),
    INDEX idx_booking_reference (booking_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 4. PAYMENTS TABLE
-- =============================================
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    
    INDEX idx_booking_id (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 5. REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tour_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    
    INDEX idx_tour_id (tour_id),
    UNIQUE KEY unique_review (user_id, tour_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert Admin User
INSERT INTO users (name, email, password, phone, role) VALUES
('Admin User', 'admin@example.com', '$2a$10$rJxVYz5XJqKxMxLxYxLxYxLxYxLxYxLxYxLxYx', '9876543210', 'admin');

-- Insert Sample Tours
INSERT INTO tours (name, destination, duration, price, max_group_size, available_seats, description, image_url, start_date, end_date, category, is_featured) VALUES
('Paris Explorer', 'Paris, France', 5, 1500.00, 20, 15, 'Experience the magic of Paris with Eiffel Tower, Louvre Museum, and Seine River cruise.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', '2024-06-15', '2024-06-20', 'Europe', 1),
('Tokyo Adventure', 'Tokyo, Japan', 7, 2200.00, 15, 10, 'Discover the vibrant culture, amazing food, and modern technology of Tokyo.', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26', '2024-07-10', '2024-07-17', 'Asia', 1),
('Bali Paradise', 'Bali, Indonesia', 6, 1200.00, 25, 20, 'Relax on beautiful beaches, explore temples, and enjoy Balinese culture.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', '2024-08-05', '2024-08-11', 'Asia', 1),
('New York City', 'New York, USA', 4, 1800.00, 20, 12, 'Visit Times Square, Central Park, Statue of Liberty, and Broadway shows.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', '2024-09-01', '2024-09-05', 'North America', 1),
('Rome Historical', 'Rome, Italy', 5, 1400.00, 18, 14, 'Explore ancient ruins, Vatican City, and authentic Italian cuisine.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', '2024-10-10', '2024-10-15', 'Europe', 0),
('Dubai Luxury', 'Dubai, UAE', 5, 2500.00, 12, 8, 'Experience luxury shopping, desert safari, and Burj Khalifa.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', '2024-11-20', '2024-11-25', 'Middle East', 1),
('Swiss Alps', 'Switzerland', 7, 2800.00, 15, 10, 'Enjoy breathtaking mountain views, skiing, and scenic train rides.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc', '2024-12-15', '2024-12-22', 'Europe', 1);

-- Create View for Tour Availability
CREATE VIEW tour_availability AS
SELECT 
    t.*,
    t.available_seats - COALESCE(SUM(b.number_of_people), 0) as remaining_seats
FROM tours t
LEFT JOIN bookings b ON t.id = b.tour_id AND b.status NOT IN ('cancelled')
GROUP BY t.id;

-- Create Trigger for Booking Reference
DELIMITER //
CREATE TRIGGER before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    SET NEW.booking_reference = CONCAT('TRV', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));
END//
DELIMITER ;