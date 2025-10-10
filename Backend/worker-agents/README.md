# TeleCluster Worker Agent

Agente worker para orquestador cloud IaaS orientado a laboratorios, investigación y uso académico. 

## 🏗️ Arquitectura

Este worker expone una API REST robusta para operaciones de red y virtualización en servidores Linux. Está diseñado para funcionar como parte de un cluster distribuido donde cada servidor físico ejecuta un agente worker.

### Arquitectura de Red

```
┌─────────────────────────────────────────────────────────┐
│                    Internet/WAN                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ ens3 (WAN)
┌─────────────────▼───────────────────────────────────────┐
│                br-ex (Bridge Externo)                   │
│         ┌─────────┬─────────┬─────────┐                │
│         │  VM1    │  VM2    │  VM3    │                │
│         └─────────┴─────────┴─────────┘                │
└─────────────────────────────────────────────────────────┘
                  │
                  │ veth/overlay
┌─────────────────▼───────────────────────────────────────┐
│                br-int (Bridge Interno)                  │
│         ┌─────────┬─────────┬─────────┐                │
│         │  VM4    │  VM5    │  VM6    │                │
│         └─────────┴─────────┴─────────┘                │
└─────────┬───────────────────────────────┬───────────────┘
          │                               │
          │ ens4 (Red Interna)           │ VXLAN
          │                               │
┌─────────▼─────────────────────────────────▼─────────────┐
│              Otros Servidores del Cluster              │
└─────────────────────────────────────────────────────────┘
```

### Componentes

- **br-ex**: Bridge externo conectado a Internet vía ens3
- **br-int**: Bridge interno para comunicación entre VMs y overlays
- **ens3**: Interfaz WAN para conectividad a Internet
- **ens4**: Interfaz de red interna para comunicación entre servidores

## 🚀 Instalación y Configuración

### Prerrequisitos

```bash
# Herramientas de red requeridas
sudo apt update
sudo apt install -y \
    iproute2 \
    bridge-utils \
    iptables \
    iputils-ping \
    net-tools

# Herramientas opcionales (recomendadas)
sudo apt install -y \
    openvswitch-switch \
    traceroute
```

### Instalación con Docker

```bash
# Construir imagen
docker build -t telecluster-worker .

# Ejecutar (requiere privilegios de red)
docker run -d \
    --name telecluster-worker \
    --network host \
    --privileged \
    --restart unless-stopped \
    -p 8000:8000 \
    telecluster-worker
```

### Instalación Manual

```bash
# Instalar dependencias Python
pip install -r requirements.txt

# Ejecutar servidor
python main.py
```

## 📡 API Reference

La API está disponible en `http://localhost:8000` con documentación interactiva en `/docs`.

### Endpoints Principales

#### 🌉 Bridge Management
- `POST /bridge/create` - Crear bridge
- `POST /bridge/delete` - Eliminar bridge  
- `POST /bridge/add-port` - Añadir puerto a bridge
- `GET /bridge/list` - Listar bridges

#### 🔗 Veth Pairs
- `POST /veth/create` - Crear par veth
- `POST /veth/delete` - Eliminar par veth
- `POST /veth/move-to-bridge` - Mover veth a bridge
- `GET /veth/list` - Listar pares veth

#### 🏷️ VLAN Management
- `POST /vlan/create` - Crear VLAN
- `POST /vlan/add-to-bridge` - Añadir VLAN a bridge
- `GET /vlan/list` - Listar VLANs

#### 🚇 TUN/TAP Interfaces
- `POST /tuntap/create` - Crear interfaz TUN/TAP
- `POST /tuntap/attach` - Conectar TAP a bridge
- `GET /tuntap/list` - Listar interfaces TUN/TAP

#### 🔀 NAT/Port Forwarding
- `POST /nat/forward` - Crear port forwarding
- `POST /nat/masquerade` - Configurar masquerade
- `GET /nat/status` - Ver reglas NAT/firewall

#### 🌐 Network Operations
- `GET /network/interfaces` - Listar interfaces
- `GET /network/topology` - Ver topología completa
- `POST /network/ping` - Ping a host
- `GET /network/status` - Estado del sistema

### Ejemplos de Uso

#### Crear Bridge y Conectar Veth

```bash
# 1. Crear bridge interno
curl -X POST "http://localhost:8000/bridge/create" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "br-vm",
       "type": "linux",
       "stp": false
     }'

# 2. Crear par veth
curl -X POST "http://localhost:8000/veth/create" \
     -H "Content-Type: application/json" \
     -d '{
       "name1": "veth-vm1",
       "name2": "veth-vm2", 
       "bridge1": "br-vm",
       "bridge2": "br-vm"
     }'
```

#### Configurar Port Forwarding

```bash
# Port forward SSH (2222 -> VM:22)
curl -X POST "http://localhost:8000/nat/forward" \
     -H "Content-Type: application/json" \
     -d '{
       "external_port": 2222,
       "internal_ip": "192.168.100.10",
       "internal_port": 22,
       "protocol": "tcp",
       "description": "SSH access to VM1"
     }'
```

#### Crear Topología de Red

