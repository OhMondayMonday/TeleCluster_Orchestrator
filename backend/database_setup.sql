-- ==============================================================================
-- TeleCluster Orchestrator - Database Setup Script
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS orchestrator
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE orchestrator;

-- ==============================================================================
-- TABLES
-- ==============================================================================

-- ROLES (3 roles: superadmin, profesor, alumno)
CREATE TABLE IF NOT EXISTS roles (
  id   TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(32) NOT NULL,
  CONSTRAINT pk_roles PRIMARY KEY (id),
  CONSTRAINT uk_roles_name UNIQUE (name),
  CONSTRAINT ck_roles_name CHECK (name IN ('alumno','profesor','superadmin'))
) ENGINE=InnoDB;

-- USERS (1 rol por usuario)
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  status        ENUM('active','disabled') NOT NULL DEFAULT 'active',
  role_id       TINYINT UNSIGNED NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_users PRIMARY KEY (id),
  CONSTRAINT uk_users_email UNIQUE (email),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB;

-- COURSES
CREATE TABLE IF NOT EXISTS courses (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code       VARCHAR(50)  NOT NULL,
  name       VARCHAR(255) NOT NULL,
  term       VARCHAR(50)  NOT NULL,
  owner_id   BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_courses PRIMARY KEY (id),
  CONSTRAINT uk_courses_code_term UNIQUE (code, term),
  CONSTRAINT fk_courses_owner FOREIGN KEY (owner_id) REFERENCES users(id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ENROLLMENTS (N-N users ↔ courses)
CREATE TABLE IF NOT EXISTS enrollments (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  course_id   BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  course_role ENUM('alumno','profesor') NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_enrollments PRIMARY KEY (id),
  CONSTRAINT uk_enrollment UNIQUE (course_id, user_id),
  CONSTRAINT fk_enroll_course FOREIGN KEY (course_id) REFERENCES courses(id)
    ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT fk_enroll_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- TRIGGERS (Prevent superadmin from enrolling in courses)
-- ==============================================================================

DROP TRIGGER IF EXISTS bi_enrollments_block_superadmin;
DELIMITER $$
CREATE TRIGGER bi_enrollments_block_superadmin
BEFORE INSERT ON enrollments
FOR EACH ROW
BEGIN
  IF (SELECT r.name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = NEW.user_id) = 'superadmin' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Superadmin no puede inscribirse en cursos.';
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS bu_enrollments_block_superadmin;
DELIMITER $$
CREATE TRIGGER bu_enrollments_block_superadmin
BEFORE UPDATE ON enrollments
FOR EACH ROW
BEGIN
  IF (SELECT r.name FROM users u JOIN roles r ON r.id = NEW.user_id) = 'superadmin' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Superadmin no puede inscribirse en cursos.';
  END IF;
END$$
DELIMITER ;

-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- Roles
INSERT IGNORE INTO roles (id, name) VALUES
  (1, 'superadmin'),
  (2, 'profesor'),
  (3, 'alumno');

-- Users (passwords are just placeholders, use /auth/register to create real users)
INSERT INTO users (email, password_hash, full_name, role_id) VALUES
  ('admin@pucp.edu.pe', 'hash1', 'Super Admin PUCP', 1),
  ('juan.prof@pucp.edu.pe', 'hash2', 'Juan Pérez', 2),
  ('maria.prof@pucp.edu.pe', 'hash3', 'María López', 2),
  ('carlos.alum@pucp.edu.pe', 'hash4', 'Carlos Gómez', 3),
  ('ana.alum@pucp.edu.pe', 'hash5', 'Ana Torres', 3);

-- Courses
INSERT INTO courses (code, name, term, owner_id) VALUES
  ('TEL141', 'Redes de Telecomunicaciones', '2025-2', 2),
  ('INF101', 'Programación I', '2025-2', 3);

-- Enrollments
INSERT INTO enrollments (course_id, user_id, course_role) VALUES
  (1, 4, 'alumno'),
  (1, 5, 'alumno'),
  (2, 4, 'alumno'),
  (2, 5, 'alumno'),
  (1, 2, 'profesor'),
  (2, 3, 'profesor');

-- ==============================================================================
-- VERIFICATION QUERIES
-- ==============================================================================

-- Check roles
SELECT * FROM roles;

-- Check users
SELECT u.id, u.email, u.full_name, r.name as role, u.status
FROM users u
JOIN roles r ON u.role_id = r.id;

-- Check courses
SELECT c.*, u.full_name as owner
FROM courses c
JOIN users u ON c.owner_id = u.id;

-- Check enrollments
SELECT e.id, c.name as course, u.full_name as user, e.course_role
FROM enrollments e
JOIN courses c ON e.course_id = c.id
JOIN users u ON e.user_id = u.id;

-- ==============================================================================
-- NOTES
-- ==============================================================================
-- 1. User passwords are hashed with bcrypt in the application
-- 2. The seed users have placeholder hashes - use /auth/register to create real users
-- 3. Superadmins cannot enroll in courses (enforced by triggers)
-- 4. User IDs are BIGINT UNSIGNED and will be exposed as strings in the API
