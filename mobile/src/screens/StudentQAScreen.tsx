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
import { Mentor, QABooking } from '../types';

export default function StudentQAScreen() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [myBookings, setMyBookings] = useState<QABooking[]>([]);
  const [selectedTab, setSelectedTab] = useState<'mentors' | 'bookings'>('mentors');
  const [searchSubject, setSearchSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [searchSubject]);

  const loadData = async () => {
    try {
      const [mentorsRes, bookingsRes] = await Promise.all([
        api.get('/qa/mentors', {
          params: searchSubject ? { subject: searchSubject } : {},
        }),
        api.get('/qa/history'),
      ]);

      setMentors(mentorsRes.data.mentors);
      setMyBookings(bookingsRes.data.history);
    } catch (error) {
      console.error('Load Q&A data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleBookMentor = (mentor: Mentor) => {
    // Navigate to booking form (would be a separate screen)
    Alert.alert(
      'Book Q&A Session',
      `Would you like to book a session with ${mentor.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book',
          onPress: () => {
            // Here you would navigate to a BookingForm screen
            // For now, show a placeholder
            Alert.alert('Coming Soon', 'Booking form will be implemented');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return '#F59E0B';
      case 'ACCEPTED':
        return '#3B82F6';
      case 'COMPLETED':
        return '#10B981';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Q&A Sessions</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'mentors' && styles.tabActive]}
          onPress={() => setSelectedTab('mentors')}
        >
          <Text style={[styles.tabText, selectedTab === 'mentors' && styles.tabTextActive]}>
            Find Mentors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'bookings' && styles.tabActive]}
          onPress={() => setSelectedTab('bookings')}
        >
          <Text style={[styles.tabText, selectedTab === 'bookings' && styles.tabTextActive]}>
            My Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'mentors' && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by subject..."
            placeholderTextColor="#9CA3AF"
            value={searchSubject}
            onChangeText={setSearchSubject}
          />
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA3AF" />
        }
      >
        {selectedTab === 'mentors' ? (
          mentors.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No mentors found</Text>
            </View>
          ) : (
            mentors.map((mentor) => (
              <View key={mentor.id} style={styles.mentorCard}>
                <View style={styles.mentorHeader}>
                  <View>
                    <Text style={styles.mentorName}>{mentor.name}</Text>
                    <Text style={styles.mentorUniversity}>
                      {mentor.university} · {mentor.major}
                    </Text>
                  </View>
                  <View style={styles.rating}>
                    <Text style={styles.ratingText}>⭐ {mentor.rating.toFixed(1)}</Text>
                  </View>
                </View>

                {mentor.bio && <Text style={styles.mentorBio}>{mentor.bio}</Text>}

                <View style={styles.subjects}>
                  {mentor.subjects.map((subject, index) => (
                    <View key={index} style={styles.subjectBadge}>
                      <Text style={styles.subjectText}>{subject}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBookMentor(mentor)}
                >
                  <Text style={styles.bookButtonText}>Book Session</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        ) : (
          myBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No bookings yet</Text>
            </View>
          ) : (
            myBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingMentor}>{booking.mentor.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                    <Text style={styles.statusText}>{booking.status}</Text>
                  </View>
                </View>

                <Text style={styles.bookingSubject}>
                  {booking.subject} {booking.chapter && `· ${booking.chapter}`}
                </Text>
                <Text style={styles.bookingSummary}>{booking.summary}</Text>

                <Text style={styles.bookingTime}>
                  {new Date(booking.slotStart).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>

                {booking.answerText && (
                  <View style={styles.answer}>
                    <Text style={styles.answerLabel}>Answer:</Text>
                    <Text style={styles.answerText}>{booking.answerText}</Text>
                  </View>
                )}
              </View>
            ))
          )
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6B7280',
  },
  tabText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#1F2937',
  },
  searchInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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
  mentorCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  mentorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mentorUniversity: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
    marginTop: 2,
  },
  rating: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mentorBio: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '500',
    marginBottom: 12,
  },
  subjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  subjectBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  subjectText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#6B7280',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingMentor: {
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '700',
  },
  bookingSubject: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingSummary: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  bookingTime: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  answer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  answerLabel: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '600',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
