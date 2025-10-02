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
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import { AbsenceRequest } from '../types';

export default function StudentAbsenceScreen() {
  const [requests, setRequests] = useState<AbsenceRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [type, setType] = useState<'ABSENT' | 'LATE' | 'EARLY_LEAVE' | 'OFFSITE'>('ABSENT');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await api.get('/absence');
      setRequests(response.data.requests);
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

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason');
      return;
    }

    try {
      await api.post('/absence', {
        date,
        type,
        reasonText: reason,
      });

      Alert.alert('Success', 'Absence request submitted');
      setShowForm(false);
      setReason('');
      loadRequests();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit request');
    }
  };

  const getStatusColor = (request: AbsenceRequest) => {
    if (request.status === 'APPROVED') return '#10B981';
    if (request.status === 'REJECTED') return '#EF4444';
    if (request.status === 'PARTIAL') return '#F59E0B';
    return '#6B7280';
  };

  const getApprovalStatus = (request: AbsenceRequest) => {
    const mentorStatus = request.mentorDecision;
    const parentStatus = request.parentDecision;

    return (
      <View style={styles.approvalStatus}>
        <View style={styles.approvalItem}>
          <Text style={styles.approvalLabel}>Mentor:</Text>
          <Text style={[
            styles.approvalValue,
            mentorStatus === 'APPROVED' && { color: '#10B981' },
            mentorStatus === 'REJECTED' && { color: '#EF4444' },
          ]}>
            {mentorStatus}
          </Text>
        </View>
        <View style={styles.approvalItem}>
          <Text style={styles.approvalLabel}>Parent:</Text>
          <Text style={[
            styles.approvalValue,
            parentStatus === 'APPROVED' && { color: '#10B981' },
            parentStatus === 'REJECTED' && { color: '#EF4444' },
          ]}>
            {parentStatus}
          </Text>
        </View>
      </View>
    );
  };

  if (showForm) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowForm(false)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Submit Absence</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.formContent}>
          <View style={styles.formCard}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={type}
                onValueChange={setType}
                style={styles.picker}
              >
                <Picker.Item label="Absent (All Day)" value="ABSENT" />
                <Picker.Item label="Late Arrival" value="LATE" />
                <Picker.Item label="Early Leave" value="EARLY_LEAVE" />
                <Picker.Item label="Off-site" value="OFFSITE" />
              </Picker>
            </View>

            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Reason</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reason}
              onChangeText={setReason}
              placeholder="Explain your reason for absence..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Absence Requests</Text>
      </View>

      <TouchableOpacity
        style={styles.newRequestButton}
        onPress={() => setShowForm(true)}
      >
        <Text style={styles.newRequestText}>+ New Request</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA3AF" />
        }
      >
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No absence requests</Text>
          </View>
        ) : (
          requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestType}>{request.type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request) }]}>
                  <Text style={styles.statusText}>{request.status}</Text>
                </View>
              </View>

              <Text style={styles.requestDate}>
                {new Date(request.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>

              <Text style={styles.requestReason}>{request.reasonText}</Text>

              {getApprovalStatus(request)}

              {request.mentorComment && (
                <View style={styles.comment}>
                  <Text style={styles.commentLabel}>Mentor:</Text>
                  <Text style={styles.commentText}>{request.mentorComment}</Text>
                </View>
              )}

              {request.parentComment && (
                <View style={styles.comment}>
                  <Text style={styles.commentLabel}>Parent:</Text>
                  <Text style={styles.commentText}>{request.parentComment}</Text>
                </View>
              )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  backButton: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  newRequestButton: {
    backgroundColor: '#6B7280',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newRequestText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formContent: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  label: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  pickerContainer: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
  },
  picker: {
    color: '#F9FAFB',
  },
  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 12,
    color: '#F9FAFB',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  requestType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F9FAFB',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  requestDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  requestReason: {
    fontSize: 14,
    color: '#F9FAFB',
    marginBottom: 12,
  },
  approvalStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#374151',
    marginBottom: 12,
  },
  approvalItem: {
    alignItems: 'center',
  },
  approvalLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  approvalValue: {
    fontSize: 12,
    color: '#F9FAFB',
    fontWeight: '600',
  },
  comment: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  commentLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#F9FAFB',
  },
});
