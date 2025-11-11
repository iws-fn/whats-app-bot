# WhatsApp Bot - Bulk Message Sender

A full-stack application for sending bulk personalized WhatsApp messages with CSV contact management and template support.

## 📋 Features

- 🔐 **WhatsApp Authentication** - QR code-based authentication via whatsapp-web.js
- 📁 **CSV Upload** - Import contacts from CSV files
- 🎯 **Smart Filtering** - Automatically filters contacts by location (Yekaterinburg)
- ✉️ **Bulk Messaging** - Send personalized messages to multiple contacts
- 📝 **Template Variables** - Use placeholders like `{{ИО}}` for personalization
- 🔄 **Real-time Updates** - Server-Sent Events (SSE) for QR code and authentication status
- 🎨 **Modern UI** - Clean Material-UI interface

## 🏗️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **whatsapp-web.js** - WhatsApp Web API wrapper
- **Puppeteer** - Headless browser automation
- **CSV Parser** - CSV file processing
- **RxJS** - Reactive programming for SSE

### Frontend
- **React** - UI library
- **Vite** - Fast build tool
- **Material-UI** - Component library
- **Axios** - HTTP client
- **React QR Code** - QR code rendering

## 📦 Installation

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (package manager)
- Git

### Clone Repository

```bash
git clone https://github.com/iws-fn/whats-app-bot.git
cd whats-app-bot
```

### Backend Setup

```bash
cd backend
pnpm install

# Important: Manually install Chromium for Puppeteer
node node_modules/puppeteer/install.mjs
```

### Frontend Setup

```bash
cd frontend
pnpm install
```

## 🚀 Running the Application

You have multiple options to run the application:

### Option 1: Quick Start with Scripts (Recommended for Development)

**Windows (PowerShell):**
```powershell
.\start-dev.ps1
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Install dependencies if needed
- ✅ Download Chromium for Puppeteer
- ✅ Start both backend and frontend servers
- ✅ Clean up ports if already in use

### Option 2: Docker (Recommended for Production)

**Start with Docker Compose:**
```bash
docker-compose up -d
```

This will start:
- Backend on `http://localhost:3004`
- Frontend on `http://localhost:8080`

**Stop containers:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

**Rebuild after changes:**
```bash
docker-compose up -d --build
```

### Option 3: Manual Start

**Start Backend (Port 3004):**
```bash
cd backend
pnpm install
node node_modules/puppeteer/install.mjs
pnpm run start:dev
```

**Start Frontend (Port 5173):**
```bash
cd frontend
pnpm install
pnpm run dev
```

## 📖 Usage

### 1. WhatsApp Authentication

1. Open the frontend at `http://localhost:5173`
2. Scan the QR code with your WhatsApp mobile app
3. Wait for authentication to complete

### 2. Upload Contacts

1. Prepare a CSV file with the following columns:
   - `ФИО учителя` (Full Name)
   - `ИО учителя` (Initials)
   - `Телефон для мессенджера` (Phone Number)
   - `Город` (City)
2. Click "Загрузить CSV" to upload
3. The app will automatically filter contacts from Yekaterinburg

### 3. Send Messages

1. Select recipients from the dropdown
2. Type your message (use `{{ИО}}` for personalization)
3. Preview messages below the input
4. Click "Отправить сообщение" to send

### CSV Format Example

```csv
ФИО учителя,ИО учителя,Телефон для мессенджера,Город
Иванов Иван Иванович,Иванов И.И.,79001234567,Екатеринбург
Петрова Мария Сергеевна,Петрова М.С.,79007654321,Екатеринбург
```

## 🔧 Configuration

### Backend Port

Edit `backend/src/main.ts` to change the port (default: 3004):

```typescript
await app.listen(3004);
```

### Frontend API URL

Edit `frontend/src/App.tsx` to update API endpoints:

```typescript
axios.get("http://localhost:3004")
```

### Chrome Executable Path

The Chrome path is automatically detected in `backend/src/app.service.ts` using puppeteer:

```typescript
import * as puppeteer from 'puppeteer';

// Automatically finds the installed Chromium
executablePath: puppeteer.executablePath()
```

No manual configuration needed!

## 📁 Project Structure

