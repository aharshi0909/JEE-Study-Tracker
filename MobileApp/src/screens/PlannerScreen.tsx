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

const PlannerScreen: React.FC = () => {
  const { sendPlannerMessage } = useAppContext();
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await sendPlannerMessage(userMessage);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: response }]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Study Planner</Text>
      <Text style={styles.subtitle}>AI-powered study schedule builder</Text>

      <ScrollView style={styles.messagesContainer}>
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Ask the planner for a custom study schedule based on your weak subjects and exam prep.
            </Text>
            <Text style={styles.exampleText}>e.g., "Plan my week focusing on electromagnetism"</Text>
          </View>
        )}

        {messages.map((msg) => (
          <View
            key={msg.id}
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

        {loading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator color="#10b981" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask for a study plan..."
          placeholderTextColor="#64748b"
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || loading}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  exampleText: {
    color: '#4f46e5',
    fontSize: 12,
    fontStyle: 'italic',
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
    backgroundColor: '#4f46e5',
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
    lineHeight: 20,
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
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#10b981',
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
    fontSize: 14,
  },
});

export default PlannerScreen;
