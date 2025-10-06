# TeleCluster Orchestrator API - Gestión de Usuarios

API REST completa con FastAPI para gestión de usuarios con autenticación JWT y autorización basada en roles (RBAC).

## 🚀 Características

- **Autenticación JWT** (HS256) con tokens de 120 minutos
- **Autorización por roles** (RBAC): superadmin, profesor, alumno
- **Gestión completa de usuarios** (CRUD) con permisos diferenciados
- **Paginación** en listados (por defecto 20, máximo 100)
- **Validaciones** con Pydantic
- **Manejo de errores** HTTP estándar (400/401/403/404/409/500)
- **MySQL** con conexiones nativas (sin ORM)
- **Documentación automática** con Swagger UI

## 📋 Requisitos

- Python 3.12
- MySQL 8.0+
- pip

## 🔧 Instalación

### 1. Clonar y navegar al proyecto

```bash
cd backend
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar base de datos MySQL

Ejecutar el siguiente script SQL para crear la base de datos y los datos iniciales:

```sql
CREATE DATABASE IF NOT EXISTS orchestrator
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE orchestrator;

-- ROLES (3 exactos)
CREATE TABLE IF NOT EXISTS roles (
  id   TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(32) NOT NULL,
  CONSTRAINT pk_roles PRIMARY KEY (id),
  CONSTRAINT uk_roles_name UNIQUE (name),
  CONSTRAINT ck_roles_name CHECK (name IN ('alumno','profesor','superadmin'))
) ENGINE=InnoDB;

-- USERS
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

-- ENROLLMENTS
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

-- Triggers para prevenir superadmin en enrollments
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

-- Datos iniciales
INSERT IGNORE INTO roles (id, name) VALUES
  (1,'superadmin'), (2,'profesor'), (3,'alumno');

INSERT INTO users (email, password_hash, full_name, role_id)
VALUES
  ('admin@pucp.edu.pe',  'hash1', 'Super Admin PUCP', 1),
  ('juan.prof@pucp.edu.pe', 'hash2', 'Juan Pérez', 2),
  ('maria.prof@pucp.edu.pe','hash3','María López', 2),
  ('carlos.alum@pucp.edu.pe','hash4','Carlos Gómez', 3),
  ('ana.alum@pucp.edu.pe','hash5','Ana Torres', 3);

INSERT INTO courses (code, name, term, owner_id)
VALUES
  ('TEL141','Redes de Telecomunicaciones','2025-2', 2),
  ('INF101','Programación I','2025-2', 3);

INSERT INTO enrollments (course_id, user_id, course_role)
VALUES
  (1,4,'alumno'),
  (1,5,'alumno'),
  (2,4,'alumno'),
  (2,5,'alumno'),
  (1,2,'profesor'),
  (2,3,'profesor');
```

### 4. Configurar variables de entorno

El archivo `.env` ya está configurado con valores por defecto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=root
DB_NAME=orchestrator
JWT_SECRET=super-secreto
JWT_MINUTES=120
```

## 🏃 Ejecutar la API

### Opción 1: Comando directo
```bash
python -m app.main
```

### Opción 2: Con uvicorn
```bash
uvicorn app.main:app --reload --port 8000
```

La API estará disponible en:
- **API**: http://localhost:8000
- **Documentación**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📚 Endpoints

### Autenticación

#### POST /auth/register
Registrar un nuevo usuario.

**Body:**
```json
{
  "email": "nuevo@pucp.edu.pe",
  "password": "password123",
  "full_name": "Usuario Nuevo",
  "role": "alumno"
}
```

**Roles válidos:** `alumno`, `profesor`, `superadmin`

**Respuesta (201):**
```json
{
  "ok": true,
  "data": {
    "id": "6",
    "email": "nuevo@pucp.edu.pe",
    "full_name": "Usuario Nuevo",
    "role": "alumno",
    "role_id": 3,
    "status": "active",
    "created_at": "2025-10-05T12:00:00",
    "updated_at": "2025-10-05T12:00:00"
  }
}
```

#### POST /auth/login
Iniciar sesión y obtener token JWT.

**Body:**
```json
{
  "email": "admin@pucp.edu.pe",
  "password": "admin123"
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
}
```

#### GET /auth/me
Obtener información del usuario actual.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "id": "1",
    "email": "admin@pucp.edu.pe",
    "full_name": "Super Admin PUCP",
    "role": "superadmin",
    "role_id": 1,
    "status": "active",
    "created_at": "2025-10-05T12:00:00",
    "updated_at": "2025-10-05T12:00:00"
  }
}
```

### Gestión de Usuarios

#### GET /users
Listar usuarios con paginación (RBAC aplicado).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Número de página (default: 1)
- `size`: Tamaño de página (default: 20, max: 100)

**RBAC:**
- `superadmin`: Ve todos los usuarios
- `profesor`: Ve usuarios en sus cursos
- `alumno`: Solo ve su propio perfil

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "users": [
      {
        "id": "1",
        "email": "admin@pucp.edu.pe",
        "full_name": "Super Admin PUCP",
        "role": "superadmin",
        "role_id": 1,
        "status": "active",
        "created_at": "2025-10-05T12:00:00",
        "updated_at": "2025-10-05T12:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### GET /users/{id}
Obtener un usuario específico por ID (RBAC aplicado).

**Headers:**
```
Authorization: Bearer <token>
```

**RBAC:**
- `superadmin`: Puede ver cualquier usuario
- `profesor`: Puede ver usuarios en sus cursos o a sí mismo
- `alumno`: Solo puede verse a sí mismo

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "id": "2",
    "email": "juan.prof@pucp.edu.pe",
    "full_name": "Juan Pérez",
    "role": "profesor",
    "role_id": 2,
    "status": "active",
    "created_at": "2025-10-05T12:00:00",
    "updated_at": "2025-10-05T12:00:00"
  }
}
```

