import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAppContext } from '../context/AppContext';

const DashboardScreen: React.FC = () => {
  const { dailyStats, weeklyStats, focusData, refreshAllStats } = useAppContext();
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshAllStats().then(() => setLoading(false));
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const fis = focusData?.today?.focusScore ?? null;
  const fisColor = fis === null ? '#64748b' : fis >= 70 ? '#10b981' : fis >= 40 ? '#f59e0b' : '#ef4444';

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Your Progress</Text>
          <Text style={styles.time}>{timeStr}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statValue}>
            {dailyStats?.totalHours.toFixed(2) || '0.00'}h
          </Text>
          <Text style={styles.statSubtext}>/ {dailyStats?.requiredHours || 10}h</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>FIS</Text>
          <Text style={[styles.statValue, { color: fisColor }]}>
            {fis !== null ? `${fis}/100` : '--'}
          </Text>
          <Text style={styles.statSubtext}>Focus Score</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={styles.statValue}>
            {weeklyStats?.current?.totalHours.toFixed(2) || '0.00'}h
          </Text>
          <Text style={styles.statSubtext}>/ 70h</Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.cardTitle}>Daily Progress</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, (dailyStats?.percentage || 0))}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {dailyStats?.percentage || 0}% Complete
        </Text>
      </View>

      {dailyStats?.subjectBreakdown && (
        <View style={styles.subjectCard}>
          <Text style={styles.cardTitle}>Subject Breakdown</Text>
          {Object.entries(dailyStats.subjectBreakdown).map(([subject, hours]: [string, any]) => (
            <View key={subject} style={styles.subjectRow}>
              <Text style={styles.subjectName}>{subject}</Text>
              <Text style={styles.subjectHours}>{hours.toFixed(2)}h</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  time: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#64748b',
  },
  progressCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  progressText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  subjectCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  subjectName: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  subjectHours: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardScreen;
