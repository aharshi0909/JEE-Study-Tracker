import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

const SUBJECTS = ['Physics', 'Chemistry', 'Math', 'Other'];

const StudyTimerScreen: React.FC = () => {
  const { activeSession, startSession, endSession, pauseSession, resumeSession, addHourlyLog } = useAppContext();
  const [elapsed, setElapsed] = useState(0);
  const [subject, setSubject] = useState('Physics');
  const [customSubject, setCustomSubject] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastHourCheck, setLastHourCheck] = useState(0);
  const [showHourlyModal, setShowHourlyModal] = useState(false);
  const [hourlyTopic, setHourlyTopic] = useState('');
  const [hourlyExplanation, setHourlyExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeSession && activeSession.id) {
      setIsRunning(true);
      setIsPaused(activeSession.status === 'paused');
      setSubject(activeSession.subject);
      const elapsedSec = Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000);
      setElapsed(elapsedSec);
    }
  }, [activeSession]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      const startTime = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsed(newElapsed);

        if (newElapsed - lastHourCheck >= 3600 && !showHourlyModal) {
          setShowHourlyModal(true);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, lastHourCheck, showHourlyModal]);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const effectiveSubject = subject === 'Other' ? customSubject || 'Other' : subject;
      await startSession(effectiveSubject);
      setIsRunning(true);
      setElapsed(0);
      setLastHourCheck(0);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    setIsLoading(true);
    try {
      await pauseSession();
      setIsPaused(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    setIsLoading(true);
    try {
      await resumeSession();
      setIsPaused(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      await endSession();
      setIsRunning(false);
      setIsPaused(false);
      setElapsed(0);
      setLastHourCheck(0);
      setIsEndingSession(false);
      setShowHourlyModal(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHourlySubmit = async () => {
    if (!hourlyTopic.trim() || !hourlyExplanation.trim()) {
      Alert.alert('Required', 'Please fill in both fields');
      return;
    }

    setIsLoading(true);
    try {
      const effectiveSubject = subject === 'Other' ? customSubject || 'Other' : subject;
      await addHourlyLog({ subject: effectiveSubject, topic: hourlyTopic, explanation: hourlyExplanation });
      setLastHourCheck(elapsed);
      setShowHourlyModal(false);
      setHourlyTopic('');
      setHourlyExplanation('');

      if (isEndingSession) {
        await handleStop();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const triggerEndSession = () => {
    const fractionalSeconds = elapsed - lastHourCheck;
    if (fractionalSeconds >= 600) {
      setIsEndingSession(true);
      setShowHourlyModal(true);
    } else {
      handleStop();
    }
  };

  const hourProgress = Math.min((elapsed - lastHourCheck) / 3600, 1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.timerSection}>
        <Text style={styles.title}>⏱ Study Timer</Text>

        <View style={styles.timerDisplay}>
          <View style={[styles.circle, isRunning && !isPaused && styles.circlePulse]}>
            <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
            <Text style={styles.subjectBadge}>
              {subject === 'Other' ? customSubject || 'Other' : subject}
            </Text>
            {isRunning && (
              <Text style={styles.minutesLeft}>
                {Math.round((elapsed - lastHourCheck) / 60)} min to next log
              </Text>
            )}
          </View>
        </View>

        {!isRunning && (
          <View style={styles.subjectSelector}>
            <Text style={styles.label}>Select Subject</Text>
            <View style={styles.subjectGrid}>
              {SUBJECTS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.subjectBtn, subject === s && styles.subjectBtnActive]}
                  onPress={() => setSubject(s)}
                >
                  <Text style={[styles.subjectBtnText, subject === s && styles.subjectBtnTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {subject === 'Other' && (
              <TextInput
                style={styles.input}
                placeholder="Enter custom subject..."
                value={customSubject}
                onChangeText={setCustomSubject}
                placeholderTextColor="#94a3b8"
              />
            )}
          </View>
        )}

        <View style={styles.buttonsRow}>
          {!isRunning ? (
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleStart}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>▶ Start</Text>}
            </TouchableOpacity>
          ) : (
            <>
              {!isPaused ? (
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={handlePause}
                  disabled={isLoading || isEndingSession}
                >
                  <Text style={styles.btnText}>⏸ Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={handleResume}
                  disabled={isLoading || isEndingSession}
                >
                  <Text style={styles.btnText}>▶ Resume</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.btn, styles.btnDanger]}
                onPress={triggerEndSession}
                disabled={isLoading || isEndingSession}
              >
                <Text style={styles.btnText}>⏹ End</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Modal visible={showHourlyModal} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEndingSession ? '🔔 Final Session Log' : '🔔 1 Hour Checkpoint'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isEndingSession
                ? `What did you study in the final ${Math.round((elapsed - lastHourCheck) / 60)} minutes?`
                : 'What exactly did you study in the past hour?'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Topic covered (e.g., Newton's Laws)..."
              value={hourlyTopic}
              onChangeText={setHourlyTopic}
              placeholderTextColor="#94a3b8"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detailed explanation of what you learned..."
              value={hourlyExplanation}
              onChangeText={setHourlyExplanation}
              placeholderTextColor="#94a3b8"
              multiline={true}
              numberOfLines={4}
            />
            <Text style={styles.charCount}>
              Characters: {hourlyExplanation.length} (min 50)
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleHourlySubmit}
                disabled={isLoading || !hourlyTopic.trim() || !hourlyExplanation.trim()}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => {
                  setShowHourlyModal(false);
                  if (isEndingSession) handleStop();
                }}
              >
                <Text style={styles.btnText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  timerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#4f46e5',
    backgroundColor: '#312e81',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlePulse: {
    borderColor: '#6366f1',
  },
  timerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  subjectBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#4f46e5',
    color: '#fff',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  minutesLeft: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 12,
  },
  subjectSelector: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  subjectBtn: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  subjectBtnActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#4f46e5',
  },
  subjectBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  subjectBtnTextActive: {
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
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4f46e5',
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});

export default StudyTimerScreen;
