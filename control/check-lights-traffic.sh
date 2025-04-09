#!/bin/bash
# check-lights-traffic.sh
# Monitor UDP traffic to the InfoLab lights subnet (169.254.1.x)
# and restart the service if no traffic is detected

LOG_FILE="/var/log/infolab-lights-health.log"
SERVICE_NAME="infolab-lights.service"
CHECK_INTERVAL=30  # seconds
PACKETS_THRESHOLD=5 # minimum number of packets expected
SUBNET="169.254.1.0/24"

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root" 
    exit 1
fi

# Log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if we can run tcpdump
if ! command -v tcpdump &> /dev/null; then
    log "ERROR: tcpdump not found. Please install it."
    exit 1
fi

# Check if the service is running
if ! systemctl is-active --quiet "$SERVICE_NAME"; then
    log "WARNING: $SERVICE_NAME is not running. Attempting to start it."
    systemctl start "$SERVICE_NAME"
    exit $?
fi

# Count UDP packets to the subnet
log "Checking for UDP traffic to $SUBNET for ${CHECK_INTERVAL}s..."
PACKET_COUNT=$(timeout "$CHECK_INTERVAL" tcpdump -c "$PACKETS_THRESHOLD" -i any "dst net $SUBNET and udp" 2>/dev/null | grep -c "UDP")

# If fewer packets than threshold, consider it unhealthy
if [ "$PACKET_COUNT" -lt "$PACKETS_THRESHOLD" ]; then
    log "ALERT: Only $PACKET_COUNT UDP packets to $SUBNET detected in ${CHECK_INTERVAL}s (threshold: $PACKETS_THRESHOLD). Restarting service."
    systemctl restart "$SERVICE_NAME"
    log "Service restart initiated."
    exit 1
else
    log "HEALTHY: $PACKET_COUNT UDP packets to $SUBNET detected in ${CHECK_INTERVAL}s."
    exit 0
fi 