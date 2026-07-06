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

const MockTestScreen: React.FC = () => {
  const { addMockTest, sendMockMessage, mockTests } = useAppContext();
  const [testName, setTestName] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [marks, setMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleAddTest = async () => {
    if (!testName.trim() || !marks.trim() || !maxMarks.trim()) {
      Alert.alert('Required', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const testData = {
        testName,
        subject,
        marks: parseInt(marks),
        maxMarks: parseInt(maxMarks),
      };
      await addMockTest(testData);
      setTestName('');
      setMarks('');
      setMaxMarks('100');
      Alert.alert('Success', 'Mock test added!');
      
      // Auto-trigger chat with analysis
      setChatMessages([{ role: 'assistant', text: 'I\'ve recorded your test. What would you like to analyze?' }]);
      setShowChat(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChatMessage = async () => {
    if (!chatInput.trim()) return;

    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);

    try {
      const response = await sendMockMessage(msg);
      setChatMessages((prev) => [...prev, { role: 'assistant', text: response }]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Mock Test Analysis</Text>

      {!showChat ? (
        <ScrollView style={styles.formContainer}>
          <Text style={styles.label}>Test Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Physics Unit Test 1"
            placeholderTextColor="#94a3b8"
            value={testName}
            onChangeText={setTestName}
          />

          <Text style={styles.label}>Subject</Text>
          <View style={styles.subjectPicker}>
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

          <Text style={styles.label}>Marks Scored</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 85"
            placeholderTextColor="#94a3b8"
            value={marks}
            onChangeText={setMarks}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Max Marks</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 100"
            placeholderTextColor="#94a3b8"
            value={maxMarks}
            onChangeText={setMaxMarks}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleAddTest} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Add Test</Text>}
          </TouchableOpacity>

          <Text style={styles.historyTitle}>Recent Tests</Text>
          {mockTests.slice(-5).reverse().map((test: any, idx: number) => (
            <View key={idx} style={styles.testCard}>
              <Text style={styles.testName}>{test.testName}</Text>
              <Text style={styles.testDetails}>
                {test.subject} | {test.marks}/{test.maxMarks} ({Math.round((test.marks / test.maxMarks) * 100)}%)
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.chatContainer}>
          <ScrollView style={styles.messagesContainer}>
            {chatMessages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                <Text style={[styles.messageText, msg.role === 'user' && styles.userMessageText]}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {chatLoading && (
              <View style={styles.loadingBubble}>
                <ActivityIndicator color="#f59e0b" />
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Ask about your performance..."
              placeholderTextColor="#64748b"
              value={chatInput}
              onChangeText={setChatInput}
              multiline
              editable={!chatLoading}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!chatInput.trim() || chatLoading) && styles.sendBtnDisabled]}
              onPress={handleChatMessage}
              disabled={!chatInput.trim() || chatLoading}
            >
              <Text style={styles.sendBtnText}>Ask</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => setShowChat(false)}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    marginBottom: 16,
  },
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
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
  subjectPicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
  },
  pickerOptionActive: {
    borderColor: '#f59e0b',
    backgroundColor: '#f59e0b',
  },
  pickerText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '600',
  },
  pickerTextActive: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  testCard: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  testName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  testDetails: {
    color: '#94a3b8',
    fontSize: 12,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 12,
  },
  messageBubble: {
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#f59e0b',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  userMessageText: {
    color: '#fff',
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default MockTestScreen;