#### POST /users
Crear un nuevo usuario (solo superadmin).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "email": "test@pucp.edu.pe",
  "password": "password123",
  "full_name": "Usuario Test",
  "role_id": 3,
  "status": "active"
}
```

**role_id:** `1` (superadmin), `2` (profesor), `3` (alumno)

**Respuesta (201):**
```json
{
  "ok": true,
  "data": {
    "id": "7",
    "email": "test@pucp.edu.pe",
    "full_name": "Usuario Test",
    "role": "alumno",
    "role_id": 3,
    "status": "active",
    "created_at": "2025-10-05T12:00:00",
    "updated_at": "2025-10-05T12:00:00"
  }
}
```

#### PUT /users/{id}
Actualizar un usuario (RBAC aplicado).

**Headers:**
```
Authorization: Bearer <token>
```

**Body (parcial):**
```json
{
  "full_name": "Nombre Actualizado",
  "status": "active"
}
```

**RBAC:**
- `superadmin`: Puede actualizar a cualquiera
- `profesor`: Solo puede actualizarse a sí mismo
- `alumno`: Solo puede actualizarse a sí mismo (no puede cambiar `role_id`)

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "id": "7",
    "email": "test@pucp.edu.pe",
    "full_name": "Nombre Actualizado",
    "role": "alumno",
    "role_id": 3,
    "status": "active",
    "created_at": "2025-10-05T12:00:00",
    "updated_at": "2025-10-05T12:30:00"
  }
}
```

#### DELETE /users/{id}
Eliminar un usuario (solo superadmin).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "message": "Usuario eliminado correctamente"
  }
}
```

**Error (409) si tiene cursos o enrollments:**
```json
{
  "ok": false,
  "error": "No se puede eliminar el usuario porque tiene cursos o inscripciones asociadas"
}
```

## 🧪 Ejemplos de pruebas con curl

### 1. Registrar un nuevo usuario
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@pucp.edu.pe",
    "password": "password123",
    "full_name": "Usuario Test",
    "role": "alumno"
  }'
```

### 2. Iniciar sesión
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@pucp.edu.pe",
    "password": "password123"
  }'
```

**Guardar el token de la respuesta:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Ver perfil actual
```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Listar usuarios (con paginación)
```bash
curl -X GET "http://localhost:8000/users?page=1&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Ver un usuario específico
```bash
curl -X GET http://localhost:8000/users/2 \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Crear un usuario (como superadmin)
```bash
curl -X POST http://localhost:8000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@pucp.edu.pe",
    "password": "password123",
    "full_name": "Usuario Nuevo",
    "role_id": 3,
    "status": "active"
  }'
```

### 7. Actualizar un usuario
```bash
curl -X PUT http://localhost:8000/users/6 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nombre Actualizado"
  }'
```

### 8. Eliminar un usuario (como superadmin)
```bash
curl -X DELETE http://localhost:8000/users/6 \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Health check
```bash
curl -X GET http://localhost:8000/health
```

## 🔒 Respuestas de Error

### 401 Unauthorized
```json
{
  "ok": false,
  "error": "No autorizado"
}
```

### 403 Forbidden
```json
{
  "ok": false,
  "error": "No tienes permisos para esta acción"
}
```

### 404 Not Found
```json
{
  "ok": false,
  "error": "Usuario no encontrado"
}
```

### 409 Conflict
```json
{
  "ok": false,
  "error": "El email ya está registrado"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Formato de email inválido",
      "type": "value_error"
    }
  ]
}
```

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicación FastAPI principal
│   ├── db.py                # Conexión a MySQL
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── deps.py          # JWT y hash de passwords
│   │   └── routes.py        # /auth endpoints
│   ├── users/
│   │   ├── __init__.py
│   │   ├── repo.py          # Acceso a datos (repository)
│   │   ├── service.py       # Lógica de negocio
│   │   └── routes.py        # /users endpoints
│   └── shared/
│       ├── __init__.py
│       ├── errors.py        # Excepciones personalizadas
│       └── schemas.py       # Schemas Pydantic
├── .env                     # Variables de entorno
├── requirements.txt         # Dependencias
└── README.md               # Este archivo
```

## 🔐 Seguridad

- **Passwords**: Hasheados con bcrypt
- **JWT**: Tokens con expiración de 120 minutos
- **RBAC**: Autorización por roles en cada endpoint
- **Validaciones**: Pydantic valida todos los inputs
- **SQL Injection**: Prevención con prepared statements

## 🎯 Testing con Postman

1. **Importar colección**: Crear requests según los ejemplos de curl
2. **Variables de entorno**:
   - `baseUrl`: `http://localhost:8000`
   - `token`: Se obtiene del `/auth/login`
3. **Authorization**: Usar tipo "Bearer Token" con la variable `{{token}}`

## 📝 Notas

- Los IDs tipo BIGINT se exponen como **strings** en JSON para evitar pérdida de precisión
- El orden de usuarios es por `created_at DESC`
- La paginación tiene un máximo de 100 elementos por página
- Los superadmins NO pueden inscribirse en cursos (trigger de BD)

## 🚀 Despliegue

Para producción:
1. Cambiar `JWT_SECRET` a un valor seguro
2. Configurar CORS con origins específicos
3. Usar variables de entorno seguras
4. Habilitar HTTPS
5. Configurar rate limiting

## 📄 Licencia

Este proyecto es parte del TeleCluster Orchestrator de PUCP.
