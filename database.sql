-- ===============================================
-- CREACIÓN DE BASE DE DATOS
-- ===============================================
DROP DATABASE IF EXISTS auth_demo;
CREATE DATABASE auth_demo;
USE auth_demo;

-- ===============================================
-- TABLA: Cursos
-- ===============================================
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_curso VARCHAR(20) UNIQUE NOT NULL,   -- Ejemplo: TEL141, TEL280
    nombre_curso VARCHAR(150) NOT NULL,
    ciclo VARCHAR(20) NOT NULL
);

-- ===============================================
-- TABLA: Usuarios
-- ===============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,         -- Código único del usuario (ej: matrícula o código PUCP)
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'changeme',
    role ENUM('superadmin', 'jefe_practica', 'alumno') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- TABLA INTERMEDIA: user_curso (Muchos a Muchos)
-- ===============================================
CREATE TABLE user_curso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    curso_id INT NOT NULL,
    horario VARCHAR(50), -- El horario específico para este usuario en este curso
    rol_en_curso ENUM('alumno', 'jefe_practica') NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_curso (user_id, curso_id)
);

-- ===============================================
-- INSERTAR CURSOS
-- ===============================================
INSERT INTO cursos (codigo_curso, nombre_curso, ciclo) VALUES
('TEL141', 'INGENIERÍA DE REDES CLOUD', '2025-2'),
('TEL280', 'INGENIERÍA INALÁMBRICA', '2025-2');

-- ===============================================
-- INSERTAR ALUMNOS (ROL: alumno, CURSO TEL141)
-- ===============================================
INSERT INTO users (nombres, apellidos, codigo, email, role) VALUES
('CARLOS ALEJANDRO', 'GOMEZ MOSTACERO', '20070429', '20070429@pucp.edu.pe', 'alumno'),
('SAMANTHA XIMENA', 'SÁNCHEZ AGUAYO', '20172234', '20172234@pucp.edu.pe', 'alumno'),
('PIERO ARMANDO', 'FERNANDEZ SAENZ', '20180524', '20180524@pucp.edu.pe', 'alumno'),
('CHRISTOPHER ORLANDO', 'TERRONES PEÑA', '20182048', '20182048@pucp.edu.pe', 'alumno'),
('CHRISTIAN LUIS', 'GONZALES FERNANDEZ', '20182758', '20182758@pucp.edu.pe', 'alumno'),
('ANDRES RODRIGO', 'LUJAN FERNANDEZ', '20191450', '20191450@pucp.edu.pe', 'alumno'),
('ALEXANDER DANIEL', 'ABRISQUETA ZEVALLOS', '20191641', '20191641@pucp.edu.pe', 'alumno'),
('ADRIAN ALVARO', 'LOPEZ PASCUAL', '20192733', '20192733@pucp.edu.pe', 'alumno'),
('OSCAR ANTONIO', 'AGREDA VARGAS', '20193315', '20193315@pucp.edu.pe', 'alumno'),
('JOSE LUIS', 'MORILLOS PINEDO', '20193733', '20193733@pucp.edu.pe', 'alumno'),
('YOSTHIM FRANCISCO', 'ENCISO APARCO', '20201497', '20201497@pucp.edu.pe', 'alumno'),
('LUIS CARLOS', 'ARAUJO VIGO', '20201862', '20201862@pucp.edu.pe', 'alumno'),
('SERGIO ADRIAN', 'ORDAYA PALOMINO', '20202137', '20202137@pucp.edu.pe', 'alumno'),
('PEDRO MIGUEL', 'BUSTAMANTE MELO', '20206156', '20206156@pucp.edu.pe', 'alumno'),
('KIARA ALEXANDRA', 'CCALA MALPICA', '20206303', '20206303@pucp.edu.pe', 'alumno'),
('ADRIAN HUMBERTO', 'TIPO LEON', '20206466', '20206466@pucp.edu.pe', 'alumno'),
('ROBERTO CARLOS', 'TAFUR HERRERA', '20210535', '20210535@pucp.edu.pe', 'alumno'),
('SANTIAGO FABRICIO', 'YONG LEMA', '20210751', '20210751@pucp.edu.pe', 'alumno'),
('FABRICIO ANDRE', 'ESTRADA CASTILLO', '20210795', '20210795@pucp.edu.pe', 'alumno'),
('DAVID ALONSO', 'ESCOBEDO CERRON', '20210850', '20210850@pucp.edu.pe', 'alumno'),
('JESUS ANTONIO', 'ALVARADO PERALTA', '20211688', '20211688@pucp.edu.pe', 'alumno'),
('MIGUEL ANGEL', 'ALVIZURI YUCRA', '20212472', '20212472@pucp.edu.pe', 'alumno'),
('EDUARDO DANIEL', 'GARAY CRUZ', '20212591', '20212591@pucp.edu.pe', 'alumno'),
('JEAN PIERE', 'IPURRE SACCATOMA', '20213733', '20213733@pucp.edu.pe', 'alumno'),
('NILO RIKEL', 'CORI RAMOS', '20213745', '20213745@pucp.edu.pe', 'alumno'),
('HUGO ALEJANDRO', 'HANCCO BASILIO', '20213801', '20213801@pucp.edu.pe', 'alumno'),
('JOSTIN ALEXIS', 'PINO DOLORES', '20213830', '20213830@pucp.edu.pe', 'alumno'),
('BRANDON RAFAEL', 'TACURI FLORES', '20215433', '20215433@pucp.edu.pe', 'alumno'),
('JOSE RICARDO', 'CALDERON RODRIGUEZ', '20216256', '20216256@pucp.edu.pe', 'alumno'),
('GONZALO MANUEL', 'ALVAREZ GARCIA', '20216352', '20216352@pucp.edu.pe', 'alumno');

