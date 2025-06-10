#!/bin/bash
# Script to start both backend and frontend

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to display help
show_help() {
  echo "Usage: ./start.sh [options]"
  echo ""
  echo "Options:"
  echo "  -b, --backend-only    Start only the backend server"
  echo "  -f, --frontend-only   Start only the frontend server"
  echo "  -h, --help            Display this help message"
  echo ""
  echo "Without options, both backend and frontend will start."
}

# Default values
RUN_BACKEND=true
RUN_FRONTEND=true

# Process command line options
while [[ $# -gt 0 ]]; do
  case "$1" in
    -b|--backend-only)
      RUN_BACKEND=true
      RUN_FRONTEND=false
      shift
      ;;
    -f|--frontend-only)
      RUN_BACKEND=false
      RUN_FRONTEND=true
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start the backend if needed
if [ "$RUN_BACKEND" = true ]; then
  echo "Starting backend server..."
  cd "$SCRIPT_DIR/backend" || exit 1
  
  # Load environment variables from .env file if it exists
  ENV_FILE="$SCRIPT_DIR/.env"
  if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from $ENV_FILE"
    set -a
    source "$ENV_FILE"
    set +a
    echo "Using BACKEND_PORT=$BACKEND_PORT from environment"
  else
    echo "No .env file found. Please create one with BACKEND_PORT and FRONTEND_PORT."
    exit 1
  fi

  # Check if pm2 is installed, use it if available
  if command_exists pm2; then
    pm2 start server.js --name brain-backend --env BACKEND_PORT=$BACKEND_PORT
    echo "Backend started with pm2 on port $BACKEND_PORT (use 'pm2 logs brain-backend' to view logs)"
  else
    # Otherwise use nohup
    BACKEND_PORT=$BACKEND_PORT nohup node server.js > nohup.out 2>&1 &
    BACKEND_PID=$!
    echo "Backend started with PID $BACKEND_PID on port $BACKEND_PORT"
    echo "Check nohup.out for logs"
  fi
fi

# Start the frontend if needed
if [ "$RUN_FRONTEND" = true ]; then
  echo "Starting frontend server..."
  cd "$SCRIPT_DIR/frontend" || exit 1
  
  # Load environment variables if not already loaded
  ENV_FILE="$SCRIPT_DIR/.env"
  if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
    echo "Using FRONTEND_PORT=$FRONTEND_PORT from environment"
  else
    echo "No .env file found. Please create one with BACKEND_PORT and FRONTEND_PORT."
    exit 1
  fi
  
  # Check if serve is installed
  if ! command_exists serve; then
    echo "The 'serve' command is not found. Installing it temporarily..."
    echo "Starting frontend on port $FRONTEND_PORT as set in .env"
    npx serve --listen $FRONTEND_PORT &
    FRONTEND_PID=$!
    echo "Frontend server running at http://localhost:$FRONTEND_PORT"
    echo "Press Ctrl+C to stop the servers"
  else
    echo "Starting frontend on port $FRONTEND_PORT as set in .env"
    serve --listen $FRONTEND_PORT &
    FRONTEND_PID=$!
    echo "Frontend server running at http://localhost:$FRONTEND_PORT"
    echo "Press Ctrl+C to stop the servers"
  fi
fi

# If running both, wait for a keyboard interrupt
if [ "$RUN_BACKEND" = true ] && [ "$RUN_FRONTEND" = true ]; then
  echo ""
  echo "Both servers are now running."
  echo "Backend:  http://localhost:$BACKEND_PORT"
  echo "Frontend: http://localhost:$FRONTEND_PORT"
  echo "Press Ctrl+C to stop the servers"
  # Wait for a keyboard interrupt
  trap 'echo "Stopping servers..."; kill $FRONTEND_PID 2>/dev/null; if command_exists pm2; then pm2 stop brain-backend; else kill $(pgrep -f "node server.js") 2>/dev/null; fi; echo "Servers stopped."; exit 0' INT
  # Keep the script running
  while true; do
    sleep 1
  done
fi

# If only one is running, print its URL
if [ "$RUN_BACKEND" = true ] && [ "$RUN_FRONTEND" = false ]; then
  echo "Backend server running at http://localhost:$BACKEND_PORT"
fi
if [ "$RUN_BACKEND" = false ] && [ "$RUN_FRONTEND" = true ]; then
  echo "Frontend server running at http://localhost:$FRONTEND_PORT"
fi

exit 0
