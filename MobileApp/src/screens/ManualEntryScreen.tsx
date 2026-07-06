import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAppContext } from '../context/AppContext';

const ManualEntryScreen: React.FC = () => {
  const { submitManualEntry } = useAppContext();
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');
  const [location, setLocation] = useState('Library');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [description, setDescription] = useState('');
  const [problemsSolved, setProblems] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!topic.trim() || !description.trim() || !estimatedTime.trim()) {
      Alert.alert('Required', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const entry = {
        subject,
        topic,
        location,
        estimatedTime: parseFloat(estimatedTime),
        description,
        problemsSolved,
      };
      const result = await submitManualEntry(entry);
      Alert.alert(
        'Success',
        `Approved: ${result.approvedTime}h\n\nAI Reason: ${result.aiReason}`
      );
      setTopic('');
      setDescription('');
      setProblems('');
      setEstimatedTime('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>✍️ Manual Study Entry</Text>
      <Text style={styles.subtitle}>Studied away from your desk? Submit for AI verification</Text>

      <Text style={styles.label}>Subject</Text>
      <View style={styles.picker}>
        {['Physics', 'Chemistry', 'Math'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.pickerOption, subject === s && styles.pickerOptionActive]}
            onPress={() => setSubject(s)}
          >
            <Text style={[styles.pickerText, subject === s && styles.pickerTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Location</Text>
      <View style={styles.picker}>
        {['Library', 'Home', 'Cafe', 'Other'].map((loc) => (
          <TouchableOpacity
            key={loc}
            style={[styles.pickerOption, location === loc && styles.pickerOptionActive]}
            onPress={() => setLocation(loc)}
          >
            <Text style={[styles.pickerText, location === loc && styles.pickerTextActive]}>{loc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Topic Covered</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Thermodynamics Chapter 4"
        placeholderTextColor="#94a3b8"
        value={topic}
        onChangeText={setTopic}
      />

      <Text style={styles.label}>Time Spent (hours)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 2.5"
        placeholderTextColor="#94a3b8"
        value={estimatedTime}
        onChangeText={setEstimatedTime}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe what you studied in detail..."
        placeholderTextColor="#94a3b8"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Problems Solved</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 15 problems from HC Verma"
        placeholderTextColor="#94a3b8"
        value={problemsSolved}
        onChangeText={setProblems}
      />

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit for Verification</Text>}
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>⚠️ AI Will Verify</Text>
        <Text style={styles.infoText}>
          Your entry will be reviewed by AI. Be honest about your time. Inflated claims will be rejected or reduced.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  picker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  pickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
  },
  pickerOptionActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#06b6d4',
  },
  pickerText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  pickerTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#06b6d4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#1e293b',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  infoTitle: {
    color: '#f59e0b',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 4,
  },
  infoText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default ManualEntryScreen;
