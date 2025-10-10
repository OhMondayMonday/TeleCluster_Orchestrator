#!/bin/bash

# TeleCluster Orchestrator - Quick Start Script
# Autor: TeleCluster Team
# Versión: 1.0.0

set -e

echo "🚀 TeleCluster Orchestrator - Inicio Rápido"
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar requisitos
check_requirements() {
    log_info "Verificando requisitos del sistema..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado. Instálalo desde: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose no está instalado. Instálalo desde: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # Verificar permisos de Docker
    if ! docker ps &> /dev/null; then
        log_error "No tienes permisos para ejecutar Docker. Ejecuta: sudo usermod -aG docker \$USER"
        log_error "Luego reinicia sesión o ejecuta: newgrp docker"
        exit 1
    fi
    
    # Verificar que estamos ejecutando como root para operaciones de red
    if [[ $EUID -ne 0 ]]; then
        log_warning "No se está ejecutando como root. Algunas operaciones de red pueden fallar."
        log_warning "Considera ejecutar: sudo $0"
    fi
    
    log_success "Todos los requisitos verificados ✓"
}

# Crear directorios necesarios
setup_directories() {
    log_info "Creando estructura de directorios..."
    
    sudo mkdir -p /opt/telecluster/{worker/{data,config},gateway/config,logs}
    sudo chmod -R 755 /opt/telecluster
    
    # Crear archivos de configuración por defecto si no existen
    if [[ ! -f /opt/telecluster/worker/config/worker.json ]]; then
        cat > /tmp/worker.json << EOF
{
  "network": {
    "default_bridge": "br0",
    "ip_forward": true,
    "nat_interface": "eth0"
  },
  "vm": {
    "default_storage_pool": "/var/lib/telecluster/vms",
    "default_memory_mb": 1024,
    "default_vcpus": 1
  },
  "logging": {
    "level": "INFO",
    "file": "/var/log/telecluster/worker.log"
  }
}
EOF
        sudo mv /tmp/worker.json /opt/telecluster/worker/config/worker.json
    fi
    
    if [[ ! -f /opt/telecluster/gateway/config/gateway.json ]]; then
        cat > /tmp/gateway.json << EOF
{
  "network": {
    "external_interface": "eth0",
    "internal_networks": ["10.0.0.0/8", "192.168.0.0/16", "172.16.0.0/12"]
  },
  "nat": {
    "enabled": true,
    "masquerade_interface": "eth0"
  },
  "logging": {
    "level": "INFO",
    "file": "/var/log/telecluster/gateway.log"
  }
}
EOF
        sudo mv /tmp/gateway.json /opt/telecluster/gateway/config/gateway.json
    fi
    
    log_success "Directorios y configuración creados ✓"
}

# Configurar entorno
setup_environment() {
    log_info "Configurando entorno del sistema..."
    
    # Habilitar IP forwarding
    echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf > /dev/null
    sudo sysctl -p > /dev/null 2>&1 || true
    
    # Verificar KVM para virtualización
    if [[ -e /dev/kvm ]]; then
        log_success "KVM disponible para virtualización ✓"
    else
        log_warning "KVM no disponible. Las funciones de VM pueden no funcionar."
    fi
    
    # Verificar libvirt
    if command -v virsh &> /dev/null; then
        log_success "libvirt detectado ✓"
    else
        log_warning "libvirt no detectado. Instálalo para funcionalidad completa de VMs."
    fi
    
    log_success "Entorno configurado ✓"
}

# Iniciar servicios
start_services() {
    log_info "Iniciando servicios TeleCluster..."
    
    # Construir e iniciar con Docker Compose
    docker-compose down > /dev/null 2>&1 || true
    docker-compose up -d --build
    
    log_info "Esperando que los servicios se inicialicen..."
    sleep 30
    
    # Verificar que los servicios estén funcionando
    local worker_status=$(curl -s http://localhost:8000/health | jq -r '.status' 2>/dev/null || echo "error")
    local gateway_status=$(curl -s http://localhost:8001/health | jq -r '.status' 2>/dev/null || echo "error")
    
    if [[ "$worker_status" == "healthy" ]]; then
        log_success "Worker Agent ejecutándose en http://localhost:8000 ✓"
    else
        log_error "Worker Agent no responde correctamente"
    fi
    
    if [[ "$gateway_status" == "healthy" ]]; then
        log_success "Gateway Agent ejecutándose en http://localhost:8001 ✓"
    else
        log_error "Gateway Agent no responde correctamente"
    fi
}

# Mostrar información de acceso
show_access_info() {
    echo ""
    echo "🎉 TeleCluster Orchestrator iniciado exitosamente!"
    echo "=================================================="
    echo ""
    echo "📱 Acceso a las APIs:"
    echo "   Worker Agent:  http://localhost:8000"
    echo "   Gateway Agent: http://localhost:8001"
    echo ""
    echo "📚 Documentación:"
    echo "   Worker Docs:   http://localhost:8000/docs"
    echo "   Gateway Docs:  http://localhost:8001/docs"
    echo ""
    echo "🔍 Health Checks:"
    echo "   Worker:        curl http://localhost:8000/health"
    echo "   Gateway:       curl http://localhost:8001/health"
    echo ""
    echo "📋 Comandos útiles:"
    echo "   Ver logs:      docker-compose logs -f"
    echo "   Reiniciar:     docker-compose restart"
    echo "   Detener:       docker-compose down"
    echo "   Estado:        docker-compose ps"
    echo ""
    echo "📁 Configuración en: /opt/telecluster/"
    echo "📄 Logs en: /opt/telecluster/logs/"
    echo ""
}

# Función principal
main() {
    echo ""
    check_requirements
    echo ""
    setup_directories
    echo ""
    setup_environment
    echo ""
    start_services
    echo ""
    show_access_info
    
    log_success "¡Inicio completado! Los servicios están ejecutándose."
}

# Manejar señales para cleanup
cleanup() {
    echo ""
    log_info "Deteniendo servicios..."
    docker-compose down
    exit 0
}

trap cleanup SIGINT SIGTERM

# Verificar argumentos
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    echo "Uso: $0 [--stop]"
    echo ""
    echo "Opciones:"
    echo "  --help, -h    Mostrar esta ayuda"
    echo "  --stop        Detener servicios"
    echo "  --status      Mostrar estado de servicios"
    echo ""
    echo "Sin argumentos: Iniciar todos los servicios"
    exit 0
fi

if [[ "$1" == "--stop" ]]; then
    log_info "Deteniendo servicios TeleCluster..."
    docker-compose down
    log_success "Servicios detenidos ✓"
    exit 0
fi

if [[ "$1" == "--status" ]]; then
    echo "Estado de servicios TeleCluster:"
    echo "================================"
    docker-compose ps
    echo ""
    echo "Health Checks:"
    echo "Worker:  $(curl -s http://localhost:8000/health | jq -r '.status' 2>/dev/null || echo 'No responde')"
    echo "Gateway: $(curl -s http://localhost:8001/health | jq -r '.status' 2>/dev/null || echo 'No responde')"
    exit 0
fi

# Ejecutar función principal
main
