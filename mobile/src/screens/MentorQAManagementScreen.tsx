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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { QABooking } from '../types';

export default function MentorQAManagementScreen() {
  const [bookings, setBookings] = useState<QABooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [answerImages, setAnswerImages] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('pending');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await api.get('/qa/history');
      setBookings(response.data.history);
    } catch (error) {
      console.error('Load Q&A bookings error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleAccept = async (bookingId: string) => {
    try {
      await api.post(`/qa/${bookingId}/accept`);
      Alert.alert('Success', 'Q&A request accepted');
      loadBookings();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setAnswerImages([...answerImages, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleSubmitAnswer = async (bookingId: string) => {
    if (!answer.trim()) {
      Alert.alert('Error', 'Please provide an answer');
      return;
    }

    try {
      // In production, upload images first and get URLs
      await api.post(`/qa/${bookingId}/answer`, {
        answerText: answer,
        answerFileUrl: answerImages.length > 0 ? answerImages[0] : null,
      });

      Alert.alert('Success', 'Answer submitted successfully');
      setAnswer('');
      setAnswerImages([]);
      setSelectedBooking(null);
      loadBookings();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit answer');
    }
  };

  const getFilteredBookings = () => {
    switch (filter) {
      case 'pending':
        return bookings.filter((b) => b.status === 'REQUESTED');
      case 'active':
        return bookings.filter((b) => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS');
      default:
        return bookings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return '#F59E0B';
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return '#3B82F6';
      case 'COMPLETED':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const filteredBookings = getFilteredBookings();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Q&A Management</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterTabText, filter === 'active' && styles.filterTabTextActive]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA3AF" />
        }
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No Q&A requests</Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View>
                  <Text style={styles.studentName}>{booking.student?.name}</Text>
                  <Text style={styles.bookingSubject}>
                    {booking.subject} {booking.chapter && `· ${booking.chapter}`}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                  <Text style={styles.statusText}>{booking.status}</Text>
                </View>
              </View>

              <Text style={styles.bookingTime}>
                {new Date(booking.slotStart).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>

              <Text style={styles.summary}>{booking.summary}</Text>

              {booking.questionFileUrl && (
                <Image source={{ uri: booking.questionFileUrl }} style={styles.questionImage} />
              )}

              {/* Accept Button for Pending */}
              {booking.status === 'REQUESTED' && (
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAccept(booking.id)}
                >
                  <Text style={styles.acceptButtonText}>Accept Request</Text>
                </TouchableOpacity>
              )}

              {/* Answer Form for Accepted */}
              {(booking.status === 'ACCEPTED' || booking.status === 'IN_PROGRESS') && (
                <>
                  {selectedBooking === booking.id ? (
                    <View style={styles.answerForm}>
                      <Text style={styles.answerLabel}>Your Answer:</Text>
                      <TextInput
                        style={styles.answerInput}
                        value={answer}
                        onChangeText={setAnswer}
                        placeholder="Provide detailed explanation..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                      />

                      {answerImages.length > 0 && (
                        <View style={styles.answerImages}>
                          {answerImages.map((uri, idx) => (
                            <Image key={idx} source={{ uri }} style={styles.answerImagePreview} />
                          ))}
                        </View>
                      )}

                      <View style={styles.answerActions}>
                        <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
                          <Text style={styles.imageButtonText}>📎 Add Image</Text>
                        </TouchableOpacity>

                        <View style={styles.answerButtons}>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                              setSelectedBooking(null);
                              setAnswer('');
                              setAnswerImages([]);
                            }}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => handleSubmitAnswer(booking.id)}
                          >
                            <Text style={styles.submitButtonText}>Submit Answer</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.answerNowButton}
                      onPress={() => setSelectedBooking(booking.id)}
                    >
                      <Text style={styles.answerNowButtonText}>Answer Now</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* Show Answer for Completed */}
              {booking.status === 'COMPLETED' && booking.answerText && (
                <View style={styles.completedAnswer}>
                  <Text style={styles.completedLabel}>Your Answer:</Text>
                  <Text style={styles.completedText}>{booking.answerText}</Text>
                  {booking.answerFileUrl && (
                    <Image source={{ uri: booking.answerFileUrl }} style={styles.answerImageDisplay} />
                  )}
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
  filterTabs: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterTabActive: {
    backgroundColor: '#6B7280',
  },
  filterTabText: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  bookingCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bookingSubject: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '500',
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
  bookingTime: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 12,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  acceptButton: {
    backgroundColor: '#6B7280',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  answerNowButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  answerNowButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  answerForm: {
    marginTop: 12,
  },
  answerLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  answerInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  answerImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  answerImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  answerActions: {
    gap: 12,
  },
  imageButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  completedAnswer: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  completedLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 4,
  },
  completedText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  answerImageDisplay: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
});
