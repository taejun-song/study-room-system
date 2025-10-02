# Quick Start Guide - Study Room Management System

## 🚀 Get Everything Running in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Expo Go app on your phone (iOS/Android)

---

## Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd study-room-system/backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'ENVFILE'
DATABASE_URL="postgresql://postgres:password@localhost:5432/study_room_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
NODE_ENV="development"
ENVFILE

# Create database
createdb study_room_db

# Run migrations
npx prisma migrate dev --name init

# Start backend server
npm run dev
```

Backend should now be running at `http://localhost:3001`

Test it: `curl http://localhost:3001/health`

---

## Step 2: Create Admin & Join Codes (1 minute)

Since we need join codes to sign up, let's create an admin user directly in the database:

```bash
# Open Prisma Studio
npx prisma studio
```

1. Click on `User` table
2. Add a new record:
   - `role`: ADMIN
   - `name`: Admin
   - `email`: admin@example.com
   - `phone`: +821012345678
   - `passwordHash`: Use this bcrypt hash for password "admin123":
     ```
     $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfKrCRPpT6
     ```
   - `status`: ACTIVE

3. Save the record

4. Now login via API to create join codes:

```bash
# Login as admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Copy the accessToken from response

# Create a student join code
curl -X POST http://localhost:3001/api/admin/joincode \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"roleScope":"STUDENT","maxUses":100}'

# Copy the generated code (e.g., "A1B2C3D4")
```

---

## Step 3: Mobile App Setup (2 minutes)

```bash
# Navigate to mobile app
cd ../mobile

# Install dependencies
npm install

# Update API URL (only if backend is NOT on localhost:3001)
# Edit src/services/api.ts and change API_URL

# Start Expo
npx expo start
```

---

## Step 4: Run on Your Phone

1. Open **Expo Go** app on your phone
2. Scan the QR code from the terminal
3. App will load on your phone!

---

## Step 5: Sign Up & Test

1. On the app, tap **"Don't have an account? Sign up"**
2. Fill in:
   - Name: Your Name
   - Phone: +821012345678
   - Email: student@example.com
   - Password: student123
   - Role: Student
   - Join Code: (paste the code from Step 2)
3. Tap **"Create Account"**
4. You're in! Try:
   - ✅ Check-in button
   - 📅 View calendar
   - 📊 View stats
   - 💬 Browse mentors

---

## 🎉 You're All Set!

### What You Can Do Now:

**As Student:**
- Check-in/out
- View attendance calendar
- Request absence
- Book Q&A with mentors
- View rankings & stats

**Create More Users:**
Repeat Step 2 to create join codes for:
- `PARENT` role
- `MENTOR` role

Then sign up via the mobile app!

---

## 🐛 Troubleshooting

**Backend won't start:**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check if database exists
psql -U postgres -l | grep study_room_db
```

**Mobile app can't connect:**
```bash
# If running on real device, use your computer's IP
# Edit src/services/api.ts:
const API_URL = 'http://192.168.1.100:3001/api';  # Your computer's IP
```

**Reset everything:**
```bash
cd backend
npx prisma migrate reset  # Deletes all data!
```

---

## 📱 Screens Available

### Student App (✅ Complete)
- 🏠 Home (Check-in/out, Quick Actions)
- 📅 Attendance Calendar
- 💬 Q&A (Mentor List, Bookings)
- 📊 Rankings & Stats
- 🚫 Absence Requests

### Parent/Mentor Apps (🚧 Coming Soon)
- Placeholder screens ready
- Full implementation pending

---

## 🔧 Useful Commands

```bash
# Backend
npm run dev              # Start dev server
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run migrations

# Mobile
npx expo start           # Start Expo
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator
npx expo start --clear   # Clear cache
```

---

## 📚 Next Steps

1. **Test the full flow**: Sign up → Check-in → Request absence
2. **Create mentor account**: Use mentor join code
3. **Book a Q&A session**: As student, book with a mentor
4. **Build Parent/Mentor screens**: See remaining todos
5. **Add push notifications**: Firebase setup
6. **Deploy backend**: Heroku, Railway, or DigitalOcean
7. **Build APK/IPA**: For distribution

---

Enjoy your Study Room Management System! 🚀
