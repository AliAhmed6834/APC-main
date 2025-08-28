Write-Host "========================================" -ForegroundColor Green
Write-Host "Airport Parking Supplier System Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking if PostgreSQL is installed..." -ForegroundColor Yellow
try {
    $pgVersion = pg_config --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL found: $pgVersion" -ForegroundColor Green
    } else {
        throw "PostgreSQL not found"
    }
} catch {
    Write-Host "ERROR: PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Create database
Write-Host "Creating database..." -ForegroundColor Yellow
try {
    psql -U postgres -c "CREATE DATABASE airport_parking_supplier;" 2>$null
    Write-Host "Database created successfully!" -ForegroundColor Green
} catch {
    Write-Host "Database might already exist, continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Set up database tables
Write-Host "Setting up database tables..." -ForegroundColor Yellow
npm run db:setup

Write-Host ""

# Start the application
Write-Host "Starting the application..." -ForegroundColor Yellow
npm run dev

Read-Host "Press Enter to exit" 