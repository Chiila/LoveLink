# LoveLink - Dating App MVP

A modern, full-stack dating application built with Next.js, NestJS, and MySQL.

## Features

- 🔐 **User Authentication** - Secure registration and login with email/password
- 👤 **Profile Management** - Create and edit your dating profile
- 💫 **Discovery** - Browse profiles with swipe-based interaction
- 💕 **Matching** - Match when both users like each other
- 💬 **Messaging** - Chat with your matches
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🔔 **Notifications** - Browser-based notifications for matches and messages

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations for swipe interactions
- **Shadcn/UI** - Beautiful, accessible components

### Backend
- **NestJS** - Scalable Node.js framework
- **TypeScript** - Type-safe API development
- **TypeORM** - Database ORM
- **MySQL** - Relational database
- **JWT** - Secure authentication
- **WebSocket** - Real-time messaging

## Project Structure

```
Dating App/
├── frontend/          # Next.js application
│   ├── app/          # App router pages
│   ├── components/   # Reusable components
│   ├── lib/          # Utilities and API client
│   └── hooks/        # Custom React hooks
├── backend/          # NestJS application
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── users/    # User management
│   │   ├── profiles/ # Profile management
│   │   ├── matches/  # Matching logic
│   │   └── chat/     # Messaging system
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Database Setup

1. Start MySQL server and create the database:
```sql
CREATE DATABASE lovelink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or run the initialization script:
```bash
mysql -u root -p < database/init.sql
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=lovelink
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=3001
```

4. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Quick Start (Both servers)

Open two terminals:

Terminal 1 (Backend):
```bash
cd backend && npm install && npm run start:dev
```

Terminal 2 (Frontend):
```bash
cd frontend && npm install && npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=lovelink
JWT_SECRET=your_jwt_secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users & Profiles
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update profile
- `POST /users/upload-photo` - Upload profile photo

### Discovery & Matching
- `GET /discovery` - Get profiles to discover
- `POST /discovery/swipe` - Like or skip a profile
- `GET /matches` - Get all matches
- `DELETE /matches/:id` - Unmatch a user

### Chat
- `GET /chat/:matchId` - Get messages for a match
- `POST /chat/:matchId` - Send a message
- WebSocket: Real-time message updates

## License

MIT License

