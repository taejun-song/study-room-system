import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// Student Screens
import StudentHomeScreen from '../screens/StudentHomeScreen';
import StudentAttendanceScreen from '../screens/StudentAttendanceScreen';
import StudentQAScreen from '../screens/StudentQAScreen';
import StudentStatsScreen from '../screens/StudentStatsScreen';
import StudentAbsenceScreen from '../screens/StudentAbsenceScreen';

// Parent Screens
import ParentDashboardScreen from '../screens/ParentDashboardScreen';
import ParentAbsenceApprovalScreen from '../screens/ParentAbsenceApprovalScreen';

// Mentor Screens
import MentorDashboardScreen from '../screens/MentorDashboardScreen';
import MentorQAManagementScreen from '../screens/MentorQAManagementScreen';
import MentorAbsenceApprovalScreen from '../screens/MentorAbsenceApprovalScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminManagementScreen from '../screens/AdminManagementScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Student Tab Navigator
function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopColor: '#374151',
        },
        tabBarActiveTintColor: '#F9FAFB',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="Home"
        component={StudentHomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Attendance"
        component={StudentAttendanceScreen}
        options={{ tabBarLabel: 'Calendar', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="QA"
        component={StudentQAScreen}
        options={{ tabBarLabel: 'Q&A', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Stats"
        component={StudentStatsScreen}
        options={{ tabBarLabel: 'Stats', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Absence"
        component={StudentAbsenceScreen}
        options={{ tabBarLabel: 'Absence', tabBarIcon: () => null }}
      />
    </Tab.Navigator>
  );
}

// Parent Tab Navigator
function ParentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopColor: '#374151',
        },
        tabBarActiveTintColor: '#F9FAFB',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ParentDashboardScreen}
        options={{ tabBarLabel: 'Dashboard', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="AbsenceApproval"
        component={ParentAbsenceApprovalScreen}
        options={{ tabBarLabel: 'Approvals', tabBarIcon: () => null }}
      />
    </Tab.Navigator>
  );
}

// Mentor Tab Navigator
function MentorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopColor: '#374151',
        },
        tabBarActiveTintColor: '#F9FAFB',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={MentorDashboardScreen}
        options={{ tabBarLabel: 'Dashboard', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="QAManagement"
        component={MentorQAManagementScreen}
        options={{ tabBarLabel: 'Q&A', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="AbsenceApproval"
        component={MentorAbsenceApprovalScreen}
        options={{ tabBarLabel: 'Approvals', tabBarIcon: () => null }}
      />
    </Tab.Navigator>
  );
}

// Admin Stack Navigator
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminManagement" component={AdminManagementScreen} />
    </Stack.Navigator>
  );
}


export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Show splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          // Authenticated Stack - Route by role
          <>
            {user.role === 'STUDENT' && (
              <Stack.Screen name="StudentApp" component={StudentTabs} />
            )}
            {user.role === 'PARENT' && (
              <Stack.Screen name="ParentApp" component={ParentTabs} />
            )}
            {user.role === 'MENTOR' && (
              <Stack.Screen name="MentorApp" component={MentorTabs} />
            )}
            {user.role === 'ADMIN' && (
              <Stack.Screen name="AdminApp" component={AdminStack} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
