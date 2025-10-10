import logging
from typing import Any, Dict


class ColorFormatter(logging.Formatter):
    """Formatter que añade colores a los logs para mejor legibilidad"""
    
    # Códigos de color ANSI
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Verde
        'WARNING': '\033[33m',    # Amarillo
        'ERROR': '\033[31m',      # Rojo
        'CRITICAL': '\033[35m',   # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record):
        # Obtener color para el nivel
        color = self.COLORS.get(record.levelname, self.RESET)
        
        # Formatear mensaje
        record.levelname = f"{color}{record.levelname}{self.RESET}"
        
        return super().format(record)


def setup_logging(level: str = "INFO") -> None:
    """
    Configurar sistema de logging
    
    Args:
        level: Nivel de logging (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    
    # Configurar formato
    formatter = ColorFormatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Configurar handler para consola
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    # Configurar logger raíz
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))
    root_logger.addHandler(console_handler)
    
    # Configurar loggers específicos
    loggers = [
        'worker_agent',
        'services.bridge',
        'services.veth', 
        'services.vlan',
        'services.tuntap',
        'services.nat',
        'services.network'
    ]
    
    for logger_name in loggers:
        logger = logging.getLogger(logger_name)
        logger.setLevel(getattr(logging, level.upper()))
    
    # Reducir verbosidad de librerías externas
    logging.getLogger('uvicorn').setLevel(logging.WARNING)
    logging.getLogger('uvicorn.access').setLevel(logging.WARNING)


def validate_environment() -> Dict[str, Any]:
    """
    Validar que el entorno tiene los comandos necesarios
    
    Returns:
        Dict con resultados de validación
    """
    import subprocess
    import shutil
    
    required_commands = [
        'ip',
        'iptables',
        'ping',
        'traceroute'
    ]
    
    optional_commands = [
        'ovs-vsctl',
        'brctl'
    ]
    
    results = {
        'required': {},
        'optional': {},
        'all_required_available': True
    }
    
    # Verificar comandos requeridos
    for cmd in required_commands:
        if shutil.which(cmd):
            results['required'][cmd] = True
        else:
            results['required'][cmd] = False
            results['all_required_available'] = False
    
    # Verificar comandos opcionales
    for cmd in optional_commands:
        results['optional'][cmd] = shutil.which(cmd) is not None
    
    return results


def check_permissions() -> Dict[str, bool]:
    """
    Verificar permisos necesarios para operaciones de red
    
    Returns:
        Dict con estado de permisos
    """
    import os
    import subprocess
    
    permissions = {
        'root_user': os.getuid() == 0,
        'can_modify_network': False,
        'can_modify_iptables': False
    }
    
    # Verificar si se pueden modificar interfaces de red
    try:
        # Intentar listar interfaces (comando que requiere permisos mínimos)
        subprocess.run(['ip', 'link', 'show'], capture_output=True, check=True)
        permissions['can_modify_network'] = True
    except (subprocess.CalledProcessError, FileNotFoundError):
        permissions['can_modify_network'] = False
    
    # Verificar si se pueden modificar reglas iptables
    try:
        # Intentar listar reglas iptables
        subprocess.run(['iptables', '-L'], capture_output=True, check=True)
        permissions['can_modify_iptables'] = True
    except (subprocess.CalledProcessError, FileNotFoundError):
        permissions['can_modify_iptables'] = False
    
    return permissions
