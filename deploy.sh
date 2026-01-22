#!/bin/bash

# C-Team Ticketera - Script de Deploy para Proxmox
# Este script despliega la aplicacion en un servidor con Docker

set -e

echo "=========================================="
echo "  C-Team Ticketera - Deploy Script"
echo "=========================================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar si Docker esta instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker no esta instalado. Instalando...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker instalado correctamente${NC}"
fi

# Verificar si Docker Compose esta instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose no esta instalado. Instalando...${NC}"
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
    echo -e "${GREEN}Docker Compose instalado correctamente${NC}"
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creando archivo .env...${NC}"
    JWT_SECRET=$(openssl rand -base64 32)
    cat > .env << EOF
JWT_SECRET=${JWT_SECRET}
CORS_ORIGIN=http://localhost
PORT=3000
DB_PATH=/app/data/ticketera.db
EOF
    echo -e "${GREEN}Archivo .env creado con JWT_SECRET aleatorio${NC}"
fi

# Construir y levantar contenedores
echo -e "${YELLOW}Construyendo imagenes Docker...${NC}"
docker compose build --no-cache

echo -e "${YELLOW}Iniciando contenedores...${NC}"
docker compose up -d

# Esperar a que el backend este listo
echo -e "${YELLOW}Esperando a que el backend inicie...${NC}"
sleep 10

# Verificar estado
echo ""
echo "=========================================="
echo -e "${GREEN}Deploy completado!${NC}"
echo "=========================================="
echo ""
echo "La aplicacion esta disponible en:"
echo "  - Frontend: http://localhost"
echo "  - Ranking TV: http://localhost/ranking"
echo ""
echo "Credenciales por defecto:"
echo "  - Email: admin@cteamglobal.com"
echo "  - Password: admin123"
echo ""
echo -e "${RED}IMPORTANTE: Cambia la contrasena del admin!${NC}"
echo ""
echo "Comandos utiles:"
echo "  - Ver logs: docker compose logs -f"
echo "  - Reiniciar: docker compose restart"
echo "  - Detener: docker compose down"
echo "  - Actualizar: git pull && docker compose up -d --build"
