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
import { StudyRanking, StudentStats } from '../types';

export default function StudentStatsScreen() {
  const [rankings, setRankings] = useState<StudyRanking[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      const [rankingsRes, statsRes] = await Promise.all([
        api.get('/analytics/ranks/study', { params: { period } }),
        api.get('/analytics/stats'),
      ]);

      setRankings(rankingsRes.data.rankings);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const myRank = rankings.findIndex((r) => r.studentId === stats?.studentId) + 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rankings & Stats</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['daily', 'weekly', 'monthly'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA3AF" />
        }
      >
        {/* My Rank Card */}
        {myRank > 0 && stats && (
          <View style={styles.myRankCard}>
            <Text style={styles.myRankLabel}>Your Rank</Text>
            <Text style={styles.myRankValue}>#{myRank}</Text>
            <Text style={styles.myRankHours}>{stats.attendance.totalHours}h study time</Text>
          </View>
        )}

        {/* Personal Stats */}
        {stats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Stats</Text>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Study Time</Text>
              <Text style={styles.statValue}>{stats.attendance.totalHours}h</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Sessions</Text>
              <Text style={styles.statValue}>{stats.attendance.sessionCount}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Pomodoro Hours</Text>
              <Text style={styles.statValue}>{stats.pomodoro.totalHours}h</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Focus Sessions</Text>
              <Text style={styles.statValue}>{stats.pomodoro.sessionCount}</Text>
            </View>
          </View>
        )}

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

        {/* Leaderboard */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Leaderboard ({period})</Text>

          {rankings.length === 0 ? (
            <Text style={styles.emptyText}>No rankings available</Text>
          ) : (
            rankings.map((ranking, index) => (
              <View
                key={ranking.studentId}
                style={[
                  styles.rankingRow,
                  ranking.studentId === stats?.studentId && styles.rankingRowHighlight,
                ]}
              >
                <View style={styles.rankingRank}>
                  <Text style={[
                    styles.rankingRankText,
                    index < 3 && styles.rankingRankTextTop,
                  ]}>
                    #{index + 1}
                  </Text>
                </View>

                <View style={styles.rankingInfo}>
                  <Text style={styles.rankingName}>
                    {ranking.studentId === stats?.studentId ? 'You' : ranking.name}
                  </Text>
                  <Text style={styles.rankingSessions}>{ranking.sessionCount} sessions</Text>
                </View>

                <Text style={styles.rankingHours}>{ranking.totalHours}h</Text>
              </View>
            ))
          )}
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#6B7280',
  },
  periodText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  myRankCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6B7280',
    alignItems: 'center',
  },
  myRankLabel: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  myRankValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  myRankHours: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '500',
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
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  statLabel: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: '#FFFFFF',
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
  emptyText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 20,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  rankingRowHighlight: {
    backgroundColor: '#374151',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  rankingRank: {
    width: 40,
    alignItems: 'center',
  },
  rankingRankText: {
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  rankingRankTextTop: {
    color: '#F59E0B',
  },
  rankingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rankingName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  rankingSessions: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  rankingHours: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
});