```
whats-app-bot/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── app.controller.ts    # API endpoints
│   │   ├── app.service.ts       # WhatsApp client logic
│   │   ├── app.module.ts        # App module
│   │   └── main.ts              # Entry point
│   ├── .wwebjs_auth/    # WhatsApp session data (gitignored)
│   ├── Dockerfile       # Backend Docker image
│   └── package.json
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── App.tsx              # Main component
│   │   ├── hooks/               # Custom hooks
│   │   └── components/          # UI components
│   ├── Dockerfile       # Frontend Docker image
│   └── package.json
│
├── docker-compose.yml   # Docker orchestration
├── start-dev.sh         # Linux/Mac startup script
├── start-dev.ps1        # Windows startup script
├── .dockerignore        # Docker ignore file
└── README.md
```

## 🐳 Docker Deployment

The application includes Docker support for easy deployment:

### Docker Files

- **`backend/Dockerfile`** - Multi-stage build for NestJS backend with Chromium
- **`frontend/Dockerfile`** - Multi-stage build with Nginx for frontend
- **`docker-compose.yml`** - Orchestrates both services with networking
- **`.dockerignore`** - Excludes unnecessary files from Docker build

### Docker Compose Services

| Service | Port | Description |
|---------|------|-------------|
| backend | 3004 | NestJS API server with WhatsApp client |
| frontend | 8080 | React app served via Nginx |

### Production Deployment

For production deployment:

1. **Update frontend API URLs** to point to your production backend
2. **Configure environment variables** in docker-compose.yml
3. **Set up reverse proxy** (nginx/traefik) for HTTPS
4. **Persistent volumes** are configured for WhatsApp session data
5. **Set restart policy** to `unless-stopped` for auto-recovery

### Environment Variables

You can customize the deployment by adding environment variables to docker-compose.yml:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3004
  # Add more as needed
```

## 🔒 Security Notes

- **Session Data**: The `.wwebjs_auth` directory contains sensitive WhatsApp session data and is automatically excluded from Git
- **Phone Numbers**: Handle contact data responsibly and comply with privacy regulations
- **CORS**: Configure CORS settings in production environments
- **Rate Limiting**: Be mindful of WhatsApp's rate limits to avoid account bans

## 🐛 Troubleshooting

### Chrome/Chromium Not Found Error

If you encounter `Error: Could not find expected browser (chrome) locally`, run:

```bash
cd backend
node node_modules/puppeteer/install.mjs
```

### PNPM Build Scripts Warning

If puppeteer installation is skipped, approve build scripts:

```bash
pnpm approve-builds
```

### Port Already in Use

If port 3004 or 5173 is already in use, you can either:

**Option 1: Kill the process using the port (Windows PowerShell)**
```powershell
# For port 3004
$processes = Get-NetTCPConnection -LocalPort 3004 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Where-Object { $_ -gt 0 }
if ($processes) { $processes | ForEach-Object { Stop-Process -Id $_ -Force } } else { Write-Host "Port 3004 is free" }
```

**Option 2: Change the port**
- Backend: Edit `backend/src/main.ts`
- Frontend: Edit `vite.config.ts`

### WhatsApp Disconnection

If WhatsApp disconnects frequently:
- Ensure stable internet connection
- Don't use WhatsApp Web on another browser simultaneously
- Check if your WhatsApp account is active

## 📝 API Endpoints

### Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Initialize WhatsApp authentication |
| GET (SSE) | `/qr` | Stream QR code data |
| GET (SSE) | `/authenticated` | Stream authentication status |
| POST | `/upload` | Upload CSV file |
| POST | `/send` | Send bulk messages |

### Request Examples

**Upload CSV:**
```bash
curl -X POST http://localhost:3004/upload \
  -F "file=@contacts.csv"
```

**Send Messages:**
```bash
curl -X POST http://localhost:3004/send \
  -H "Content-Type: application/json" \
  -d '[{
    "phoneNumber": "79001234567",
    "text": "Hello!"
  }]'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## ⚠️ Disclaimer

This tool is for educational and legitimate business purposes only. Users are responsible for:
- Complying with WhatsApp's Terms of Service
- Following anti-spam regulations
- Obtaining proper consent from message recipients
- Adhering to data protection laws (GDPR, etc.)

Misuse of this tool may result in WhatsApp account suspension or legal consequences.

## 👤 Author

**iws-fn**
- GitHub: [@iws-fn](https://github.com/iws-fn)

## 🌟 Acknowledgments

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - WhatsApp Web API
- [NestJS](https://nestjs.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [Material-UI](https://mui.com/) - UI components

