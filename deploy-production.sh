#!/bin/bash

# Production Deployment Script for Airport Parking Platform
# This script handles the complete production deployment process

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="airport-parking-platform"
DEPLOYMENT_DIR="/opt/airport-parking"
BACKUP_DIR="/opt/backups"
LOG_DIR="/var/log/airport-parking"
SERVICE_NAME="airport-parking"
NGINX_CONFIG="/etc/nginx/sites-available/airport-parking"
SSL_CERT_DIR="/etc/letsencrypt/live/airportparking.com"

# Functions
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

check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
    
    # Check required commands
    local required_commands=("git" "node" "npm" "pm2" "nginx" "certbot" "systemctl")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "Required command '$cmd' not found"
            exit 1
        fi
    done
    
    # Check if deployment directory exists
    if [[ ! -d "$DEPLOYMENT_DIR" ]]; then
        log_info "Creating deployment directory..."
        mkdir -p "$DEPLOYMENT_DIR"
    fi
    
    log_success "Prerequisites check completed"
}

backup_current_deployment() {
    log_info "Creating backup of current deployment..."
    
    if [[ -d "$DEPLOYMENT_DIR/app" ]]; then
        local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
        local backup_path="$BACKUP_DIR/$backup_name"
        
        mkdir -p "$backup_path"
        cp -r "$DEPLOYMENT_DIR/app" "$backup_path/"
        cp -r "$DEPLOYMENT_DIR/config" "$backup_path/" 2>/dev/null || true
        
        log_success "Backup created at $backup_path"
    else
        log_warning "No existing deployment to backup"
    fi
}

update_application_code() {
    log_info "Updating application code..."
    
    cd "$DEPLOYMENT_DIR"
    
    if [[ -d "app" ]]; then
        cd app
        git fetch origin
        git reset --hard origin/main
    else
        git clone https://github.com/your-username/airport-parking.git app
        cd app
    fi
    
    log_success "Application code updated"
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    cd "$DEPLOYMENT_DIR/app"
    
    # Install Node.js dependencies
    npm ci --production
    
    # Install global PM2 if not already installed
    if ! npm list -g pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    log_success "Dependencies installed"
}

setup_environment() {
    log_info "Setting up environment configuration..."
    
    cd "$DEPLOYMENT_DIR/app"
    
    # Copy production environment file
    if [[ -f "env.production.example" ]]; then
        cp env.production.example .env
        log_warning "Please update .env file with your production values"
        log_warning "You can edit the file at: $DEPLOYMENT_DIR/app/.env"
    else
        log_error "Production environment file not found"
        exit 1
    fi
    
    # Create necessary directories
    mkdir -p logs uploads temp
    
    log_success "Environment setup completed"
}

setup_database() {
    log_info "Setting up database..."
    
    cd "$DEPLOYMENT_DIR/app"
    
    # Run database migrations
    if [[ -f "run-stage-1-5-migration.js" ]]; then
        log_info "Running database migrations..."
        node run-stage-1-5-migration.js
    fi
    
    log_success "Database setup completed"
}

build_frontend() {
    log_info "Building frontend application..."
    
    cd "$DEPLOYMENT_DIR/app/client"
    
    # Install frontend dependencies
    npm ci
    
    # Build for production
    npm run build
    
    log_success "Frontend built successfully"
}

configure_nginx() {
    log_info "Configuring Nginx..."
    
    # Create Nginx configuration
    cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    server_name airportparking.com www.airportparking.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name airportparking.com www.airportparking.com;
    
    # SSL Configuration
    ssl_certificate $SSL_CERT_DIR/fullchain.pem;
    ssl_certificate_key $SSL_CERT_DIR/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend static files
    location / {
        root $DEPLOYMENT_DIR/app/client/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
    
    # Logs
    access_log /var/log/nginx/airport-parking.access.log;
    error_log /var/log/nginx/airport-parking.error.log;
}
EOF
    
    # Enable site
    ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
    
    # Test configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    log_success "Nginx configured successfully"
}

