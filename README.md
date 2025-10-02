# TeleCluster Orchestrator

Este repositorio contiene el sistema completo del TeleCluster Orchestrator para la gestión de infraestructura cloud educativa.

## Estructura del Proyecto

```
├── frontend/          # Aplicación web frontend (Next.js)
│   ├── app/          # Páginas y layouts de la aplicación
│   ├── components/   # Componentes reutilizables
│   ├── hooks/        # Custom hooks de React
│   ├── lib/          # Librerías y utilidades
│   └── public/       # Archivos estáticos
└── README.md         # Este archivo
```

## Frontend

El frontend está desarrollado con:
- **Next.js 14.2.16** - Framework de React
- **TypeScript** - Para tipado estático
- **Tailwind CSS** - Para estilos
- **Shadcn/ui** - Biblioteca de componentes

### Roles de Usuario

El sistema soporta tres tipos de usuarios:
- **Alumno** - Estudiantes que pueden ver y usar slices asignados
- **Profesor** - Profesores que pueden crear y gestionar slices y cursos
- **SuperAdmin** - Administradores con acceso completo al sistema

### Desarrollo Local

Para ejecutar el frontend localmente:

```bash
cd frontend
pnpm install
pnpm dev
```

El servidor de desarrollo estará disponible en http://localhost:3000

## Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request