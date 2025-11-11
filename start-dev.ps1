# PowerShell script to start development environment
Write-Host "🚀 Starting WhatsApp Bot Development Environment..." -ForegroundColor Green

# Check for pnpm
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: pnpm is not installed" -ForegroundColor Red
    Write-Host "📦 Install pnpm: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# Check for node
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Node.js is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites checked" -ForegroundColor Green

# Install dependencies if node_modules doesn't exist
if (!(Test-Path "backend/node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location backend
    pnpm install
    Set-Location ..
}

if (!(Test-Path "frontend/node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location frontend
    pnpm install
    Set-Location ..
}

# Install Chromium for Puppeteer
Write-Host "🌐 Installing Chromium for Puppeteer..." -ForegroundColor Cyan
Set-Location backend
node node_modules/puppeteer/install.mjs
Set-Location ..

# Kill any existing processes on ports
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Cyan
$processes = Get-NetTCPConnection -LocalPort 3004 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Where-Object { $_ -gt 0 }
if ($processes) { $processes | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }

$processes = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Where-Object { $_ -gt 0 }
if ($processes) { $processes | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }

# Start backend
Write-Host "🔧 Starting backend server on port 3004..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock { Set-Location $args[0]; pnpm run start:dev } -ArgumentList "$PWD\backend"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "🎨 Starting frontend server on port 5173..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock { Set-Location $args[0]; pnpm run dev } -ArgumentList "$PWD\frontend"

Write-Host ""
Write-Host "✅ Development servers started!" -ForegroundColor Green
Write-Host "📱 Backend: http://localhost:3004" -ForegroundColor Yellow
Write-Host "🖥️  Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Check logs: Get-Job | Receive-Job" -ForegroundColor Cyan
Write-Host "🛑 To stop: Get-Job | Stop-Job" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servers are running in background jobs..." -ForegroundColor Green