-- ===============================================
-- INSERTAR JEFES DE PRÁCTICA (ROL: jefe_practica, CURSO TEL141)
-- ===============================================
INSERT INTO users (nombres, apellidos, codigo, email, role) VALUES
('CESAR AUGUSTO', 'SANTIVAÑEZ GUARNIZ', '00001318', 'csantivanez@pucp.edu.pe', 'jefe_practica'),
('JOSE ANTHONY', 'GARCIA MACAVILCA', '20176815', 'garcia.josea@pucp.edu.pe', 'jefe_practica'),
('FERNANDO WILLIAMS', 'GUZMAN CORAS', '20162001', 'fernando.guzman@pucp.edu.pe', 'jefe_practica'),
('RONNY EDUARDO', 'PASTOR KOLMAKOV', '20185534', 'ronny.pastor@pucp.edu.pe', 'jefe_practica'),
('DIANA LUZ SOFIA', 'SOLOGUREN RODRIGUEZ', '20185521', 'sologurenr.d@pucp.edu.pe', 'jefe_practica'),
('JHON BRANKO', 'ZAMBRANO LINARES', '20092356', 'jbzambrano@pucp.edu.pe', 'jefe_practica');

-- ===============================================
-- INSERTAR SUPERADMIN
-- ===============================================
INSERT INTO users (nombres, apellidos, codigo, email, password_hash, role) VALUES
('RUBEN FRANCISCO', 'CORDOVA ALVARADO', '20101519', 'ruben.cordova@pucp.edu.pe', 'hash_admin1', 'superadmin');

-- ===============================================
-- RELACIONES INICIALES (TEL141)
-- ===============================================
-- Alumnos TEL141
INSERT INTO user_curso (user_id, curso_id, horario, rol_en_curso)
SELECT u.id, 1, '991', 'alumno' FROM users u WHERE role = 'alumno';

-- Jefes de práctica TEL141
INSERT INTO user_curso (user_id, curso_id, rol_en_curso)
SELECT u.id, 1, 'jefe_practica' FROM users u WHERE role = 'jefe_practica';

-- Superadmin no necesita curso (gestiona todo)

-- ===============================================
-- EJEMPLOS DE RELACIONES MÚLTIPLES
-- ===============================================
-- Kiara también en TEL280
INSERT INTO user_curso (user_id, curso_id, horario, rol_en_curso)
SELECT u.id, 2, '992', 'alumno' FROM users u WHERE codigo = '20206303';

-- César Santivañez también en TEL280
INSERT INTO user_curso (user_id, curso_id, rol_en_curso)
SELECT u.id, 2, 'jefe_practica' FROM users u WHERE codigo = '00001318';

-- Desactivar safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Actualizar todos los usuarios con 'changeme'
UPDATE users
SET password_hash = '$2b$10$835yXVA6l/O479siE7RvE.9sG7kF7Gw1ou.KHaWi3O0MFYYXs1z6y'
WHERE password_hash = 'changeme';

-- Actualizar el superadmin que tenía 'hash_admin1'
UPDATE users
SET password_hash = '$2b$10$cdSiIboF/z17hfBrwTOOwOdOGlgoRNo/ShBm6TpnEye9.HC0ulwBu'
WHERE password_hash = 'hash_admin1';

-- Volver a activar safe update mode
SET SQL_SAFE_UPDATES = 1;