#!/bin/bash

# TeleCluster Worker Agent - Script de instalación y configuración
# Autor: TeleCluster Team
# Versión: 1.0.0

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Variables de configuración
WORKER_USER="telecluster"
WORKER_DIR="/opt/telecluster-worker"
SERVICE_NAME="telecluster-worker"
VENV_DIR="$WORKER_DIR/venv"
LOG_DIR="/var/log/telecluster"

# Verificar si se ejecuta como root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script debe ejecutarse como root"
        exit 1
    fi
}

# Detectar distribución Linux
detect_distro() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        DISTRO=$ID
        VERSION=$VERSION_ID
    else
        log_error "No se pudo detectar la distribución Linux"
        exit 1
    fi
    
    log_info "Detectada: $PRETTY_NAME"
}

# Instalar dependencias del sistema
install_system_deps() {
    log_step "Instalando dependencias del sistema..."
    
    case $DISTRO in
        ubuntu|debian)
            apt-get update
            apt-get install -y \
                python3 \
                python3-pip \
                python3-venv \
                iproute2 \
                bridge-utils \
                iptables \
                iputils-ping \
                net-tools \
                traceroute \
                curl \
                systemd
            
            # Instalar OVS (opcional)
            if apt-cache show openvswitch-switch >/dev/null 2>&1; then
                apt-get install -y openvswitch-switch
                log_info "Open vSwitch instalado"
            else
                log_warn "Open vSwitch no disponible en repositorios"
            fi
            ;;
            
        centos|rhel|fedora)
            if command -v dnf >/dev/null 2>&1; then
                PKG_MGR="dnf"
            else
                PKG_MGR="yum"
            fi
            
            $PKG_MGR update -y
            $PKG_MGR install -y \
                python3 \
                python3-pip \
                iproute \
                bridge-utils \
                iptables \
                iputils \
                net-tools \
                traceroute \
                curl \
                systemd
            
            # Instalar OVS (opcional)
            if $PKG_MGR list openvswitch >/dev/null 2>&1; then
                $PKG_MGR install -y openvswitch
                systemctl enable openvswitch
                systemctl start openvswitch
                log_info "Open vSwitch instalado y habilitado"
            else
                log_warn "Open vSwitch no disponible en repositorios"
            fi
            ;;
            
        *)
            log_error "Distribución no soportada: $DISTRO"
            exit 1
            ;;
    esac
}

# Crear usuario del sistema
create_user() {
    log_step "Configurando usuario del sistema..."
    
    if ! id "$WORKER_USER" >/dev/null 2>&1; then
        useradd --system --home-dir "$WORKER_DIR" --create-home \
                --shell /bin/bash --comment "TeleCluster Worker" "$WORKER_USER"
        log_info "Usuario $WORKER_USER creado"
    else
        log_info "Usuario $WORKER_USER ya existe"
    fi
    
    # Añadir capabilities de red
    usermod -aG sudo "$WORKER_USER" 2>/dev/null || true
}

# Configurar directorios
setup_directories() {
    log_step "Configurando directorios..."
    
    # Crear directorio principal
    mkdir -p "$WORKER_DIR"
    chown "$WORKER_USER:$WORKER_USER" "$WORKER_DIR"
    
    # Crear directorio de logs
    mkdir -p "$LOG_DIR"
    chown "$WORKER_USER:$WORKER_USER" "$LOG_DIR"
    
    # Crear directorio de configuración
    mkdir -p /etc/telecluster
    
    log_info "Directorios configurados en $WORKER_DIR"
}

# Instalar aplicación Python
install_python_app() {
    log_step "Instalando aplicación Python..."
    
    # Copiar archivos de la aplicación
    if [[ -f "requirements.txt" ]]; then
        cp -r . "$WORKER_DIR/app/"
        chown -R "$WORKER_USER:$WORKER_USER" "$WORKER_DIR/app/"
    else
        log_error "requirements.txt no encontrado. ¿Está ejecutando desde el directorio correcto?"
        exit 1
    fi
    
    # Crear entorno virtual
    sudo -u "$WORKER_USER" python3 -m venv "$VENV_DIR"
    
    # Instalar dependencias
    sudo -u "$WORKER_USER" "$VENV_DIR/bin/pip" install --upgrade pip
    sudo -u "$WORKER_USER" "$VENV_DIR/bin/pip" install -r "$WORKER_DIR/app/requirements.txt"
    
    log_info "Aplicación Python instalada"
}

# Configurar servicio systemd
setup_systemd_service() {
    log_step "Configurando servicio systemd..."
    
    cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=TeleCluster Worker Agent
Documentation=https://github.com/TeleCluster/Orchestrator
After=network.target
Wants=network.target

[Service]
Type=simple
User=$WORKER_USER
Group=$WORKER_USER
WorkingDirectory=$WORKER_DIR/app
Environment=PATH=$VENV_DIR/bin
Environment=LOG_LEVEL=INFO
Environment=HOST=0.0.0.0
Environment=PORT=8000
ExecStart=$VENV_DIR/bin/python main.py
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
RestartSec=5
Restart=always

# Capabilities de red
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_RAW
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_RAW

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=telecluster-worker

[Install]
WantedBy=multi-user.target
EOF

    # Recargar systemd
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    
    log_info "Servicio systemd configurado"
}

