import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import api from '../services/api';
import { AbsenceRequest } from '../types';

export default function ParentAbsenceApprovalScreen() {
  const [requests, setRequests] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await api.get('/absence');
      // Filter for requests that need parent approval
      const pendingForParent = response.data.requests.filter(
        (r: AbsenceRequest) => r.parentDecision === 'PENDING'
      );
      setRequests(pendingForParent);
    } catch (error) {
      console.error('Load absence requests error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleApprove = async (requestId: string) => {
    try {
      await api.post(`/absence/${requestId}/approve`, {
        comment: comment || 'Approved',
      });

      Alert.alert('Success', 'Absence request approved');
      setComment('');
      setSelectedRequest(null);
      loadRequests();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    try {
      await api.post(`/absence/${requestId}/reject`, {
        comment,
      });

      Alert.alert('Success', 'Absence request rejected');
      setComment('');
      setSelectedRequest(null);
      loadRequests();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to reject');
    }
  };

  const confirmAction = (requestId: string, action: 'approve' | 'reject') => {
    Alert.alert(
      `${action === 'approve' ? 'Approve' : 'Reject'} Request`,
      `Are you sure you want to ${action} this absence request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approve' ? 'Approve' : 'Reject',
          style: action === 'approve' ? 'default' : 'destructive',
          onPress: () => {
            if (action === 'approve') {
              handleApprove(requestId);
            } else {
              handleReject(requestId);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Absence Approvals</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA3AF" />
        }
      >
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No pending approval requests</Text>
          </View>
        ) : (
          requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View>
                  <Text style={styles.requestType}>{request.type}</Text>
                  <Text style={styles.requestDate}>
                    {new Date(request.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.mentorDecision}>
                  <Text style={styles.mentorLabel}>Mentor:</Text>
                  <Text
                    style={[
                      styles.mentorStatus,
                      request.mentorDecision === 'APPROVED' && { color: '#10B981' },
                      request.mentorDecision === 'REJECTED' && { color: '#EF4444' },
                    ]}
                  >
                    {request.mentorDecision}
                  </Text>
                </View>
              </View>

              <Text style={styles.requestReason}>{request.reasonText}</Text>

              {request.mentorComment && (
                <View style={styles.mentorComment}>
                  <Text style={styles.commentLabel}>Mentor's comment:</Text>
                  <Text style={styles.commentText}>{request.mentorComment}</Text>
                </View>
              )}

              {selectedRequest === request.id && (
                <View style={styles.commentInput}>
                  <Text style={styles.commentInputLabel}>Your comment (optional):</Text>
                  <TextInput
                    style={styles.textInput}
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Add a comment..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => {
                    setSelectedRequest(request.id);
                    setTimeout(() => confirmAction(request.id, 'reject'), 100);
                  }}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => {
                    setSelectedRequest(request.id);
                    setTimeout(() => confirmAction(request.id, 'approve'), 100);
                  }}
                >
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
              </View>
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
    fontWeight: '700',
    color: '#FFFFFF',
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
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  requestCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  mentorDecision: {
    alignItems: 'flex-end',
  },
  mentorLabel: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '600',
    marginBottom: 4,
  },
  mentorStatus: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  requestReason: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 12,
  },
  mentorComment: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentLabel: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  commentInput: {
    marginBottom: 12,
  },
  commentInputLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#374151',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