```bash
# 1. Crear bridge de laboratorio
curl -X POST "http://localhost:8000/bridge/create" \
     -d '{"name": "br-lab", "type": "ovs"}'

# 2. Crear interfaces TAP para VMs
curl -X POST "http://localhost:8000/tuntap/create" \
     -d '{
       "name": "tap-vm1",
       "type": "tap",
       "bridge": "br-lab"
     }'

# 3. Configurar VLAN
curl -X POST "http://localhost:8000/vlan/add-to-bridge" \
     -d '{
       "bridge_name": "br-lab",
       "port_name": "tap-vm1", 
       "vlan_id": 100,
       "tagged": false
     }'
```

## 🔧 Configuración

### Variables de Entorno

```bash
# Nivel de logging
export LOG_LEVEL=INFO

# Puerto del servidor
export PORT=8000

# Interfaz de escucha
export HOST=0.0.0.0
```

### Configuración de Red

El worker detecta automáticamente las interfaces de red disponibles, pero puede configurarse para usar interfaces específicas:

```python
# En el código, modificar las constantes:
WAN_INTERFACE = "ens3"      # Interfaz hacia Internet
LAN_INTERFACE = "ens4"      # Interfaz red interna  
EXTERNAL_BRIDGE = "br-ex"   # Bridge externo
INTERNAL_BRIDGE = "br-int"  # Bridge interno
```

## 🔒 Seguridad

### Permisos Requeridos

El worker requiere permisos administrativos para:
- Modificar interfaces de red (`CAP_NET_ADMIN`)
- Modificar reglas iptables (`CAP_NET_RAW`)
- Crear namespaces de red (`CAP_SYS_ADMIN`)

### Ejecución Segura

```bash
# Opción 1: Como root (funcionalidad completa)
sudo python main.py

# Opción 2: Con capabilities específicas
sudo setcap cap_net_admin,cap_net_raw+ep $(which python)
python main.py

# Opción 3: Docker privilegiado
docker run --privileged telecluster-worker
```

### Firewall

```bash
# Permitir acceso a la API
sudo ufw allow 8000/tcp

# Permitir comunicación entre workers
sudo ufw allow from 10.0.0.0/8
sudo ufw allow from 192.168.0.0/16
```

## 📊 Monitoreo

### Health Checks

```bash
# Health check básico
curl http://localhost:8000/health

# Estado detallado del sistema  
curl http://localhost:8000/network/status

# Lista de interfaces
curl http://localhost:8000/network/interfaces
```

### Logs

Los logs se muestran en consola con colores para fácil lectura:

```
2024-01-01 12:00:00 - worker_agent - INFO - 🚀 Iniciando TeleCluster Worker Agent...
2024-01-01 12:00:00 - worker_agent - INFO - ✅ Todos los comandos requeridos están disponibles
2024-01-01 12:00:00 - worker_agent - INFO - 🎯 Worker Agent iniciado correctamente
```

## 🧪 Testing

### Tests Manuales

```bash
# Test de conectividad
curl -X POST "http://localhost:8000/network/ping" \
     -H "Content-Type: application/json" \
     -d '{"target": "8.8.8.8", "count": 3}'

# Test de interfaces
curl "http://localhost:8000/network/interfaces"

# Test de bridges  
curl "http://localhost:8000/bridge/list"
```

### Validación de Entorno

```bash
# Ejecutar validaciones internas
curl "http://localhost:8000/health"
```

## 🤝 Desarrollo

### Estructura del Código

```
Backend/worker-agents/
├── main.py                 # Aplicación principal FastAPI
├── requirements.txt        # Dependencias Python
├── Dockerfile             # Imagen Docker
├── api/                   # Routers FastAPI
│   ├── bridge.py          # Endpoints para bridges
│   ├── veth.py            # Endpoints para veth pairs
│   ├── vlan.py            # Endpoints para VLANs
│   ├── tuntap.py          # Endpoints para TUN/TAP
│   ├── nat.py             # Endpoints para NAT/firewall
│   └── network.py         # Endpoints para red general
├── services/              # Lógica de negocio
│   ├── bridge.py          # Servicio de bridges
│   ├── veth.py            # Servicio de veth pairs
│   ├── vlan.py            # Servicio de VLANs
│   ├── tuntap.py          # Servicio de TUN/TAP
│   ├── nat.py             # Servicio de NAT/firewall
│   └── network.py         # Servicio de red general
├── models/                # Modelos Pydantic
│   ├── bridge.py          # Modelos para bridges
│   ├── veth.py            # Modelos para veth pairs
│   ├── vlan.py            # Modelos para VLANs
│   ├── tuntap.py          # Modelos para TUN/TAP
│   ├── nat.py             # Modelos para NAT/firewall
│   └── network.py         # Modelos para red general
└── utils/                 # Utilidades
    ├── logging.py         # Configuración de logging
    └── middleware.py      # Middlewares FastAPI
```

### Extending the API

Para añadir nuevas funcionalidades:

1. Crear modelo en `models/`
2. Implementar servicio en `services/`
3. Crear router en `api/`
4. Registrar router en `main.py`

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles.

## 🆘 Soporte

Para reportar problemas o solicitar funcionalidades:
- Issues: GitHub Issues
- Email: admin@telecluster.local
- Docs: http://localhost:8000/docs