# Configurar firewall básico
setup_firewall() {
    log_step "Configurando firewall básico..."
    
    if command -v ufw >/dev/null 2>&1; then
        # Ubuntu/Debian con ufw
        ufw --force enable
        ufw allow 8000/tcp comment "TeleCluster Worker API"
        ufw allow from 10.0.0.0/8 comment "Private networks"
        ufw allow from 172.16.0.0/12 comment "Private networks" 
        ufw allow from 192.168.0.0/16 comment "Private networks"
        log_info "Firewall configurado con ufw"
        
    elif command -v firewall-cmd >/dev/null 2>&1; then
        # CentOS/RHEL/Fedora con firewalld
        systemctl enable firewalld
        systemctl start firewalld
        firewall-cmd --permanent --add-port=8000/tcp
        firewall-cmd --permanent --add-source=10.0.0.0/8
        firewall-cmd --permanent --add-source=172.16.0.0/12
        firewall-cmd --permanent --add-source=192.168.0.0/16
        firewall-cmd --reload
        log_info "Firewall configurado con firewalld"
        
    else
        log_warn "No se encontró sistema de firewall conocido (ufw/firewalld)"
    fi
}

# Configurar bridges de red básicos
setup_basic_bridges() {
    log_step "Configurando bridges de red básicos..."
    
    # Script para crear bridges en el arranque
    cat > "/etc/telecluster/setup-bridges.sh" << 'EOF'
#!/bin/bash

# Crear bridges básicos si no existen
if ! ip link show br-ex >/dev/null 2>&1; then
    ip link add name br-ex type bridge
    ip link set br-ex up
    echo "Bridge br-ex creado"
fi

if ! ip link show br-int >/dev/null 2>&1; then
    ip link add name br-int type bridge  
    ip link set br-int up
    echo "Bridge br-int creado"
fi

# Habilitar IP forwarding
echo 1 > /proc/sys/net/ipv4/ip_forward
sysctl -w net.ipv4.ip_forward=1
EOF

    chmod +x "/etc/telecluster/setup-bridges.sh"
    
    # Ejecutar ahora
    /etc/telecluster/setup-bridges.sh
    
    # Configurar para ejecutar en el arranque
    cat > "/etc/systemd/system/telecluster-bridges.service" << EOF
[Unit]
Description=TeleCluster Network Bridges Setup
Before=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/etc/telecluster/setup-bridges.sh
RemainAfterExit=true

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable telecluster-bridges
    
    log_info "Bridges de red configurados"
}

# Generar configuración de ejemplo
generate_config() {
    log_step "Generando configuración de ejemplo..."
    
    cat > "/etc/telecluster/worker-config.json" << EOF
{
    "worker_id": "worker-$(hostname -s)",
    "cluster_name": "telecluster-lab",
    "network": {
        "wan_interface": "ens3",
        "lan_interface": "ens4", 
        "external_bridge": "br-ex",
        "internal_bridge": "br-int"
    },
    "api": {
        "host": "0.0.0.0",
        "port": 8000,
        "log_level": "INFO"
    },
    "security": {
        "enable_cors": true,
        "allowed_origins": ["*"],
        "require_auth": false
    }
}
EOF

    chown "$WORKER_USER:$WORKER_USER" "/etc/telecluster/worker-config.json"
    log_info "Configuración generada en /etc/telecluster/worker-config.json"
}

# Verificar instalación
verify_installation() {
    log_step "Verificando instalación..."
    
    # Verificar archivos
    if [[ ! -f "$WORKER_DIR/app/main.py" ]]; then
        log_error "Archivo main.py no encontrado"
        return 1
    fi
    
    # Verificar servicio
    if ! systemctl is-enabled "$SERVICE_NAME" >/dev/null 2>&1; then
        log_error "Servicio no habilitado"
        return 1
    fi
    
    # Verificar bridges
    if ! ip link show br-ex >/dev/null 2>&1; then
        log_warn "Bridge br-ex no encontrado"
    fi
    
    if ! ip link show br-int >/dev/null 2>&1; then
        log_warn "Bridge br-int no encontrado"
    fi
    
    log_info "Verificación completada"
    return 0
}

# Mostrar información post-instalación
show_post_install_info() {
    log_step "Información post-instalación"
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║          TeleCluster Worker Agent Instalado         ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo "🎯 Servicio: $SERVICE_NAME"
    echo "📁 Directorio: $WORKER_DIR"
    echo "📋 Logs: $LOG_DIR"
    echo "⚙️  Configuración: /etc/telecluster/"
    echo ""
    echo "🚀 Comandos útiles:"
    echo "   Iniciar:    systemctl start $SERVICE_NAME"
    echo "   Parar:      systemctl stop $SERVICE_NAME"
    echo "   Estado:     systemctl status $SERVICE_NAME"
    echo "   Logs:       journalctl -u $SERVICE_NAME -f"
    echo ""
    echo "🌐 API disponible en: http://$(hostname -I | awk '{print $1}'):8000"
    echo "📚 Documentación: http://$(hostname -I | awk '{print $1}'):8000/docs"
    echo ""
    echo "⚡ Para iniciar el servicio ahora:"
    echo "   systemctl start $SERVICE_NAME"
    echo ""
}

# Función principal
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║       TeleCluster Worker Agent - Instalador         ║"
    echo "║                   Versión 1.0.0                     ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_root
    detect_distro
    install_system_deps
    create_user
    setup_directories
    install_python_app
    setup_systemd_service
    setup_firewall
    setup_basic_bridges
    generate_config
    
    if verify_installation; then
        show_post_install_info
    else
        log_error "La instalación no se completó correctamente"
        exit 1
    fi
}

# Ejecutar función principal
main "$@"
