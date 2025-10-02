import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import api from '../services/api';
import { CalendarDay } from '../types';

export default function StudentAttendanceScreen() {
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    loadCalendar();
  }, [selectedMonth]);

  const loadCalendar = async () => {
    try {
      const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      const response = await api.get('/attendance/calendar', {
        params: {
          from: startOfMonth.toISOString(),
          to: endOfMonth.toISOString(),
        },
      });

      setCalendar(response.data.calendar);
    } catch (error) {
      console.error('Load calendar error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCalendar();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const previousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  const monthName = selectedMonth.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'long'
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Calendar</Text>
      </View>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={previousMonth} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthName}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA3AF" />
        }
      >
        {calendar.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No attendance records for this month</Text>
          </View>
        ) : (
          calendar.map((day) => (
            <View key={day.date} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayDate}>
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.dayTotal}>{formatDuration(day.totalMinutes)}</Text>
              </View>

              {day.sessions.map((session, index) => (
                <View key={session.id} style={styles.session}>
                  <View style={styles.sessionDot} />
                  <View style={styles.sessionContent}>
                    <Text style={styles.sessionTime}>
                      {formatTime(session.startAt)} -{' '}
                      {session.endAt ? formatTime(session.endAt) : 'Active'}
                    </Text>
                    <Text style={styles.sessionDuration}>
                      {session.durationMinutes
                        ? formatDuration(session.durationMinutes)
                        : 'In progress'}
                    </Text>
                  </View>
                  <View style={[styles.sourceBadge, session.endAt ? {} : styles.sourceBadgeActive]}>
                    <Text style={styles.sourceBadgeText}>{session.source}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    color: '#F9FAFB',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  monthButton: {
    padding: 8,
  },
  monthButtonText: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  dayCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  dayDate: {
    fontSize: 16,
    color: '#F9FAFB',
    fontWeight: '500',
  },
  dayTotal: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  session: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B7280',
    marginRight: 12,
  },
  sessionContent: {
    flex: 1,
  },
  sessionTime: {
    fontSize: 14,
    color: '#F9FAFB',
    marginBottom: 2,
  },
  sessionDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sourceBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sourceBadgeActive: {
    backgroundColor: '#10B981',
  },
  sourceBadgeText: {
    fontSize: 10,
    color: '#F9FAFB',
    fontWeight: '600',
  },
});
