import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { StudentStats } from '../types';

export default function StudentHomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
    checkActiveSession();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/analytics/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkActiveSession = async () => {
    try {
      const response = await api.get('/attendance/calendar', {
        params: {
          from: new Date().toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0],
        },
      });
      
      const today = response.data.calendar[0];
      if (today) {
        const activeSession = today.sessions.find((s: any) => !s.endAt);
        setCheckedIn(!!activeSession);
      }
    } catch (error) {
      console.error('Check session error:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/checkin', { source: 'MOBILE' });
      setCheckedIn(true);
      Alert.alert('Success', 'Checked in successfully');
      loadStats();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post('/attendance/checkout');
      setCheckedIn(false);
      Alert.alert('Success', 'Checked out successfully');
      loadStats();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Check-out failed');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
    checkActiveSession();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA3AF" />
        }
      >
        {/* Check-in/out Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attendance</Text>
          <TouchableOpacity
            style={[styles.attendanceButton, checkedIn && styles.attendanceButtonActive]}
            onPress={checkedIn ? handleCheckOut : handleCheckIn}
          >
            <Text style={styles.attendanceButtonText}>
              {checkedIn ? '✓ Check Out' : 'Check In'}
            </Text>
          </TouchableOpacity>
          {checkedIn && (
            <Text style={styles.attendanceStatus}>Currently checked in</Text>
          )}
        </View>

        {/* Stats Cards */}
        {stats && (
          <>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.statValue}>{stats.attendance.totalHours}h</Text>
                <Text style={styles.statLabel}>Study Hours</Text>
              </View>
              <View style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.statValue}>{stats.attendance.sessionCount}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.statValue}>{stats.pomodoro.totalHours}h</Text>
                <Text style={styles.statLabel}>Pomodoro</Text>
              </View>
              <View style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.statValue}>{stats.pomodoro.sessionCount}</Text>
                <Text style={styles.statLabel}>Focus Sessions</Text>
              </View>
            </View>
          </>
        )}

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Attendance')}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Calendar</Text>
              <Text style={styles.actionDescription}>See your attendance history</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('QA')}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Book Q&A</Text>
              <Text style={styles.actionDescription}>Schedule session with mentor</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Absence')}
          >
            <Text style={styles.actionIcon}>🚫</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Submit Absence</Text>
              <Text style={styles.actionDescription}>Request leave or early exit</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Stats')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Rankings & Stats</Text>
              <Text style={styles.actionDescription}>View leaderboards</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  greeting: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  attendanceButton: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  attendanceButtonActive: {
    backgroundColor: '#10B981',
  },
  attendanceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  attendanceStatus: {
    color: '#10B981',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
  },
});
