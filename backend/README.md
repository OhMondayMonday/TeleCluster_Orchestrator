# TeleCluster Orchestrator - Backend API

API REST desarrollada en FastAPI para gestionar imágenes de sistemas operativos y recursos de máquinas virtuales.

## 🚀 Características

- **Upload de Imágenes**: Subir imágenes de SO (ISO, QCOW2, VMDK, VHD)
- **Gestión de Imágenes**: Listar, ver detalles, eliminar imágenes
- **Estadísticas**: Métricas de uso y almacenamiento
- **CORS habilitado**: Integración con el frontend Next.js

## 📋 Requisitos

- Python 3.8+
- pip

## 🔧 Instalación

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Crear entorno virtual (recomendado):
```bash
python -m venv venv
```

3. Activar el entorno virtual:
```bash
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
.\venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```

4. Instalar dependencias:
```bash
pip install -r requirements.txt
```

## 🏃 Ejecutar el servidor

```bash
cd src
python main.py
```

El servidor estará disponible en: **http://localhost:8000**

Documentación interactiva (Swagger): **http://localhost:8000/docs**

## 📡 Endpoints de la API

### Health Check
- `GET /` - Información básica de la API
- `GET /api/v1/health` - Estado detallado del servidor

### Imágenes
- `GET /api/v1/images` - Listar todas las imágenes
- `GET /api/v1/images/{id}` - Obtener detalles de una imagen
- `POST /api/v1/images/upload` - Subir nueva imagen
- `DELETE /api/v1/images/{id}` - Eliminar una imagen
- `GET /api/v1/images/{id}/download` - Registrar descarga

### Estadísticas
- `GET /api/v1/stats` - Estadísticas del sistema

## 📤 Ejemplo de Upload

### Usando cURL:
```bash
curl -X POST "http://localhost:8000/api/v1/images/upload" \
  -F "file=@ubuntu-22.04.iso" \
  -F "name=Ubuntu 22.04 LTS Server" \
  -F "os_type=Linux" \
  -F "version=22.04" \
  -F "architecture=x86_64" \
  -F "description=Ubuntu Server LTS"
```

### Usando Python:
```python
import requests

url = "http://localhost:8000/api/v1/images/upload"

files = {
    'file': open('ubuntu-22.04.iso', 'rb')
}

data = {
    'name': 'Ubuntu 22.04 LTS Server',
    'os_type': 'Linux',
    'version': '22.04',
    'architecture': 'x86_64',
    'description': 'Ubuntu Server LTS'
}

response = requests.post(url, files=files, data=data)
print(response.json())
```

## 📁 Estructura de Carpetas

```
backend/
├── src/
│   └── main.py           # Aplicación principal FastAPI
├── uploads/
│   └── images/           # Imágenes subidas (creado automáticamente)
├── .env                  # Variables de entorno
├── .gitignore
├── requirements.txt      # Dependencias Python
└── README.md            # Este archivo
```

## 🔐 Configuración (.env)

```env
ENV=development
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000
UPLOAD_DIR=./uploads/images
MAX_FILE_SIZE=21474836480
```

## 🗂️ Formatos de Imagen Soportados

- `.iso` - Imagen ISO
- `.qcow2` - QEMU Copy-On-Write v2
- `.vmdk` - VMware Virtual Disk
- `.vhd` - Virtual Hard Disk
- `.img` - Raw disk image

## 📊 Estructura de Respuesta

### Imagen exitosa:
```json
{
  "success": true,
  "image": {
    "id": "img-20250105_123456",
    "name": "Ubuntu 22.04 LTS Server",
    "os": "Linux",
    "version": "22.04",
    "architecture": "x86_64",
    "size": "2.4 GB",
    "status": "active",
    "downloads": 0,
    "created": "2025-01-05T12:34:56"
  }
}
```

## 🔮 Próximas Implementaciones

- [ ] Integración con NFS para almacenamiento compartido
- [ ] Conexión con headnode para deployment
- [ ] Autenticación JWT
- [ ] Base de datos PostgreSQL/MongoDB
- [ ] Validación de integridad de archivos (checksums)
- [ ] Sistema de cola para uploads grandes
- [ ] API para gestión de VMs y slices

## 👨‍💻 Desarrollador

**Miguel Angel Alvizuri**  
Email: a20212472@pucp.edu.pe  
GitHub: [@OhMondayMonday](https://github.com/OhMondayMonday)

## 📝 Licencia

MIT
