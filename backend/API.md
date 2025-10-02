# Study Room Management System - API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All authenticated endpoints require the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### POST /auth/signup
Register a new user with join code.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+821012345678",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT",
  "joinCode": "ABC123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+821012345678",
    "role": "STUDENT"
  },
  "accessToken": "jwt_token",
  "refreshToken": "jwt_refresh_token"
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as signup

### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

## Attendance

### POST /attendance/checkin
Check in (Student only).

**Headers:** Authorization required

**Request Body:**
```json
{
  "source": "MOBILE" // or "KIOSK", "ADMIN"
}
```

**Response:**
```json
{
  "message": "Checked in successfully",
  "session": {
    "id": "uuid",
    "startAt": "2025-10-02T08:00:00Z"
  }
}
```

### POST /attendance/checkout
Check out (Student only).

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Checked out successfully",
  "session": {
    "id": "uuid",
    "startAt": "2025-10-02T08:00:00Z",
    "endAt": "2025-10-02T12:00:00Z",
    "durationMinutes": 240
  }
}
```

### GET /attendance/calendar
Get attendance calendar.

**Headers:** Authorization required

**Query Parameters:**
- `studentId` (optional): Student ID (for Parent/Admin/Mentor)
- `from` (optional): Start date (ISO string)
- `to` (optional): End date (ISO string)

**Response:**
```json
{
  "calendar": [
    {
      "date": "2025-10-02",
      "sessions": [
        {
          "id": "uuid",
          "startAt": "2025-10-02T08:00:00Z",
          "endAt": "2025-10-02T12:00:00Z",
          "durationMinutes": 240,
          "source": "MOBILE"
        }
      ],
      "totalMinutes": 240
    }
  ]
}
```

### PUT /attendance/session/:sessionId
Edit attendance session (Admin only).

**Headers:** Authorization required

**Request Body:**
```json
{
  "startAt": "2025-10-02T08:00:00Z",
  "endAt": "2025-10-02T12:00:00Z",
  "notes": "Corrected time"
}
```

## Absence

### POST /absence
Submit absence request (Student only).

**Headers:** Authorization required

**Request Body:**
```json
{
  "date": "2025-10-05",
  "type": "ABSENT", // or "LATE", "EARLY_LEAVE", "OFFSITE"
  "startAt": "2025-10-05T09:00:00Z",
  "endAt": "2025-10-05T18:00:00Z",
  "reasonText": "Doctor appointment",
  "evidenceUrl": "https://storage.com/proof.jpg"
}
```

**Response:**
```json
{
  "message": "Absence request submitted",
  "request": {
    "id": "uuid",
    "status": "PENDING",
    "mentorDecision": "PENDING",
    "parentDecision": "PENDING"
  }
}
```

### GET /absence
Get absence requests.

**Headers:** Authorization required

**Query Parameters:**
- `studentId` (optional): Filter by student
- `status` (optional): Filter by status (PENDING, PARTIAL, APPROVED, REJECTED)

### POST /absence/:requestId/approve
Approve absence request (Mentor/Parent only).

**Headers:** Authorization required

**Request Body:**
```json
{
  "comment": "Approved"
}
```

### POST /absence/:requestId/reject
Reject absence request (Mentor/Parent only).

**Headers:** Authorization required

**Request Body:**
```json
{
  "comment": "Need more information"
}
```

## Q&A

### GET /qa/mentors
Get list of mentors.

**Headers:** Authorization required

**Query Parameters:**
- `subject` (optional): Filter by subject

**Response:**
```json
{
  "mentors": [
    {
      "id": "uuid",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "university": "Seoul National University",
      "major": "Computer Science",
      "bio": "5 years teaching experience",
      "subjects": ["Math", "Physics"],
      "rating": 4.5
    }
  ]
}
```

### POST /qa/book
Book Q&A session (Student only).

**Headers:** Authorization required

**Request Body:**
```json
{
  "mentorId": "uuid",
  "subject": "Math",
  "chapter": "Calculus",
  "summary": "Help with derivatives",
  "images": ["https://storage.com/problem1.jpg"],
  "slotStart": "2025-10-05T14:00:00Z",
  "slotEnd": "2025-10-05T14:30:00Z"
}
```

### POST /qa/:bookingId/accept
Accept Q&A booking (Mentor only).

**Headers:** Authorization required

### POST /qa/:bookingId/answer
Answer Q&A question (Mentor only).

**Headers:** Authorization required

**Request Body:**
```json
{
  "answerText": "Here's the solution...",
  "answerFiles": ["https://storage.com/solution.pdf"]
}
```

### GET /qa/history
Get Q&A history.

**Headers:** Authorization required

**Query Parameters:**
- `subject` (optional)
- `chapter` (optional)

## Analytics

### GET /analytics/ranks/study
Get study time rankings.

**Headers:** Authorization required

**Query Parameters:**
- `period` (optional): "daily", "weekly", or "monthly" (default: "weekly")

**Response:**
```json
{
  "period": "weekly",
  "rankings": [
    {
      "studentId": "uuid",
      "name": "John Doe",
      "totalMinutes": 2400,
      "totalHours": 40,
      "sessionCount": 15
    }
  ]
}
```

### POST /analytics/examscore
Submit exam score (Student only).

**Headers:** Authorization required

**Request Body:**
```json
{
  "examName": "Midterm 2025",
  "examDate": "2025-10-01",
  "subjectScores": {
    "Math": 95,
    "English": 88,
    "Science": 92
  },
  "total": 275,
  "proofUrl": "https://storage.com/exam.jpg"
}
```

### GET /analytics/ranks/exam
Get exam rankings.

**Headers:** Authorization required

**Query Parameters:**
- `examName` (required)

### GET /analytics/stats
Get student statistics.

**Headers:** Authorization required

**Query Parameters:**
- `studentId` (optional): For Parent/Admin/Mentor

**Response:**
```json
{
  "studentId": "uuid",
  "attendance": {
    "totalMinutes": 12000,
    "totalHours": 200,
    "sessionCount": 45
  },
  "pomodoro": {
    "totalMinutes": 3000,
    "totalHours": 50,
    "sessionCount": 120
  },
  "subjectBreakdown": {
    "Math": 1200,
    "English": 900,
    "Science": 900
  }
}
```

### POST /analytics/pomodoro
Log Pomodoro session (Student only).

**Headers:** Authorization required

**Request Body:**
```json
{
  "subject": "Math",
  "chapter": "Algebra",
  "minutes": 25
}
```

## Messages

### POST /messages/thread
Create or get message thread.

**Headers:** Authorization required

### POST /messages/:threadId
Send message.

**Headers:** Authorization required

**Request Body:**
```json
{
  "text": "Hello, I have a question...",
  "attachments": ["https://storage.com/file.pdf"],
  "category": "FACILITY" // or "POLICY", "PAYMENT", "OTHER"
}
```

### GET /messages/:threadId
Get messages in thread.

**Headers:** Authorization required

**Query Parameters:**
- `limit` (optional): Max messages (default: 50)

### GET /messages
Get all threads.

**Headers:** Authorization required

## Admin (Admin only)

### POST /admin/joincode
Create join code.

**Headers:** Authorization required

**Request Body:**
```json
{
  "roleScope": "STUDENT",
  "centerId": "center123",
  "expiresAt": "2025-12-31T23:59:59Z",
  "maxUses": 100
}
```

### GET /admin/joincode
List join codes.

**Headers:** Authorization required

**Query Parameters:**
- `roleScope` (optional)

### POST /admin/link-parent
Link parent to student.

**Headers:** Authorization required

**Request Body:**
```json
{
  "parentId": "uuid",
  "studentId": "uuid"
}
```

### POST /admin/announcement
Create announcement.

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "Holiday Notice",
  "body": "The center will be closed...",
  "pinned": true,
  "audienceScope": ["STUDENT", "PARENT"]
}
```

### GET /admin/announcement
Get announcements (all roles).

**Headers:** Authorization required

### GET /admin/users
List users.

**Headers:** Authorization required

**Query Parameters:**
- `role` (optional)
- `status` (optional)

### PUT /admin/users/:userId/status
Update user status.

**Headers:** Authorization required

**Request Body:**
```json
{
  "status": "ACTIVE" // or "INACTIVE", "SUSPENDED"
}
```

## Error Responses

All endpoints may return these error responses:

```json
{
  "error": "Error message"
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
