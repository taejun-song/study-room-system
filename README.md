# Study Room Management System

A comprehensive mobile-first study room management system with role-based access control for Students, Parents, Mentors, and Admins.

## 🚀 Features

### Student App
- ✅ Check-in/out tracking (MOBILE/KIOSK/ADMIN sources)
- 📅 Monthly attendance calendar
- 💬 Q&A booking with mentors
- 📊 Rankings and statistics
- 🚫 Absence request submission (dual-approval workflow)
- ⏱️ Pomodoro timer integration

### Parent App
- 📱 View child's attendance and statistics
- ✅ Approve/reject absence requests
- 📊 Monitor study time by subject

### Mentor App
- 💬 Manage Q&A requests and answer questions
- ✅ Approve/reject absence requests
- 📸 Image upload support for answers

### Admin (Web)
- 🔑 Generate join codes
- 👥 User management
- 📢 Announcements

## 🏗️ Architecture

```
study-room-system/
├── backend/          # Node.js + Express + Prisma + PostgreSQL
├── mobile/           # React Native (Expo) - Student/Parent/Mentor apps
├── admin-web/        # Next.js admin dashboard (placeholder)
└── kiosk-web/        # Kiosk check-in interface (placeholder)
```

## 📦 Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- bcrypt password hashing

**Mobile:**
- React Native (Expo)
- React Navigation
- Axios with auto token refresh
- AsyncStorage

## 🚀 Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Expo Go app on your phone

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Edit DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

Scan QR code with Expo Go app!

## 🔑 Initial Setup

1. Start PostgreSQL
2. Run migrations: `npx prisma migrate dev`
3. Create admin and join codes: `node setup-admin.js`
4. Use join codes to sign up in mobile app

**Default Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

**Default Join Codes:**
- Student: `STUDENT2024`
- Parent: `PARENT2024`
- Mentor: `MENTOR2024`

## 📱 Mobile App

Works on both **Android and iOS**!

- Test on real device: Scan QR code with Expo Go
- Test in browser: Press `w` in terminal

## 🎨 Design

Metallic grey dark theme:
- Background: `#111827`
- Cards: `#1F2937`
- Borders: `#374151`

## 🔐 Authentication

- JWT access tokens (1 hour expiry)
- Refresh tokens (7 days expiry)
- Automatic token refresh on 401 errors
- Join code validation during signup

## 🛣️ API Endpoints

- **Auth**: `/api/auth/*` - Login, signup, refresh
- **Attendance**: `/api/attendance/*` - Check-in, checkout, calendar
- **Absence**: `/api/absence/*` - CRUD, dual-approval workflow
- **Q&A**: `/api/qa/*` - Booking, answering, history
- **Analytics**: `/api/analytics/*` - Rankings, stats, exam scores
- **Messages**: `/api/messages/*` - Threads, messaging
- **Admin**: `/api/admin/*` - Join codes, user management

See [backend/API.md](./backend/API.md) for full documentation.

## 📊 Database Schema

14 models with relationships:
- User (4 roles: STUDENT/PARENT/MENTOR/ADMIN)
- JoinCode
- ParentLink (parent-student relationships)
- MentorProfile
- AttendanceSession (multi-session per day support)
- AbsenceRequest (dual-approval: Mentor + Parent)
- QABooking
- StudyLog
- ExamScore
- MessageThread
- Message
- Announcement
- AuditLog

## 🚧 Roadmap

- [ ] Admin web dashboard
- [ ] Kiosk check-in interface
- [ ] Push notifications
- [ ] Real-time messaging
- [ ] Image upload to cloud storage
- [ ] Export reports (PDF/Excel)
- [ ] Deployment guides

## 📝 License

MIT

## 👨‍💻 Author

Built with Claude Code

---

**Enjoy your Study Room Management System!** 🎉
