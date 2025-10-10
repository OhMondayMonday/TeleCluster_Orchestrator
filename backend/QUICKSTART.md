# 🚀 Quick Start Guide

## Pasos rápidos para ejecutar la API

### 1. Instalar dependencias
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar MySQL
```bash
# Ejecutar en MySQL:
mysql -u root -p < database_setup.sql
```

O manualmente:
```sql
CREATE DATABASE orchestrator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Y ejecutar el resto del script database_setup.sql
```

### 3. Verificar configuración
El archivo `.env` ya está configurado:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=root
DB_NAME=orchestrator
JWT_SECRET=super-secreto
JWT_MINUTES=120
```

### 4. Ejecutar la API
```bash
python -m app.main
```

O con uvicorn:
```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Probar la API

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Documentación:**
```
http://localhost:8000/docs
```

## 📝 Flujo de prueba rápido

### 1. Registrar usuario
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

### 2. Login y guardar token
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@pucp.edu.pe",
    "password": "password123"
  }'
```

**Copiar el `access_token` de la respuesta y usarlo como:**
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Ver perfil
```bash
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Listar usuarios
```bash
curl "http://localhost:8000/users?page=1&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

## 🎯 URLs importantes

- **API**: http://localhost:8000
- **Docs (Swagger)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health**: http://localhost:8000/health

## 📦 Estructura de carpetas

```
backend/
├── app/
│   ├── main.py          # FastAPI app
│   ├── db.py            # MySQL connection
│   ├── auth/            # Authentication
│   │   ├── deps.py      # JWT, password hashing
│   │   └── routes.py    # /auth endpoints
│   ├── users/           # Users management
│   │   ├── repo.py      # Database layer
│   │   ├── service.py   # Business logic
│   │   └── routes.py    # /users endpoints
│   └── shared/          # Shared utilities
│       ├── errors.py    # Custom exceptions
│       └── schemas.py   # Pydantic models
├── .env                 # Environment variables
├── requirements.txt     # Dependencies
└── database_setup.sql   # Database script
```

## 🔐 Roles y permisos

| Endpoint | superadmin | profesor | alumno |
|----------|------------|----------|--------|
| GET /users | ✅ Todos | ✅ Sus cursos | ✅ Solo sí mismo |
| GET /users/{id} | ✅ Cualquiera | ✅ En sus cursos | ✅ Solo sí mismo |
| POST /users | ✅ Sí | ❌ No | ❌ No |
| PUT /users/{id} | ✅ Cualquiera | ✅ Solo sí mismo | ✅ Solo sí mismo* |
| DELETE /users/{id} | ✅ Sí | ❌ No | ❌ No |

*alumno no puede cambiar su `role_id`

## 🐛 Troubleshooting

### Error de conexión MySQL
```bash
# Verificar que MySQL esté corriendo
mysql -u root -p

# Verificar la base de datos
USE orchestrator;
SHOW TABLES;
```

### Error de dependencias
```bash
# Reinstalar dependencias
pip install --force-reinstall -r requirements.txt
```

### Puerto 8000 ocupado
```bash
# Cambiar el puerto
uvicorn app.main:app --reload --port 8001
```

## 📚 Documentación completa

Ver `README.md` para documentación completa con todos los endpoints y ejemplos.
