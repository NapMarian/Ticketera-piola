# Deploy en Proxmox - C-Team Ticketera

## Requisitos

- Proxmox VE 7.x o superior
- Container LXC o VM con:
  - Ubuntu 22.04 LTS (recomendado) o Debian 12
  - Minimo 1GB RAM, 2GB recomendado
  - 10GB de disco
  - Acceso a internet para descargar imagenes Docker

## Opcion 1: Deploy con Script Automatico

### 1. Crear Container LXC en Proxmox

```bash
# En el shell de Proxmox
pct create 200 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname ticketera \
  --memory 2048 \
  --cores 2 \
  --rootfs local-lvm:10 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --features nesting=1 \
  --unprivileged 1

pct start 200
pct enter 200
```

### 2. Instalar Git y clonar el proyecto

```bash
apt update && apt install -y git
cd /opt
git clone <url-del-repositorio> ticketera
cd ticketera
```

### 3. Ejecutar el script de deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

## Opcion 2: Deploy Manual

### 1. Instalar Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2. Instalar Docker Compose

```bash
apt-get install -y docker-compose-plugin
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env y cambiar JWT_SECRET
nano .env
```

### 4. Construir y ejecutar

```bash
docker compose up -d --build
```

## Configuracion de Red

### Acceso desde la red local

Si el container tiene IP `192.168.1.100`, la aplicacion sera accesible en:
- http://192.168.1.100 (Frontend)
- http://192.168.1.100/ranking (Ranking para TV)

### Configurar IP estatica

Editar `/etc/network/interfaces` o usar netplan:

```yaml
# /etc/netplan/00-installer-config.yaml
network:
  ethernets:
    eth0:
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
  version: 2
```

Aplicar: `netplan apply`

## Configuracion para TV (Ranking)

Para mostrar el ranking en una TV:

1. Conectar la TV o un mini PC a la red
2. Abrir navegador en modo kiosko:
   ```bash
   # En Linux con Chromium
   chromium-browser --kiosk http://192.168.1.100/ranking
   ```
3. El ranking se actualiza automaticamente cada 30 segundos

### Auto-inicio en Raspberry Pi

Crear `/etc/xdg/lxsession/LXDE-pi/autostart`:
```
@chromium-browser --kiosk --noerrdialogs --disable-infobars http://192.168.1.100/ranking
```

## Backup y Restauracion

### Backup de datos

```bash
# La base de datos esta en un volumen Docker
docker compose down
docker run --rm -v ticketera-piola_ticketera-data:/data -v $(pwd):/backup alpine tar czf /backup/ticketera-backup.tar.gz /data
docker compose up -d
```

### Restaurar backup

```bash
docker compose down
docker run --rm -v ticketera-piola_ticketera-data:/data -v $(pwd):/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/ticketera-backup.tar.gz -C /"
docker compose up -d
```

## Actualizacion

```bash
cd /opt/ticketera
git pull
docker compose up -d --build
```

## Troubleshooting

### Ver logs

```bash
# Todos los servicios
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo frontend
docker compose logs -f frontend
```

### Reiniciar servicios

```bash
docker compose restart
```

### Reconstruir desde cero

```bash
docker compose down -v
docker compose up -d --build
```

### Verificar estado

```bash
docker compose ps
curl http://localhost/api/health
```

## Seguridad

1. **Cambiar credenciales por defecto** inmediatamente despues del deploy
2. **Configurar firewall** para permitir solo puerto 80/443
3. **Usar HTTPS** en produccion (configurar con certbot/nginx)
4. **Backups regulares** de la base de datos

### Configurar HTTPS con Let's Encrypt

```bash
apt install -y certbot
certbot certonly --standalone -d tu-dominio.com
# Luego modificar nginx.conf para usar los certificados
```
