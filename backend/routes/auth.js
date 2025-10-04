import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Endpoint de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se envíen email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario en la base de datos
    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

     // Verificar contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Preparar respuesta del usuario (sin password)
    const userResponse = {
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      codigo: user.codigo,
      email: user.email,
      role: user.role,
      cursos: user.cursos.map(curso => ({
        curso_id: curso.curso_id,
        codigo_curso: curso.codigo_curso,
        nombre_curso: curso.nombre_curso,
        ciclo: curso.ciclo,
        horario: curso.horario,
        rol_en_curso: curso.rol_en_curso
      }))
    };

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      token,               // <--- ahora el token se devuelve
      user: userResponse
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

    // Endpoint protegido para verificar token
    router.get("/me", authenticateToken, async (req, res) => {
    try {
        res.json({
        success: true,
        message: "Token válido",
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role
        }
        });
    } catch (error) {
        console.error('Error en /me:', error);
        res.status(500).json({ 
          success: false, 
          message: "Error interno del servidor" 
        });
    }
    });

export default router;