setup_ssl_certificate() {
    log_info "Setting up SSL certificate..."
    
    # Check if certificate already exists
    if [[ ! -d "$SSL_CERT_DIR" ]]; then
        log_info "Requesting SSL certificate from Let's Encrypt..."
        certbot certonly --nginx -d airportparking.com -d www.airportparking.com --non-interactive --agree-tos --email admin@airportparking.com
    else
        log_info "SSL certificate already exists, renewing if necessary..."
        certbot renew --quiet
    fi
    
    log_success "SSL certificate setup completed"
}

create_pm2_config() {
    log_info "Creating PM2 configuration..."
    
    cd "$DEPLOYMENT_DIR/app"
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'server/index.ts',
    cwd: '$DEPLOYMENT_DIR/app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_file: '.env',
    log_file: 'logs/combined.log',
    out_file: 'logs/out.log',
    error_file: 'logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 8000
  }]
};
EOF
    
    log_success "PM2 configuration created"
}

start_application() {
    log_info "Starting application..."
    
    cd "$DEPLOYMENT_DIR/app"
    
    # Stop existing PM2 processes
    pm2 stop "$SERVICE_NAME" 2>/dev/null || true
    pm2 delete "$SERVICE_NAME" 2>/dev/null || true
    
    # Start application with PM2
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup
    
    log_success "Application started successfully"
}

setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create systemd service for PM2
    cat > /etc/systemd/system/pm2-root.service << EOF
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=root
WorkingDirectory=$DEPLOYMENT_DIR/app
ExecStart=/usr/bin/pm2 resurrect
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable and start PM2 service
    systemctl daemon-reload
    systemctl enable pm2-root
    systemctl start pm2-root
    
    log_success "Monitoring setup completed"
}

setup_log_rotation() {
    log_info "Setting up log rotation..."
    
    # Create logrotate configuration
    cat > /etc/logrotate.d/airport-parking << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload pm2-root > /dev/null 2>&1 || true
    endscript
}
EOF
    
    log_success "Log rotation configured"
}

setup_firewall() {
    log_info "Setting up firewall..."
    
    # Allow SSH, HTTP, HTTPS
    ufw allow ssh
    ufw allow 80
    ufw allow 443
    
    # Enable firewall
    ufw --force enable
    
    log_success "Firewall configured"
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    local health_check=$(curl -s -o /dev/null -w "%{http_code}" https://airportparking.com/health)
    
    if [[ "$health_check" == "200" ]]; then
        log_success "Health check passed"
    else
        log_error "Health check failed (HTTP $health_check)"
        exit 1
    fi
    
    # Check PM2 status
    pm2 status
    
    log_success "Health checks completed"
}

cleanup() {
    log_info "Cleaning up deployment artifacts..."
    
    cd "$DEPLOYMENT_DIR/app"
    
    # Remove development dependencies
    rm -rf node_modules
    npm ci --production
    
    # Clean up temporary files
    rm -rf .git .github
    
    log_success "Cleanup completed"
}

main() {
    log_info "Starting production deployment for $APP_NAME..."
    
    check_prerequisites
    backup_current_deployment
    update_application_code
    install_dependencies
    setup_environment
    setup_database
    build_frontend
    setup_ssl_certificate
    configure_nginx
    create_pm2_config
    start_application
    setup_monitoring
    setup_log_rotation
    setup_firewall
    run_health_checks
    cleanup
    
    log_success "Production deployment completed successfully!"
    log_info "Your application is now running at: https://airportparking.com"
    log_info "PM2 status: pm2 status"
    log_info "Application logs: pm2 logs $SERVICE_NAME"
    log_info "Nginx logs: tail -f /var/log/nginx/airport-parking.access.log"
}

# Run main function
main "$@"
