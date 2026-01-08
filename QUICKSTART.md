# Quick Start Guide

Get the project running in 5 minutes! ⚡

## Prerequisites Check ✓

```bash
node --version  # Need v18+
npm --version   # Need v8+
mysql --version # Need MySQL v8.0+ or MariaDB v10.5+
```

## Step 1: Clone & Install (2 min)

```bash
# Clone the repo
git clone <repository-url>
cd central-gozolt-api

# Install dependencies
npm install
```

## Step 2: Database Setup (2 min)

```bash
# Create database (MySQL/MariaDB)
mysql -u root -p
CREATE DATABASE central_gozolt_db;
exit

# Copy environment file
cp .env.example .env

# Edit .env and update DATABASE_URL with your credentials
# Example: DATABASE_URL="mysql://root:yourpassword@localhost:3306/central_gozolt_db"
```

## Step 3: Run Migrations (1 min)

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

## Step 4: Start Development 🚀

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Type checking (optional but recommended)
npm run type-check:watch
```

## Verify It Works ✅

```bash
# Test health endpoint
curl http://localhost:3000/health

# Should return: {"status":"ok"}
```

## What's Next?

1. **Import Postman Collection**
   - File: `postman/central-gozolt-api.postman_collection.json`
   - Set `baseUrl` to `http://localhost:3000`

2. **Start Testing APIs**
   - Create a user
   - Get all users
   - Update user
   - Try other endpoints

3. **Read Full Documentation**
   - [README.md](README.md) - Complete setup guide
   - [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) - Development practices

## Troubleshooting 🔧

**Port 3000 already in use?**

```bash
# Change PORT in .env file
PORT=4000
```

**Database connection failed?**

```bash
# Check if MySQL/MariaDB is running
brew services list  # macOS
systemctl status mysql  # Linux (or mariadb)

# Verify DATABASE_URL in .env
```

**Build errors?**

```bash
# Clean install
rm -rf node_modules dist
npm install
npm run build
```

---

**Happy Coding! 🎉**

For detailed information, see [README.md](README.md)
