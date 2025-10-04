import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'auth_demo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

// Función para obtener usuario por email con todos sus cursos
export const getUserByEmail = async (email) => {
  try {
    // Obtener datos básicos del usuario
    const [userRows] = await pool.execute(`
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.codigo,
        u.email,
        u.password_hash,
        u.role
      FROM users u 
      WHERE u.email = ?
    `, [email]);
    
    if (userRows.length === 0) {
      return null;
    }
    
    const user = userRows[0];
    
    // Obtener todos los cursos del usuario desde la tabla intermedia
    const [cursosRows] = await pool.execute(`
      SELECT 
        c.id as curso_id,
        c.codigo_curso,
        c.nombre_curso,
        c.ciclo,
        uc.horario,
        uc.rol_en_curso,
        uc.activo
      FROM user_curso uc
      JOIN cursos c ON uc.curso_id = c.id
      WHERE uc.user_id = ? AND uc.activo = TRUE
      ORDER BY c.codigo_curso
    `, [user.id]);
    
    // Agregar cursos al objeto usuario
    user.cursos = cursosRows;
    
    return user;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

// Función para obtener usuarios por curso
export const getUsersByCurso = async (cursoId) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.codigo,
        u.email,
        u.role,
        uc.horario,
        uc.rol_en_curso,
        c.codigo_curso,
        c.nombre_curso
      FROM users u
      JOIN user_curso uc ON u.id = uc.user_id
      JOIN cursos c ON uc.curso_id = c.id
      WHERE uc.curso_id = ? AND uc.activo = TRUE
      ORDER BY uc.rol_en_curso, u.apellidos, u.nombres
    `, [cursoId]);
    
    return rows;
  } catch (error) {
    console.error('Error al obtener usuarios por curso:', error);
    throw error;
  }
};

// Función para obtener todos los cursos
export const getAllCursos = async () => {
  try {
    const [rows] = await pool.execute('SELECT * FROM cursos ORDER BY codigo_curso');
    return rows;
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    throw error;
  }
};

// Función para obtener estadísticas de un curso
export const getCursoStats = async (cursoId) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        c.codigo_curso,
        c.nombre_curso,
        c.ciclo,
        COUNT(CASE WHEN uc.rol_en_curso = 'alumno' THEN 1 END) as total_alumnos,
        COUNT(CASE WHEN uc.rol_en_curso = 'jefe_practica' THEN 1 END) as total_jefes
      FROM cursos c
      LEFT JOIN user_curso uc ON c.id = uc.curso_id AND uc.activo = TRUE
      WHERE c.id = ?
      GROUP BY c.id, c.codigo_curso, c.nombre_curso, c.ciclo
    `, [cursoId]);
    
    return stats.length > 0 ? stats[0] : null;
  } catch (error) {
    console.error('Error al obtener estadísticas del curso:', error);
    throw error;
  }
};

export default pool;