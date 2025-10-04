import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { StudentStats, CalendarDay } from '../types';

export default function ParentDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChildrenList();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadChildData();
    }
  }, [selectedChild]);

  const loadChildrenList = async () => {
    try {
      // Fetch actual parent-student links
      const response = await api.get('/parent/children');
      const linkedChildren = response.data.children || [];
      setChildren(linkedChildren);
      if (linkedChildren.length > 0) {
        setSelectedChild(linkedChildren[0]);
      }
    } catch (error) {
      console.error('Load children error:', error);
      Alert.alert('Error', 'Failed to load children');
    }
  };

  const loadChildData = async () => {
    try {
      const [statsRes, attendanceRes] = await Promise.all([
        api.get('/analytics/stats', {
          params: { studentId: selectedChild.id },
        }),
        api.get('/attendance/calendar', {
          params: {
            studentId: selectedChild.id,
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString(),
          },
        }),
      ]);

      setStats(statsRes.data);
      setRecentAttendance(attendanceRes.data.calendar.slice(0, 7));
    } catch (error: any) {
      if (error.response?.status === 403) {
        Alert.alert('Error', 'Not authorized to view this student');
      } else {
        console.error('Load child data error:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (selectedChild) {
      loadChildData();
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Parent Portal</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Child Selector */}
      {children.length > 0 && (
        <View style={styles.childSelector}>
          <Text style={styles.childLabel}>Viewing:</Text>
          <View style={styles.childPicker}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childOption,
                  selectedChild?.id === child.id && styles.childOptionActive,
                ]}
                onPress={() => setSelectedChild(child)}
              >
                <Text
                  style={[
                    styles.childOptionText,
                    selectedChild?.id === child.id && styles.childOptionTextActive,
                  ]}
                >
                  {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA3AF" />
        }
      >
        {/* Stats Overview */}
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

        {/* Recent Attendance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Attendance (7 Days)</Text>
          {recentAttendance.length === 0 ? (
            <Text style={styles.emptyText}>No attendance records</Text>
          ) : (
            recentAttendance.map((day) => (
              <View key={day.date} style={styles.attendanceRow}>
                <Text style={styles.attendanceDate}>
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <View style={styles.attendanceInfo}>
                  <Text style={styles.attendanceSessions}>
                    {day.sessions.length} session{day.sessions.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.attendanceTime}>{formatDuration(day.totalMinutes)}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Subject Breakdown */}
        {stats && Object.keys(stats.subjectBreakdown).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Study Time by Subject</Text>
            {Object.entries(stats.subjectBreakdown).map(([subject, minutes]) => (
              <View key={subject} style={styles.subjectRow}>
                <Text style={styles.subjectName}>{subject}</Text>
                <Text style={styles.subjectTime}>{Math.floor(minutes / 60)}h</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AbsenceApproval')}
          >
            <Text style={styles.actionIcon}>✅</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Absence Approvals</Text>
              <Text style={styles.actionDescription}>Review pending requests</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Full attendance view')}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Full Calendar</Text>
              <Text style={styles.actionDescription}>See detailed attendance</Text>
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
    color: '#E5E7EB',
    fontWeight: '600',
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  childSelector: {
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  childLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  childPicker: {
    flexDirection: 'row',
  },
  childOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#111827',
    marginRight: 8,
  },
  childOptionActive: {
    backgroundColor: '#6B7280',
  },
  childOptionText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
  },
  childOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
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
    color: '#E5E7EB',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
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
  emptyText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 20,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  attendanceDate: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  attendanceInfo: {
    alignItems: 'flex-end',
  },
  attendanceSessions: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
    marginBottom: 2,
  },
  attendanceTime: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subjectName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  subjectTime: {
    fontSize: 14,
    color: '#10B981',
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
