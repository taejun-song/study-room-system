# Study Room Management System - Backend API

Node.js + TypeScript + Express + PostgreSQL + Prisma backend for the study room management system.

## Features

- ✅ JWT-based authentication with join codes
- ✅ Multi-role system (Admin, Student, Parent, Mentor)
- ✅ Multi-session attendance tracking
- ✅ Dual-approval absence workflow
- ✅ Q&A booking system
- ✅ Study analytics and rankings
- ✅ Real-time messaging
- ✅ Pomodoro timer integration

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env` and update with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/study_room_db?schema=public"
JWT_SECRET="your-secret-key"
PORT=3001
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (optional)
npm run prisma:studio
```

### 4. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user with join code
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/calendar` - Get attendance calendar

### Absence
- `POST /api/absence` - Submit absence request
- `POST /api/absence/:id/approve` - Approve absence (mentor/parent)
- `POST /api/absence/:id/reject` - Reject absence (mentor/parent)
- `GET /api/absence` - Get absence requests

### Q&A
- `GET /api/mentors` - List mentors
- `POST /api/qa/book` - Book Q&A session
- `POST /api/qa/:id/accept` - Accept booking (mentor)
- `POST /api/qa/:id/answer` - Answer question (mentor)
- `GET /api/qa/history` - Get Q&A history

### Analytics
- `GET /api/ranks/study` - Get study time rankings
- `POST /api/examscore` - Submit exam score

### Messages
- `POST /api/messages/thread` - Create thread
- `POST /api/messages/:threadId` - Send message
- `GET /api/messages/:threadId` - Get messages

## Database Schema

See `prisma/schema.prisma` for complete schema.

Key models:
- User
- JoinCode
- ParentLink
- MentorProfile
- AttendanceSession
- AbsenceRequest
- QABooking
- StudyLog
- ExamScore
- MessageThread
- Announcement

## Scripts

- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
