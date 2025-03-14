# Node.js Express PostgreSQL API Boilerplate

A production-ready RESTful API boilerplate built with Node.js, Express, and Sequelize ORM for PostgreSQL. This project provides a solid foundation for building scalable and maintainable backend applications.

## Features

- **SQL Database**: [PostgreSQL](https://www.postgresql.org/) integration using [Sequelize](https://sequelize.org/) ORM
- **Advanced Authentication**:
  - JWT-based authentication
  - Multi-factor authentication with OTP
  - Email verification
  - Phone number verification
  - Password reset with OTP verification
  - Multiple authentication methods (email/password, phone/password, phone/OTP)
- **Validation**: Request data validation using [Joi](https://github.com/hapijs/joi)
- **Logging**: Using [Winston](https://github.com/winstonjs/winston) for application logging
- **API Documentation**: Auto-generated using [Swagger/OpenAPI](https://swagger.io/)
- **Error Handling**: Centralized error handling mechanism
- **Security**: Set security HTTP headers using [Helmet](https://helmetjs.github.io)
- **Sanitizing**: Sanitize request data against XSS and query injection
- **CORS**: Cross-Origin Resource-Sharing enabled using [CORS](https://github.com/expressjs/cors)
- **Compression**: Gzip compression with [compression](https://github.com/expressjs/compression)
- **Linting**: With ESLint and Prettier
- **Testing**: Unit and integration tests using Jest
- **Environment variables**: Using dotenv and cross-env
- **Docker support**: Development and production Docker configurations

## Quick Start

### Prerequisites

- Node.js (v12 or higher)
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-folder>
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env file to match your configuration
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The server will start at http://localhost:3000 (or the port specified in your .env file).

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Node environment
NODE_ENV=development

# Port number
PORT=3000

# Database
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=database_name
DB_PORT=5432

# JWT
JWT_SECRET=thisisasamplesecret
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10

# SMTP configuration for email service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=email-server-username
SMTP_PASSWORD=email-server-password
EMAIL_FROM=support@yourapp.com

# Client URL for email links
CLIENT_URL=http://localhost:3000

# SMS service configuration
SMS_API_KEY=your-sms-api-key
```

## Project Structure

```
src\
 |--config\         # Environment variables and configuration
 |--controllers\    # Route controllers (controller layer)
 |--docs\           # Swagger documentation
 |--middlewares\    # Custom express middlewares
 |--models\         # Sequelize models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--index.js        # App entry point
```

## API Documentation

To view the list of available APIs and their specifications, run the server and go to `http://localhost:3000/v1/docs` in your browser. The documentation is automatically generated using the Swagger definitions in the route files.

## Authentication

The authentication system supports multiple methods:

### Email Authentication

- Register with email and verify via email link
- Login with email/password
- Login with email OTP

### Phone Authentication

- Register with phone number and password
- Register with phone number and OTP
- Login with phone/password
- Login with phone OTP

### Password Reset

- Request password reset via email (with OTP)
- Verify email and OTP
- Set new password with token

### Tokens

- JWT-based authentication tokens
- Access and refresh token mechanism
- Token blacklisting

## Authorization

The API uses role-based access control. By default, the following roles are available:

- User
- Admin

Middleware functions are provided to restrict access to endpoints based on user roles.

## Commands

Running locally:

```bash
# Run in development mode
npm run dev
# or
yarn dev

# Run in production mode
npm start
# or
yarn start
```

Testing:

```bash
# Run all tests
npm test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch

# Generate test coverage reports
npm run coverage
# or
yarn coverage
```

Linting:

```bash
# Run ESLint
npm run lint
# or
yarn lint

# Fix ESLint errors
npm run lint:fix
# or
yarn lint:fix

# Run Prettier
npm run prettier
# or
yarn prettier

# Fix Prettier errors
npm run prettier:fix
# or
yarn prettier:fix
```

Docker:

```bash
# Run with Docker in development mode
npm run docker:dev
# or
yarn docker:dev

# Run with Docker in production mode
npm run docker:prod
# or
yarn docker:prod

# Run tests in Docker
npm run docker:test
# or
yarn docker:test
```

## Error Handling

The app has a centralized error handling mechanism using express middleware.

Controllers should try to catch errors and forward them to the error handling middleware using the `next(error)` function. For convenience, you can wrap the controller inside the `catchAsync` utility.

```javascript
const catchAsync = require('../utils/catchAsync');

const controller = catchAsync(async (req, res) => {
  // Your controller logic
  // If an error occurs, catchAsync will forward it to the error middleware
});
```

The error handling middleware sends an error response with relevant HTTP status code and error message.

## Validation

Request data is validated using Joi. Validation schemas are defined in the `src/validations` directory and used in the routes using middleware.

```javascript
const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.post('/users', validate(userValidation.createUser), userController.createUser);
```

## Logging

The app uses winston for logging. Logs are stored in `logs/` directory (in production) and also shown in the console (in development).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
