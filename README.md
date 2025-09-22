# Authentication & User Management System

A modern, full-stack authentication and user management system built with Next.js, TypeScript, and RESTful API architecture. Features role-based access control, JWT authentication, and comprehensive admin panel.

## 🚀 Features

- **Authentication System**
  - User registration and login
  - JWT token-based authentication
  - Automatic token refresh
  - Password reset functionality
  - Secure cookie management

- **Role-Based Access Control**
  - Three user roles: Admin, Manager, User
  - Protected routes based on user roles
  - Role-specific dashboards and permissions

- **Admin Panel**
  - Complete user management (CRUD operations)
  - User role assignment
  - Real-time user status monitoring
  - Bulk operations support

- **Modern Tech Stack**
  - Next.js 14 with App Router
  - TypeScript for type safety
  - Tailwind CSS for styling
  - RESTful API architecture
  - Responsive design

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/auth-user-management.git
cd auth-user-management
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
API_BASE_URL=http://localhost:3001/api

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration (if applicable)
DATABASE_URL=your-database-connection-string

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 4. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── admin/             # Admin panel pages
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboards
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   │   ├── auth/              # Authentication components
│   │   ├── ui/                # UI components
│   │   └── layout/            # Layout components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── api-client.ts      # API client configuration
│   │   └── utils.ts           # Helper functions
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global styles
├── public/                    # Static assets
├── docs/                      # Documentation
└── tests/                     # Test files
```

## 🔌 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "message": "User registered successfully"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "expiresIn": 86400
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer jwt_access_token
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "newSecurePassword123"
}
```

### User Management Endpoints

#### Get Current User
```http
GET /user/me
Authorization: Bearer jwt_access_token
```

#### Update User Profile
```http
PUT /user/profile
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### Get User Dashboard
```http
GET /user/dashboard
Authorization: Bearer jwt_access_token
```

### Admin Endpoints

#### Get All Users
```http
GET /admin/users?page=1&limit=10&role=user
Authorization: Bearer admin_jwt_token
```

#### Create User
```http
POST /admin/users
Authorization: Bearer admin_jwt_token
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "New User",
  "role": "user"
}
```

#### Update User
```http
PUT /admin/users/:id
Authorization: Bearer admin_jwt_token
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "manager"
}
```

#### Delete User
```http
DELETE /admin/users/:id
Authorization: Bearer admin_jwt_token
```

#### Get Admin Dashboard
```http
GET /admin/dashboard
Authorization: Bearer admin_jwt_token
```

### Manager Endpoints

#### Get Reports
```http
GET /manager/reports?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer manager_jwt_token
```

#### Get Manager Dashboard
```http
GET /manager/dashboard
Authorization: Bearer manager_jwt_token
```

### Utility Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## 🔒 Authentication Flow

1. **Registration/Login**: User provides credentials
2. **Token Generation**: Server generates JWT access and refresh tokens
3. **Token Storage**: Tokens stored in secure HTTP-only cookies
4. **Request Authorization**: Access token sent in Authorization header
5. **Token Refresh**: Automatic refresh when access token expires
6. **Logout**: Tokens cleared from cookies and server-side blacklist

## 👥 User Roles & Permissions

### User (Default Role)
- Access to personal dashboard
- Update own profile
- View own data

### Manager
- All user permissions
- Access to reports
- Manager dashboard
- View team data

### Admin
- All manager permissions
- User management (CRUD)
- Role assignment
- System administration
- Admin dashboard

## 🧪 Testing

### Run Tests
```bash
npm run test
# or
yarn test
```

### Run Tests with Coverage
```bash
npm run test:coverage
# or
yarn test:coverage
```

### Run E2E Tests
```bash
npm run test:e2e
# or
yarn test:e2e
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
# or
yarn build
```

### Start Production Server
```bash
npm start
# or
yarn start
```

### Deploy to Vercel
```bash
npx vercel --prod
```

### Deploy to Netlify
```bash
npm run build
npx netlify deploy --prod --dir=out
```

## 📝 Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - Invalid or expired token
- `FORBIDDEN` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid input data
- `USER_NOT_FOUND` - User doesn't exist
- `EMAIL_ALREADY_EXISTS` - Email already registered

## 🛡️ Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt
- **CORS Protection** for API endpoints
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **Secure Headers** implementation
- **Cookie Security** with HttpOnly and SameSite flags

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation for API changes
- Follow the existing code style
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@JakaJunaedi](https://github.com/JakaJunaedi)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: jackone210@gmail.com.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [JWT](https://jwt.io/) for secure authentication

## 📊 Project Status

- ✅ Authentication system
- ✅ User management
- ✅ Role-based access control
- ✅ Admin panel
- 🚧 Advanced reporting (In Progress)
- 📋 Mobile app (Planned)

## 🐛 Known Issues

- None currently reported

## 🔄 Changelog

### v1.0.0 (2024-01-15)
- Initial release
- Basic authentication system
- User management functionality
- Admin panel implementation

---

⭐ If you find this project helpful, please give it a star on GitHub!