# Development Workflow Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, watch for TypeScript errors
npm run type-check:watch
```

## 📋 Available Scripts

| Script                     | Description                              |
| -------------------------- | ---------------------------------------- |
| `npm run dev`              | Start development server with hot reload |
| `npm run build`            | Build the project for production         |
| `npm start`                | Start production server                  |
| `npm run type-check`       | Check TypeScript types without building  |
| `npm run type-check:watch` | Watch mode for type checking             |
| `npm run lint`             | Run ESLint to check code quality         |
| `npm run lint:fix`         | Auto-fix ESLint issues                   |
| `npm run format`           | Format code with Prettier                |
| `npm run format:check`     | Check if code is formatted               |
| `npm run prisma:generate`  | Generate Prisma Client                   |
| `npm run prisma:migrate`   | Run database migrations                  |
| `npm run prisma:studio`    | Open Prisma Studio                       |

## 🔒 Pre-commit & Pre-push Hooks

This project uses **Husky** to enforce code quality before commits and pushes.

### Pre-commit Hook

Runs automatically before every commit:

- ✅ **Prettier** - Formats all staged files
- ✅ **ESLint** - Checks and auto-fixes code quality issues

### Pre-push Hook

Runs automatically before every push:

- ✅ **Type Check** - Ensures no TypeScript errors
- ✅ **Build** - Ensures the project builds successfully

**This means you cannot commit or push broken code!** 🎯

## 📝 Logging System

### Winston Logger Configuration

The project uses **Winston** for comprehensive logging with different log levels:

| Level   | Color   | When to Use                           |
| ------- | ------- | ------------------------------------- |
| `error` | Red     | Severe errors (500 status codes)      |
| `warn`  | Yellow  | Warning conditions (400 status codes) |
| `info`  | Green   | General informational messages        |
| `http`  | Magenta | HTTP request/response logs            |
| `debug` | White   | Detailed debugging (development only) |

### Log Files

- `logs/error.log` - Contains only error logs
- `logs/all.log` - Contains all logs
- Console output - Color-coded logs for easy reading

### Usage in Code

```typescript
import logger from './utils/logger';

// Different log levels
logger.error('Something went wrong!');
logger.warn('This might be an issue');
logger.info('Server started successfully');
logger.http('GET /api/users 200');
logger.debug('Detailed debugging info');
```

### Request Logging

All HTTP requests are automatically logged with:

- HTTP method
- URL path
- Status code
- Response time

Example:

```
2026-01-08 15:24:32 http: GET /api/users 200 - 45ms
2026-01-08 15:24:35 warn: GET /api/users/999 404 - 12ms
2026-01-08 15:24:38 error: POST /api/users 500 - 102ms
```

## 🎯 Recommended Development Workflow

### 1. Start Development

Open **two terminals**:

**Terminal 1:** Run the dev server

```bash
npm run dev
```

**Terminal 2:** Watch for TypeScript errors

```bash
npm run type-check:watch
```

This way you'll catch errors immediately as you code!

### 2. Before Committing

The pre-commit hook will automatically:

1. Format your code with Prettier
2. Fix ESLint issues
3. Block the commit if there are unfixable errors

**Manual check (optional):**

```bash
npm run format
npm run lint:fix
```

### 3. Before Pushing

The pre-push hook will automatically:

1. Run type checking
2. Build the project
3. Block the push if either fails

**Manual check (optional):**

```bash
npm run type-check
npm run build
```

### 4. Testing API Endpoints

Import the Postman collection:

```
postman/central-gozolt-api.postman_collection.json
```

Set the `baseUrl` variable to your server URL (default: `http://localhost:3000`)

## 🛡️ Code Quality Tools

### TypeScript

- ✅ Strict type checking
- ✅ Catches type errors at compile time
- ✅ Better IDE autocomplete and refactoring

### ESLint

- ✅ Enforces code quality and best practices
- ✅ Catches potential bugs
- ✅ Prevents bad patterns (unused variables, `any` types, etc.)

### Prettier

- ✅ Consistent code formatting
- ✅ No more formatting debates
- ✅ Auto-formats on save (if configured in VS Code)

### Husky + Lint-staged

- ✅ Prevents broken code from being committed
- ✅ Ensures consistent code style across the team
- ✅ Catches errors before they reach CI/CD

## 🔍 Troubleshooting

### Pre-commit hook not running?

```bash
npx husky install
chmod +x .husky/pre-commit
```

### Type errors during build?

Run type-check in watch mode to see errors in real-time:

```bash
npm run type-check:watch
```

### ESLint errors?

Try auto-fixing first:

```bash
npm run lint:fix
```

If errors persist, manually fix them based on the error messages.

## 📦 Dependencies

### Production

- `express` - Web framework
- `@prisma/client` - Database ORM
- `winston` - Logging
- `zod` - Validation
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication (for future use)

### Development

- `typescript` - Type safety
- `tsx` - TypeScript execution
- `eslint` - Code linting
- `prettier` - Code formatting
- `husky` - Git hooks
- `lint-staged` - Run linters on staged files
- `prisma` - Database management

## 🎓 Best Practices

1. **Always run type-check:watch** during development
2. **Never bypass pre-commit hooks** (use `--no-verify` only in emergencies)
3. **Use the logger** instead of `console.log`
4. **Write descriptive commit messages**
5. **Test your changes** before pushing
6. **Keep the Postman collection updated** as you add new endpoints

## 🚨 Important Notes

- **Logs are gitignored** - They won't be committed to the repository
- **Build output (`/dist`) is gitignored** - Generated on deployment
- **Environment variables** - Never commit `.env` file
- **Generated Prisma files** - Automatically generated, don't edit manually

---

**Happy Coding! 🎉**
