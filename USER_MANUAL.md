# Study Room Management System - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Admin Guide](#admin-guide)
3. [Student Guide](#student-guide)
4. [Mentor Guide](#mentor-guide)
5. [Parent Guide](#parent-guide)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Test Accounts

For testing purposes, the following accounts are pre-configured:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Student | student@test.com | test123 |
| Mentor | mentor@test.com | test123 |
| Parent | parent@test.com | test123 |

### Join Codes

When creating new accounts, you'll need a join code for the specific role:

| Role | Join Code |
|------|-----------|
| Student | STUDENT01 |
| Mentor | MENTOR01 |
| Parent | PARENT01 |

### Sign Up Process

1. Open the app and tap **"Sign up"**
2. Fill in your information:
   - Full Name
   - Phone Number
   - Email Address
   - Password (minimum 6 characters)
   - Confirm Password
3. Select your **Role** from the dropdown
4. Enter the appropriate **Join Code** for your role
5. Tap **"Create Account"**

### Login Process

1. Open the app
2. Enter your **Email** and **Password**
3. Tap **"Sign in"**

---

## Admin Guide

### Overview
As an Admin, you manage the entire system including user assignments and system configuration.

### Main Features

#### 1. User Management (Student Assignments)

**Purpose**: Link students with their mentors and parents for the absence approval workflow.

**How to Access**:
1. Login as Admin
2. Tap on **"👥 User Management"** card

**Assign a Mentor to a Student**:
1. Select a **Student** from the dropdown
2. View current assignments (if any)
3. In the **"Assign Mentor"** section, select a mentor from the dropdown
4. Tap **"Assign Mentor"** button
5. Confirmation will appear when successful

**Link a Parent to a Student**:
1. Select a **Student** from the dropdown
2. View current linked parents
3. In the **"Link Parent"** section, select a parent from the dropdown
4. Tap **"Link Parent"** button
5. Confirmation will appear when successful

**Important Notes**:
- Each student can have ONE assigned mentor
- Each student can have MULTIPLE linked parents
- Both mentor AND parent approval are required for absence requests
- Students must be linked before they can submit absence requests that require approval

### System Workflow Setup

**Required Setup for Absence Approval System**:
1. Create or have existing Student, Mentor, and Parent accounts
2. Assign the mentor to the student (one mentor per student)
3. Link parent(s) to the student (can link multiple parents)
4. Now the student can submit absence requests that require dual approval

---

## Student Guide

### Overview
As a Student, you can track attendance, submit absence requests, book Q&A sessions with mentors, and view your statistics.

### Main Features

#### 1. Home Screen

**Check In/Out**:
1. Tap **"Check In"** button when you arrive at the study room
2. The button will change to **"✓ Check Out"** with green background
3. Tap **"Check Out"** when you leave
4. Your study hours are automatically tracked

**View Statistics**:
- **Study Hours**: Total attendance hours
- **Sessions**: Number of check-in sessions
- **Pomodoro**: Focus session hours
- **Focus Sessions**: Number of pomodoro sessions

**Quick Actions**:
- **View Calendar**: See attendance history
- **Book Q&A**: Schedule mentor sessions
- **Submit Absence**: Request leave or early exit
- **Rankings & Stats**: View leaderboards

#### 2. Calendar (Attendance)

**View Attendance History**:
1. Navigate to **"Calendar"** tab
2. Swipe left/right to change months
3. View your attendance sessions by day
4. Each session shows:
   - Start time and end time
   - Duration
   - Source (Mobile, Kiosk, or Admin)

#### 3. Q&A Sessions

**Find Mentors**:
1. Navigate to **"Q&A"** tab
2. Tap **"Find Mentors"** section
3. Search by subject (optional)
4. View available mentors with:
   - Name and university
   - Rating
   - Subjects they teach
   - Bio

**Book a Q&A Session**:
1. Find a mentor and tap **"Book Session"**
2. Fill in session details (feature in development)
3. Submit booking request
4. Wait for mentor approval

**View Your Bookings**:
1. Navigate to **"Q&A"** tab
2. Tap **"My Bookings"** section
3. See all your Q&A sessions with status:
   - **REQUESTED**: Waiting for mentor
   - **ACCEPTED**: Mentor approved
   - **COMPLETED**: Session finished
   - **CANCELLED**: Session cancelled

#### 4. Absence Requests

**Submit an Absence Request**:
1. Navigate to **"Absence"** tab
2. Tap **"+ New Request"** button
3. Select **Type**:
   - Absent (All Day)
   - Late Arrival
   - Early Leave
   - Off-site
4. Enter the **Date**
5. Provide a **Reason** for your absence
6. Tap **"Submit Request"**

**View Request Status**:
- Requests appear in the list with status badges:
  - **PENDING**: Awaiting approval (gray)
  - **PARTIAL**: One approval received (orange)
  - **APPROVED**: Both mentor and parent approved (green)
  - **REJECTED**: Request denied (red)

**Understanding Approval Process**:
- Your request needs **TWO approvals**:
  1. Your assigned **Mentor** must approve
  2. Your linked **Parent** must approve
- Both must approve for the request to be fully approved
- If either rejects, the request is rejected

**View Approval Details**:
- Each request shows:
  - **Mentor**: Decision and comment
  - **Parent**: Decision and comment
- You can see who approved/rejected and their feedback

#### 5. Stats & Rankings

**View Your Performance**:
1. Navigate to **"Stats"** tab
2. See your rankings:
   - **Attendance Rank**: Based on study hours
   - **Pomodoro Rank**: Based on focus sessions
3. View leaderboards
4. Track your progress

---

## Mentor Guide

### Overview
As a Mentor, you manage Q&A sessions with students and approve absence requests for your assigned students.

### Main Features

#### 1. Dashboard

**View Overview**:
- See summary of your mentoring activities
- Quick access to pending Q&A requests
- View recent activity

#### 2. Q&A Management

**View Q&A Requests**:
1. Navigate to **"Q&A"** tab
2. See all requests from students
3. Filter by status:
   - All requests
   - Pending requests
   - Accepted sessions

**Accept a Q&A Request**:
1. Find the request in the list
2. Tap **"Accept"** button
3. Confirmation appears

**Provide Answer/Complete Session**:
1. Find the accepted session
2. Enter your answer or solution
3. Attach files if needed (optional)
4. Submit to mark as completed

#### 3. Absence Approval

**View Absence Requests**:
1. Navigate to **"Approvals"** tab
2. See all requests from your **assigned students only**
3. Each request shows:
   - Student name
   - Type of absence
   - Date
   - Reason
   - Current approval status

**Approve an Absence Request**:
1. Review the request details
2. Tap **"Approve"** button
3. Add a comment (optional)
4. Confirm approval
5. Student and parent will be notified

**Reject an Absence Request**:
1. Review the request details
2. Tap **"Reject"** button
3. **Provide a reason** for rejection (required)
4. Confirm rejection
5. Request is marked as rejected

**Important Notes**:
- You can only approve/reject requests from students **assigned to you**
- Both you and the parent must approve for full approval
- Your decision is final and cannot be changed
- Always provide constructive feedback in comments

---

## Parent Guide

### Overview
As a Parent, you can monitor your child's attendance, study hours, and approve absence requests.

### Main Features

#### 1. Dashboard

**View Your Children**:
- The dashboard automatically loads your linked children
- Select a child to view their information
- See their recent activity and statistics

**Monitor Attendance**:
- View recent attendance sessions
- See check-in and check-out times
- Track study hours

**View Statistics**:
- Total study hours
- Attendance sessions
- Pomodoro sessions
- Recent Q&A bookings

#### 2. Absence Approval

**View Absence Requests**:
1. Navigate to **"Approvals"** tab
2. See all requests from your **linked children only**
3. Requests are filtered to show those **pending your approval**
4. Each request shows:
   - Child's name
   - Type of absence
   - Date and time
   - Reason
   - Mentor's decision (if made)

**Approve an Absence Request**:
1. Review the request carefully
2. Check the reason provided
3. Tap **"Approve"** button
4. Add a comment (optional but recommended)
5. Confirm approval
6. Your child will be notified

**Reject an Absence Request**:
1. Review the request details
2. Tap **"Reject"** button
3. **Provide a reason** for rejection (required)
4. Confirm rejection
5. Request is marked as rejected

**Understanding Dual Approval**:
- Absence requests require **both mentor and parent approval**
- You'll see the mentor's decision when viewing the request
- If either you or the mentor rejects, the request is rejected
- Both must approve for the student to get approval

**Important Notes**:
- You can only approve requests from children **linked to your account**
- If you don't see any requests, ask the admin to link your account to your child
- Your decision is important for your child's attendance record
- Always communicate with your child about absence patterns

---

## Troubleshooting

### Common Issues and Solutions

#### "Invalid or expired token" Error
**Solution**:
- Logout and login again
- Your session may have expired

#### "User already exists" when signing up
**Solution**:
- Use a different email address
- Each email can only be used once
- Contact admin if you forgot your password

#### "Invalid join code" when signing up
**Solution**:
- Double-check the join code
- Make sure you're using the code for the correct role
- Join codes are case-sensitive
- Contact admin for current valid codes

#### Parent: "No absence requests" showing
**Possible Causes**:
1. No students are linked to your parent account
2. Student hasn't submitted any absence requests
3. All requests have been processed

**Solution**:
- Contact admin to verify student linking
- Ask your child if they've submitted requests
- Check that you're using the correct parent account

#### Mentor: "No absence requests" showing
**Possible Causes**:
1. No students are assigned to you
2. Assigned students haven't submitted requests
3. All requests have been processed

**Solution**:
- Contact admin to verify student assignment
- Wait for students to submit requests

#### Password field highlighted/can't type on iPhone
**Solution**:
- This occurs when iOS suggests a password
- Dismiss the suggestion popup
- Tap on the password field again
- You should now be able to type

#### Can't see mentors in Q&A list (Student)
**Possible Causes**:
1. No mentors have been created
2. Mentors don't have profile data
3. Network connection issues

**Solution**:
- Pull down to refresh the list
- Check internet connection
- Contact admin to verify mentor accounts exist

#### Buttons not working (Any screen)
**Solution**:
- Pull down to refresh the screen
- Close and reopen the app
- Check for app updates

### Getting Help

If you encounter issues not covered in this manual:

1. **Check your internet connection**
2. **Reload the app** (pull down to refresh)
3. **Logout and login again**
4. **Contact the system administrator**

---

## System Requirements

### Mobile App
- iOS 13.0 or later
- Android 6.0 or later
- Active internet connection
- Camera access (for QR code scanning, if implemented)

### Network
- Wi-Fi or mobile data connection
- Stable internet for real-time updates

---

## Data Privacy

- All user data is stored securely
- Passwords are encrypted
- Only authorized users can access specific data
- Parents can only see their linked children's data
- Mentors can only see their assigned students' data
- Students can only see their own data

---

## Best Practices

### For Students
- ✅ Check in as soon as you arrive
- ✅ Don't forget to check out when leaving
- ✅ Submit absence requests in advance when possible
- ✅ Provide clear reasons for absences
- ✅ Book Q&A sessions ahead of time
- ✅ Be respectful in all communications

### For Mentors
- ✅ Review Q&A requests promptly
- ✅ Provide detailed answers to questions
- ✅ Review absence requests fairly
- ✅ Add comments to help students understand decisions
- ✅ Keep your profile updated with accurate subjects

### For Parents
- ✅ Monitor your child's attendance regularly
- ✅ Review absence requests carefully
- ✅ Communicate with your child about patterns
- ✅ Provide thoughtful feedback in approval comments
- ✅ Contact mentors if you have concerns

### For Admins
- ✅ Link students to appropriate mentors
- ✅ Ensure all students have parent links
- ✅ Verify mentor profiles are complete
- ✅ Monitor system for issues
- ✅ Keep join codes secure

---

## Workflow Examples

### Example 1: Student Submits Absence Request

**Scenario**: Student needs to leave early for a doctor's appointment

1. **Student**:
   - Opens app → Absence tab
   - Taps "+ New Request"
   - Selects "Early Leave"
   - Enters date and time
   - Reason: "Doctor's appointment"
   - Submits request
   - Status: PENDING

2. **Mentor**:
   - Opens app → Approvals tab
   - Sees request from assigned student
   - Reviews reason
   - Taps "Approve"
   - Comment: "Hope everything is okay"
   - Submits approval
   - Student status: PARTIAL (1 of 2 approvals)

3. **Parent**:
   - Opens app → Approvals tab
   - Sees request from linked child
   - Reviews reason and mentor approval
   - Taps "Approve"
   - Comment: "Approved, will pick up at 2pm"
   - Submits approval
   - Student status: APPROVED ✅

### Example 2: Student Books Q&A Session

**Scenario**: Student needs help with Math homework

1. **Student**:
   - Opens app → Q&A tab
   - Searches for "Math" mentors
   - Finds suitable mentor
   - Taps "Book Session"
   - Describes problem
   - Submits booking
   - Status: REQUESTED

2. **Mentor**:
   - Opens app → Q&A tab
   - Sees new request
   - Reviews question
   - Taps "Accept"
   - Schedules time
   - Status: ACCEPTED

3. **After Session**:
   - **Mentor**: Provides written answer and explanation
   - Marks session as COMPLETED
   - **Student**: Receives answer and can rate mentor

### Example 3: Admin Sets Up New Student

**Scenario**: New student joins, needs mentor and parent assigned

1. **Admin**:
   - Provides Student join code to student
   - Student creates account
   - Admin logs in → User Management
   - Selects the new student
   - Assigns appropriate mentor
   - Links parent to student
   - Student is now fully set up ✅

2. **Student** can now:
   - Submit absence requests (will go to assigned mentor)
   - Book Q&A sessions with any mentor

3. **Parent** can now:
   - View student's attendance
   - Approve absence requests

4. **Mentor** can now:
   - See absence requests from this student
   - Accept Q&A bookings from this student

---

## Version Information

**Current Version**: 1.0.0
**Last Updated**: October 2025
**Platform**: React Native Mobile App

For the latest updates and features, please check with your system administrator.

---

*End of User Manual*
