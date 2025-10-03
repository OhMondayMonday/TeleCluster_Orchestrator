import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import authRoutes from './routes/auth.js';
import cursosRoutes from './routes/cursos.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor de Autenticación PUCP - Relaciones Muchos-a-Muchos',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/auth/login - Login de usuario',
      'GET /api/cursos - Listar cursos',
      'GET /api/cursos/:id/usuarios - Usuarios de un curso',
      'GET /api/cursos/:id/stats - Estadísticas de un curso',
      'GET /api/health - Estado del servidor'
    ]
  });
});

// Ruta para probar la conexión a la BD
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    server: 'OK',
    database: dbStatus ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    version: '2.0.0-muchos-a-muchos'
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    availableEndpoints: [
      'POST /api/auth/login',
      'GET /api/cursos',
      'GET /api/cursos/:id/usuarios',
      'GET /api/cursos/:id/stats',
      'GET /api/health'
    ]
  });
});

// Manejo de errores globales
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('⚠️  Servidor iniciando sin conexión a la base de datos');
      console.warn('💡 Verifica la configuración en el archivo .env');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
      console.log(`📚 Cursos endpoint: http://localhost:${PORT}/api/cursos`);
      console.log('');
      console.log('🎯 Funcionalidades:');
      console.log('   ✅ Login con múltiples cursos por usuario');
      console.log('   ✅ Relaciones muchos-a-muchos (user_curso)');
      console.log('   ✅ APIs para consultar usuarios por curso');
      console.log('   ✅ Estadísticas de cursos');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();