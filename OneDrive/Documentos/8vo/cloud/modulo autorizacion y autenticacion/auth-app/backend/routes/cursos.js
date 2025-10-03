import express from 'express';
import { getAllCursos, getUsersByCurso, getCursoStats } from '../config/database.js';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Endpoint para obtener todos los cursos (requiere autenticación)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cursos = await getAllCursos();
    
    res.json({
      success: true,
      message: 'Cursos obtenidos exitosamente',
      data: cursos,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });

  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint para obtener usuarios de un curso específico (solo jefes de práctica y superadmin)
router.get('/:cursoId/usuarios', authenticateToken, requireRole(['jefe_practica', 'superadmin']), async (req, res) => {
  try {
    const { cursoId } = req.params;
    const usuarios = await getUsersByCurso(cursoId);
    
    // Agrupar usuarios por rol
    const agrupados = {
      alumnos: usuarios.filter(u => u.rol_en_curso === 'alumno'),
      jefes_practica: usuarios.filter(u => u.rol_en_curso === 'jefe_practica')
    };
    
    res.json({
      success: true,
      message: 'Usuarios del curso obtenidos exitosamente',
      data: {
        curso: usuarios.length > 0 ? {
          codigo_curso: usuarios[0].codigo_curso,
          nombre_curso: usuarios[0].nombre_curso
        } : null,
        usuarios: agrupados,
        total_alumnos: agrupados.alumnos.length,
        total_jefes: agrupados.jefes_practica.length
      },
      consulted_by: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios del curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint para obtener estadísticas de un curso (solo jefes de práctica y superadmin)
router.get('/:cursoId/stats', authenticateToken, requireRole(['jefe_practica', 'superadmin']), async (req, res) => {
  try {
    const { cursoId } = req.params;
    const stats = await getCursoStats(cursoId);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Estadísticas del curso obtenidas exitosamente',
      data: stats,
      consulted_by: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;