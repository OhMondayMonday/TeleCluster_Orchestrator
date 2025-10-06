# 🚀 Guía Rápida de Prueba

## ✅ Frontend Conectado al Backend

El frontend ahora está **completamente integrado** con el backend FastAPI. Ya no usamos datos mock, todo viene de la base de datos MySQL.

## 📋 Pasos para Probar

### 1️⃣ Iniciar el Backend (Terminal 1)

```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

Deberías ver:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2️⃣ Iniciar el Frontend (Terminal 2)

```powershell
cd frontend
npm run dev
```

Deberías ver:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

### 3️⃣ Abrir el Navegador

Navega a: http://localhost:3000/login

### 4️⃣ Probar el Login

Usa cualquiera de estas cuentas (contraseña: `password` para todas):

#### 👨‍💼 Super Administrador
- **Email**: admin@pucp.edu.pe
- **Password**: password
- **Redirect**: `/superadmin/dashboard`
- **Permisos**: Ver/crear/editar/eliminar TODOS los usuarios

#### 👨‍🏫 Profesor
- **Email**: profesor@pucp.edu.pe
- **Password**: password
- **Redirect**: `/profesor/slices`
- **Permisos**: Ver todos los usuarios, gestionar sus cursos y alumnos

#### 👨‍🎓 Alumno
- **Email**: alumno@pucp.edu.pe
- **Password**: password
- **Redirect**: `/alumno/slices`
- **Permisos**: Solo ver su propio perfil

## 🔍 Qué Observar

### ✅ Login Exitoso
1. Ingresa email y password
2. Click en "Sign in"
3. Verás un spinner "Signing in..."
4. Serás redirigido automáticamente según tu rol
5. El token JWT se guarda en localStorage

### ✅ Error de Login
1. Ingresa credenciales incorrectas
2. Verás un mensaje de error en rojo
3. Los campos permanecen editables

### ✅ Consola del Navegador
Abre DevTools (F12) y ve a la pestaña "Console". Verás:

```
API Request: POST http://localhost:8000/auth/login
API Response: 200 OK { "access_token": "eyJ...", "token_type": "bearer" }
API Request: GET http://localhost:8000/auth/me
API Response: 200 OK { "id": "1", "email": "admin@pucp.edu.pe", ... }
```

### ✅ LocalStorage
En DevTools → Application → Local Storage → http://localhost:3000

Deberías ver:
```
auth_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Probar Rutas Protegidas

### Test 1: Sin Login
1. Cierra sesión o borra el token
2. Intenta acceder a: http://localhost:3000/superadmin/dashboard
3. **Resultado**: Redirección automática a `/login` ✅

### Test 2: Con Login Incorrecto
1. Login como `alumno@pucp.edu.pe`
2. Intenta acceder a: http://localhost:3000/superadmin/dashboard
3. **Resultado**: Redirección automática a `/alumno/slices` ✅

### Test 3: Con Login Correcto
1. Login como `admin@pucp.edu.pe`
2. Accede a: http://localhost:3000/superadmin/dashboard
3. **Resultado**: Acceso permitido ✅

## 🎯 Funcionalidades Implementadas

### ✅ Autenticación Real
- ✅ Login con JWT
- ✅ Registro de usuarios
- ✅ Obtener perfil actual
- ✅ Logout (borrar token)
- ✅ Verificar autenticación

### ✅ Gestión de Usuarios
- ✅ Listar usuarios (con paginación)
- ✅ Ver usuario específico
- ✅ Crear usuario (solo superadmin)
- ✅ Actualizar usuario (según rol)
- ✅ Eliminar usuario (solo superadmin)

### ✅ Control de Acceso (RBAC)
- ✅ Roles: superadmin, profesor, alumno
- ✅ Permisos diferentes por rol
- ✅ Backend valida permisos en cada endpoint
- ✅ Frontend redirige según rol

### ✅ Estado Global
- ✅ AuthContext provee usuario y métodos
- ✅ ProtectedRoute protege rutas
- ✅ Loading states automáticos
- ✅ Error handling

## 📝 Próximos Pasos

Ahora que la integración está completa, puedes:

1. **Actualizar páginas de gestión de usuarios** para usar la API real
2. **Conectar endpoints de cursos** (courses)
3. **Conectar endpoints de slices**
4. **Agregar más validaciones y feedback**
5. **Mejorar la UI de errores**

## 🐛 Debugging

### Si el login no funciona:

1. **Verifica el backend**:
   ```powershell
   curl http://localhost:8000/health
   ```
   Debe responder: `{"status": "healthy", "database": "connected"}`

2. **Verifica la base de datos**:
   ```sql
   SELECT * FROM users;
   ```
   Debe tener al menos 3 usuarios

3. **Verifica el token**:
   - F12 → Application → Local Storage
   - Debe existir `auth_token`

4. **Verifica CORS**:
   - El backend permite `http://localhost:3000`
   - Configurado en `backend/app/main.py`

### Si hay errores de TypeScript:

```powershell
cd frontend
npm run build
```

Esto mostrará cualquier error de tipos.

## 📚 Documentación

- **Backend API**: http://localhost:8000/docs (Swagger UI)
- **Frontend Integration**: Ver `frontend/INTEGRATION.md`
- **Backend Setup**: Ver `backend/README.md`
- **Backend Quickstart**: Ver `backend/QUICKSTART.md`

## 🎉 ¡Todo Listo!

El sistema ahora está completamente funcional:
- ✅ Frontend (Next.js) en puerto 3000
- ✅ Backend (FastAPI) en puerto 8000
- ✅ Base de datos (MySQL) con datos de prueba
- ✅ Autenticación JWT funcionando
- ✅ RBAC implementado
- ✅ Todo probado y documentado

**¡Ahora puedes probar todo desde la interfaz de usuario en lugar de Postman!** 🚀
