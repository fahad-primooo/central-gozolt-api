# Central Gozolt API

A robust Node.js REST API built with Express, TypeScript, Prisma, and PostgreSQL for user management and authentication.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development Workflow](#development-workflow)
- [Code Quality](#code-quality)
- [Logging](#logging)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- ✅ User management (CRUD operations)
- ✅ Input validation with Zod
- ✅ Comprehensive logging with Winston
- ✅ Type-safe database operations with Prisma
- ✅ TypeScript for type safety
- ✅ ESLint + Prettier for code quality
- ✅ Pre-commit and pre-push hooks
- ✅ Email verification system
- 🔜 JWT authentication (coming soon)
- 🔜 Password hashing with bcrypt (coming soon)

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express 5.x
- **Database:** MySQL/MariaDB
- **ORM:** Prisma
- **Validation:** Zod
- **Logging:** Winston
- **Code Quality:** ESLint, Prettier
- **Git Hooks:** Husky, lint-staged

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MySQL/MariaDB** (v8.0+ / v10.5+) - [Download MySQL](https://dev.mysql.com/downloads/) or [MariaDB](https://mariadb.org/download/)
- **Git** - [Download](https://git-scm.com/)

Check your installations:

```bash
node --version  # Should be v18+
npm --version   # Should be v8+
mysql --version # Should be v8.0+ or mariadb --version
git --version   # Should be v2+
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd central-gozolt-api
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies and set up Husky git hooks automatically.

## 🔧 Environment Setup

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

If `.env.example` doesn't exist, create a `.env` file with the following:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/central_gozolt_db"

# JWT Configuration (for future authentication)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d
```

### 2. Update Database URL

Replace the database credentials in the `DATABASE_URL`:

```env
DATABASE_URL="mysql://YOUR_USERNAME:YOUR_PASSWORD@localhost:3306/central_gozolt_db"
```

**Example:**

```env
DATABASE_URL="mysql://root:mypassword@localhost:3306/central_gozolt_db"
```

## 🗄️ Database Setup

### 1. Create the Database

**For MySQL/MariaDB:**

```bash
# Connect to MySQL/MariaDB
mysql -u root -p

# Create database
CREATE DATABASE central_gozolt_db;

# Exit
exit
```

### 2. Run Migrations

Generate Prisma Client and run migrations:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

This will create all necessary tables in your database.

### 3. Verify Database Setup (Optional)

Open Prisma Studio to view your database:

```bash
npm run prisma:studio
```

This opens a visual database browser at `http://localhost:5555`

## 🏃 Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The server will start at `http://localhost:3000` (or your configured PORT)

**Recommended:** Open a second terminal for type checking:

```bash
npm run type-check:watch
```

This catches TypeScript errors in real-time as you code!

### Production Mode

Build and start the production server:

```bash
# Build the project
npm run build

# Start production server
npm start
```

### Verify Installation

Test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{ "status": "ok" }
```

## 📁 Project Structure

```
central-gozolt-api/
├── src/
│   ├── app.ts                    # Express app configuration
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   └── env.ts                # Environment variables
│   ├── middlewares/
│   │   ├── error.middleware.ts   # Global error handler
│   │   ├── logger.middleware.ts  # Request logging
│   │   └── validate.middleware.ts # Zod validation
│   ├── modules/
│   │   └── user/
│   │       ├── user.controller.ts # User controllers
│   │       ├── user.routes.ts     # User routes
│   │       ├── user.service.ts    # User business logic
│   │       └── user.validation.ts # User validation schemas
│   ├── utils/
│   │   ├── ApiError.ts           # Custom error class
│   │   ├── asyncHandler.ts       # Async error wrapper
│   │   └── logger.ts             # Winston logger config
│   └── types/                    # TypeScript type definitions
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── postman/
│   └── central-gozolt-api.postman_collection.json # API collection
├── logs/                         # Log files (gitignored)
├── dist/                         # Compiled JavaScript (gitignored)
├── .husky/                       # Git hooks
├── .env                          # Environment variables (gitignored)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.js              # ESLint configuration
└── DEVELOPMENT_WORKFLOW.md       # Detailed workflow guide
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Available Endpoints

#### **Health Check**

```
GET /health
```

Returns server status.

#### **User Endpoints**

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| POST   | `/api/users`                    | Create a new user         |
| GET    | `/api/users`                    | Get all users (paginated) |
| GET    | `/api/users/:id`                | Get user by ID            |
| GET    | `/api/users/email/:email`       | Get user by email         |
| GET    | `/api/users/username/:username` | Get user by username      |
| PATCH  | `/api/users/:id`                | Update user               |
| DELETE | `/api/users/:id`                | Delete user (soft/hard)   |
| POST   | `/api/users/:id/verify-email`   | Verify user email         |

### Using Postman

1. Import the collection from `postman/central-gozolt-api.postman_collection.json`
2. Set the `baseUrl` variable to `http://localhost:3000`
3. Start testing!

### Example Request

**Create User:**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe123",
    "email": "john.doe@example.com",
    "countryCode": "+1",
    "phoneNumber": "1234567890",
    "password": "SecurePass123",
    "bio": "Software developer"
  }'
```

## 🔄 Development Workflow

### Daily Development

1. **Start development server:**

   ```bash
   npm run dev
   ```

2. **Start type-check watcher (in another terminal):**

   ```bash
   npm run type-check:watch
   ```

3. **Make your changes**

4. **Commit your code:**

   ```bash
   git add .
   git commit -m "Your descriptive message"
   ```

   - Pre-commit hook automatically runs Prettier and ESLint
   - Commit is blocked if there are unfixable errors

5. **Push your changes:**
   ```bash
   git push
   ```

   - Pre-push hook runs type-check and build
   - Push is blocked if either fails

For detailed workflow information, see [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)

## 🧪 Available Scripts

| Command                        | Description                              |
| ------------------------------ | ---------------------------------------- |
| `npm run dev`                  | Start development server with hot reload |
| `npm run build`                | Build for production                     |
| `npm start`                    | Start production server                  |
| `npm run type-check`           | Check TypeScript types                   |
| `npm run type-check:watch`     | Watch TypeScript types                   |
| `npm run lint`                 | Run ESLint                               |
| `npm run lint:fix`             | Fix ESLint issues                        |
| `npm run format`               | Format code with Prettier                |
| `npm run format:check`         | Check code formatting                    |
| `npm run prisma:generate`      | Generate Prisma Client                   |
| `npm run prisma:migrate`       | Run database migrations                  |
| `npm run prisma:studio`        | Open Prisma Studio                       |
| `npm run prisma:migrate:reset` | Reset database and migrations            |

## ✅ Code Quality

### Automated Checks

This project uses automated tools to maintain code quality:

- **TypeScript** - Type safety and compile-time error checking
- **ESLint** - Code quality and best practices
- **Prettier** - Consistent code formatting
- **Husky** - Git hooks to enforce quality

### Pre-commit Hook

Before each commit, the following runs automatically:

- ✅ Prettier formats all staged files
- ✅ ESLint checks and auto-fixes code
- ❌ Blocks commit if unfixable errors exist

### Pre-push Hook

Before each push, the following runs automatically:

- ✅ TypeScript type checking
- ✅ Build verification
- ❌ Blocks push if either fails

**You cannot commit or push broken code!** This ensures code quality across the team.

## 📝 Logging

The application uses Winston for comprehensive logging.

### Log Levels

| Level | Color   | Use Case             |
| ----- | ------- | -------------------- |
| error | Red     | Server errors (500s) |
| warn  | Yellow  | Client errors (400s) |
| info  | Green   | General information  |
| http  | Magenta | HTTP requests        |
| debug | White   | Debugging (dev only) |

### Log Files

- `logs/error.log` - Error logs only
- `logs/all.log` - All logs

### Using Logger in Code

```typescript
import logger from './utils/logger';

logger.info('User created successfully');
logger.warn('Invalid email format');
logger.error('Database connection failed');
logger.debug('Processing user data...');
```

### Request Logging

All HTTP requests are automatically logged:

```
2026-01-08 15:24:32 http: GET /api/users 200 - 45ms
2026-01-08 15:24:35 warn: GET /api/users/999 404 - 12ms
```

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Ensure all tests pass and code quality checks pass
6. Commit your changes: `git commit -m "Add some feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

### Commit Message Convention

Use clear, descriptive commit messages:

```
feat: Add user authentication endpoint
fix: Resolve database connection issue
docs: Update API documentation
refactor: Improve error handling
test: Add unit tests for user service
chore: Update dependencies
```

### Code Style

- Follow the existing code style
- Use TypeScript types, avoid `any`
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

Or change the port in `.env`:

```env
PORT=4000
```

### Database Connection Failed

1. Verify MySQL/MariaDB is running:

   ```bash
   # macOS
   brew services list

   # Linux
   systemctl status mysql
   # or
   systemctl status mariadb
   ```

2. Check database credentials in `.env`
3. Ensure database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

### Prisma Issues

Reset and regenerate:

```bash
npm run prisma:generate
npm run prisma:migrate:reset
```

### Build Errors

Clear build cache and rebuild:

```bash
rm -rf dist node_modules
npm install
npm run build
```

### Git Hooks Not Working

Reinstall Husky:

```bash
npx husky install
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

## 📞 Support

For issues and questions:

1. Check the [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) guide
2. Review existing GitHub issues
3. Create a new issue with detailed information

## 📄 License

ISC

---

**Built with ❤️ using TypeScript, Express, and Prisma**
