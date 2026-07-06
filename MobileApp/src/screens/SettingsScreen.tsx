import React, { useState, useEffect } from 'react';
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
import { readJSON, STORAGE_KEYS } from '../utils/storage';

const SettingsScreen: React.FC = () => {
  const { resetAllData, setGeminiKey } = useAppContext();
  const [geminiKey, setGeminiKeyInput] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keySet, setKeySet] = useState(false);

  useEffect(() => {
    const loadKey = async () => {
      const key = await readJSON(STORAGE_KEYS.GEMINI_API_KEY, null);
      setKeySet(!!key);
    };
    loadKey();
  }, []);

  const handleSetKey = async () => {
    if (!geminiKey.trim()) {
      Alert.alert('Required', 'Please enter your Gemini API key');
      return;
    }

    setLoading(true);
    try {
      await setGeminiKey(geminiKey);
      setKeySet(true);
      setGeminiKeyInput('');
      setShowKeyInput(false);
      Alert.alert('Success', 'Gemini API key saved!');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      '⚠️ WARNING',
      'This will delete ALL your data: sessions, logs, scores, mock tests, and chat history.\n\nThis cannot be undone!',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete Everything',
          onPress: async () => {
            try {
              await resetAllData();
              Alert.alert('Done', 'All data has been cleared');
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🔑 Gemini API Key</Text>
            <View style={[styles.badge, keySet ? styles.badgeActive : styles.badgeInactive]}>
              <Text style={styles.badgeText}>{keySet ? 'Configured' : 'Not Set'}</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            Required for AI Coach, Planner, and Mock Analysis features.
          </Text>
          <Text style={styles.keyLink}>Get your free key at: aistudio.google.com</Text>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => setShowKeyInput(!showKeyInput)}
          >
            <Text style={styles.btnText}>{showKeyInput ? 'Cancel' : 'Update Key'}</Text>
          </TouchableOpacity>

          {showKeyInput && (
            <View style={styles.keyInputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Paste your Gemini API key here..."
                placeholderTextColor="#64748b"
                value={geminiKey}
                onChangeText={setGeminiKeyInput}
                secureTextEntry={true}
              />
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleSetKey}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Key</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 JEE Study Tracker Mobile</Text>
          <Text style={styles.cardDescription}>Version 1.0.0</Text>
          <Text style={styles.cardDescription}>Built for serious JEE aspirants.</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>✓ Study Timer with hourly logs</Text>
            <Text style={styles.feature}>✓ AI Accountability Coach</Text>
            <Text style={styles.feature}>✓ Smart Study Planner</Text>
            <Text style={styles.feature}>✓ Mock Test Analytics</Text>
            <Text style={styles.feature}>✓ Manual Study Verification</Text>
            <Text style={styles.feature}>✓ Focus Integrity Score (FIS)</Text>
            <Text style={styles.feature}>✓ Local-first data storage</Text>
            <Text style={styles.feature}>✓ Works offline</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>

        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={handleReset}>
          <Text style={styles.btnText}>🗑️ Clear All Data</Text>
        </TouchableOpacity>

        <Text style={styles.warningText}>
          This will permanently delete all your sessions, logs, scores, and chat history. Use with caution!
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#10b981',
  },
  badgeInactive: {
    backgroundColor: '#ef4444',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardDescription: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  keyLink: {
    color: '#4f46e5',
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  keyInputContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  btnPrimary: {
    backgroundColor: '#4f46e5',
  },
  btnSecondary: {
    backgroundColor: '#334155',
  },
  btnDanger: {
    backgroundColor: '#dc2626',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  featureList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  feature: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 16,
  },
  warningText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 12,
    lineHeight: 16,
  },
});

export default SettingsScreen;
