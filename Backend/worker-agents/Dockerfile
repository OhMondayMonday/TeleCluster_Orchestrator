FROM python:3.11-slim

# Variables de entorno
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Instalar dependencias del sistema para networking y virtualización
RUN apt-get update && apt-get install -y 
    iproute2 
    iptables 
    bridge-utils 
    net-tools 
    iputils-ping 
    curl 
    procps 
    sudo 
    qemu-kvm 
    qemu-utils 
    libvirt-daemon-system 
    libvirt-clients 
    virtinst 
    virt-manager 
    libvirt-dev 
    pkg-config 
    gcc 
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY requirements.txt .
COPY install.sh .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY . .

# Dar permisos de ejecución
RUN chmod +x install.sh

# Crear directorios necesarios
RUN mkdir -p /etc/telecluster/worker /var/log/telecluster /var/lib/telecluster/vms

# Puerto del servicio
EXPOSE 8000

# Volúmenes para persistencia
VOLUME ["/var/lib/telecluster", "/etc/telecluster"]

# Comando de inicio
CMD ["python", "main.py"]
