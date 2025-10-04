import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface StudentWithAssignments {
  id: string;
  name: string;
  email: string;
  assignedMentor?: { id: string; name: string };
  parents: { id: string; name: string }[];
}

export default function AdminManagementScreen() {
  const [students, setStudents] = useState<User[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithAssignments | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading admin data...');
      const [studentsRes, mentorsRes, parentsRes] = await Promise.all([
        api.get('/admin/users?role=STUDENT'),
        api.get('/admin/users?role=MENTOR'),
        api.get('/admin/users?role=PARENT'),
      ]);

      console.log('Students:', studentsRes.data.users);
      console.log('Mentors:', mentorsRes.data.users);
      console.log('Parents:', parentsRes.data.users);

      setStudents(studentsRes.data.users);
      setMentors(mentorsRes.data.users);
      setParents(parentsRes.data.users);
    } catch (error: any) {
      console.error('Load data error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStudentAssignments = async (studentId: string) => {
    try {
      console.log('Loading assignments for student:', studentId);
      const response = await api.get(`/admin/students/${studentId}/assignments`);
      console.log('Student assignments:', response.data.student);
      setSelectedStudent(response.data.student);
      setSelectedMentorId(response.data.student.assignedMentor?.id || '');
    } catch (error: any) {
      console.error('Load student assignments error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.error || 'Failed to load student assignments');
    }
  };

  const handleAssignMentor = async () => {
    if (!selectedStudent || !selectedMentorId) {
      Alert.alert('Error', 'Please select a student and mentor');
      return;
    }

    try {
      console.log('Assigning mentor:', selectedMentorId, 'to student:', selectedStudent.id);
      const response = await api.post('/admin/assign-mentor', {
        studentId: selectedStudent.id,
        mentorId: selectedMentorId,
      });
      console.log('Assign mentor response:', response.data);
      Alert.alert('Success', 'Mentor assigned successfully');
      loadStudentAssignments(selectedStudent.id);
    } catch (error: any) {
      console.error('Assign mentor error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.error || 'Failed to assign mentor');
    }
  };

  const handleLinkParent = async () => {
    if (!selectedStudent || !selectedParentId) {
      Alert.alert('Error', 'Please select a student and parent');
      return;
    }

    try {
      console.log('Linking parent:', selectedParentId, 'to student:', selectedStudent.id);
      const response = await api.post('/admin/link-parent', {
        studentId: selectedStudent.id,
        parentId: selectedParentId,
      });
      console.log('Link parent response:', response.data);
      Alert.alert('Success', 'Parent linked successfully');
      loadStudentAssignments(selectedStudent.id);
      setSelectedParentId('');
    } catch (error: any) {
      console.error('Link parent error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.error || 'Failed to link parent');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Student Management</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA3AF" />
        }
      >
        {/* Student Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Student</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStudent?.id || ''}
              onValueChange={(value) => {
                console.log('Student picker changed:', value);
                if (value) {
                  loadStudentAssignments(value);
                }
              }}
              style={styles.picker}
              dropdownIconColor="#FFFFFF"
            >
              <Picker.Item label="Choose a student..." value="" color="#9CA3AF" />
              {students.map((student) => (
                <Picker.Item
                  key={student.id}
                  label={student.name}
                  value={student.id}
                  color="#FFFFFF"
                />
              ))}
            </Picker>
          </View>
        </View>

        {selectedStudent && (
          <>
            {/* Current Assignments */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Current Assignments</Text>

              <View style={styles.assignmentRow}>
                <Text style={styles.label}>Assigned Mentor:</Text>
                <Text style={styles.value}>
                  {selectedStudent.assignedMentor?.name || 'None'}
                </Text>
              </View>

              <View style={styles.assignmentRow}>
                <Text style={styles.label}>Linked Parents:</Text>
                {selectedStudent.parents.length === 0 ? (
                  <Text style={styles.value}>None</Text>
                ) : (
                  <View>
                    {selectedStudent.parents.map((parent) => (
                      <Text key={parent.id} style={styles.value}>
                        • {parent.name}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Assign Mentor */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Assign Mentor</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedMentorId}
                  onValueChange={(value) => {
                    console.log('Mentor picker changed:', value);
                    setSelectedMentorId(value);
                  }}
                  style={styles.picker}
                  dropdownIconColor="#FFFFFF"
                >
                  <Picker.Item label="Select a mentor..." value="" color="#9CA3AF" />
                  {mentors.map((mentor) => (
                    <Picker.Item
                      key={mentor.id}
                      label={mentor.name}
                      value={mentor.id}
                      color="#FFFFFF"
                    />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleAssignMentor}>
                <Text style={styles.buttonText}>Assign Mentor</Text>
              </TouchableOpacity>
            </View>

            {/* Link Parent */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Link Parent</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedParentId}
                  onValueChange={(value) => {
                    console.log('Parent picker changed:', value);
                    setSelectedParentId(value);
                  }}
                  style={styles.picker}
                  dropdownIconColor="#FFFFFF"
                >
                  <Picker.Item label="Select a parent..." value="" color="#9CA3AF" />
                  {parents.map((parent) => (
                    <Picker.Item
                      key={parent.id}
                      label={parent.name}
                      value={parent.id}
                      color="#FFFFFF"
                    />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleLinkParent}>
                <Text style={styles.buttonText}>Link Parent</Text>
              </TouchableOpacity>
            </View>
          </>
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
  pickerContainer: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    marginBottom: 16,
  },
  picker: {
    color: '#FFFFFF',
  },
  pickerItem: {
    color: '#FFFFFF',
    backgroundColor: '#1F2937',
  },
  assignmentRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
