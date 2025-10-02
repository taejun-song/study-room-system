# Study Room Management - Mobile App

React Native mobile app for students, parents, and mentors.

## Features

### Student App
- ✅ Check-in/Check-out attendance
- ✅ View attendance calendar
- ✅ Submit absence requests
- ✅ Book Q&A sessions with mentors
- ✅ View study rankings and stats
- ✅ Pomodoro timer with subject tracking
- ✅ Message admin

### Parent App
- ✅ View child's attendance
- ✅ Approve/reject absence requests
- ✅ View child's study stats
- ✅ Receive notifications

### Mentor App
- ✅ View Q&A booking requests
- ✅ Accept/answer questions
- ✅ Approve absence requests
- ✅ View student analytics

## Setup

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/         # All screen components
│   ├── components/      # Reusable components
│   ├── navigation/      # Navigation setup
│   ├── services/        # API service
│   ├── contexts/        # Auth context
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── App.tsx              # Main app entry
└── package.json
```

## Environment

Create `.env` file:
```
API_URL=http://localhost:3001/api
```

## Tech Stack

- React Native (Expo)
- TypeScript
- React Navigation
- Axios (API)
- AsyncStorage (local storage)
- React Native Calendar Picker
- Expo Camera & Image Picker
