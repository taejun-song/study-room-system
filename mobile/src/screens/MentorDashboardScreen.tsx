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
import { QABooking, AbsenceRequest } from '../types';

export default function MentorDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [qaRequests, setQaRequests] = useState<QABooking[]>([]);
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [qaRes, absenceRes] = await Promise.all([
        api.get('/qa/history'),
        api.get('/absence'),
      ]);

      // Filter for pending Q&A
      const pendingQA = qaRes.data.history.filter(
        (q: QABooking) => q.status === 'REQUESTED'
      );
      setQaRequests(pendingQA);

      // Filter for pending absence approvals
      const pendingAbsence = absenceRes.data.requests.filter(
        (r: AbsenceRequest) => r.mentorDecision === 'PENDING'
      );
      setAbsenceRequests(pendingAbsence);
    } catch (error) {
      console.error('Load mentor data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAcceptQA = async (bookingId: string) => {
    try {
      await api.post(`/qa/${bookingId}/accept`);
      Alert.alert('Success', 'Q&A request accepted');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return '#F59E0B';
      case 'ACCEPTED':
        return '#3B82F6';
      case 'COMPLETED':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Mentor Portal</Text>
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
        {/* Summary Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.statValue}>{qaRequests.length}</Text>
            <Text style={styles.statLabel}>Pending Q&A</Text>
          </View>
          <View style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.statValue}>{absenceRequests.length}</Text>
            <Text style={styles.statLabel}>Absence Approvals</Text>
          </View>
        </View>

        {/* Q&A Requests */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Q&A Requests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('QAManagement')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {qaRequests.length === 0 ? (
            <Text style={styles.emptyText}>No pending Q&A requests</Text>
          ) : (
            qaRequests.slice(0, 3).map((booking) => (
              <View key={booking.id} style={styles.qaCard}>
                <View style={styles.qaHeader}>
                  <Text style={styles.qaStudent}>{booking.student?.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                    <Text style={styles.statusText}>{booking.status}</Text>
                  </View>
                </View>

                <Text style={styles.qaSubject}>
                  {booking.subject} {booking.chapter && `· ${booking.chapter}`}
                </Text>
                <Text style={styles.qaSummary}>{booking.summary}</Text>

                <Text style={styles.qaTime}>
                  {new Date(booking.slotStart).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>

                {booking.status === 'REQUESTED' && (
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptQA(booking.id)}
                  >
                    <Text style={styles.acceptButtonText}>Accept Request</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* Absence Approvals */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Absence Approvals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AbsenceApproval')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {absenceRequests.length === 0 ? (
            <Text style={styles.emptyText}>No pending approvals</Text>
          ) : (
            absenceRequests.slice(0, 3).map((request) => (
              <View key={request.id} style={styles.absenceCard}>
                <View style={styles.absenceHeader}>
                  <Text style={styles.absenceType}>{request.type}</Text>
                  <Text style={styles.absenceDate}>
                    {new Date(request.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={styles.absenceReason} numberOfLines={2}>
                  {request.reasonText}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('QAManagement')}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Q&A</Text>
              <Text style={styles.actionDescription}>Answer student questions</Text>
            </View>
          </TouchableOpacity>

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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  emptyText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 20,
  },
  qaCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  qaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  qaStudent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  qaSubject: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '500',
    marginBottom: 4,
  },
  qaSummary: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  qaTime: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
    marginBottom: 8,
  },
  acceptButton: {
    backgroundColor: '#6B7280',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  absenceCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  absenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  absenceType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  absenceDate: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  absenceReason: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '500',
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
