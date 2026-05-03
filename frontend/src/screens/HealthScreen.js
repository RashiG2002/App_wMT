import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../api/axios';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

const HealthScreen = () => {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [editingHealthId, setEditingHealthId] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await api.get('health');
      setHealthData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchHealth();
    }
  }, [isFocused]);

  const addActivity = async () => {
    if (!activityType.trim() || !duration) {
      alert("Please enter activity type and duration");
      return;
    }
    if (isNaN(duration) || Number(duration) <= 0) {
      alert("Please enter a valid duration");
      return;
    }

    try {
      const payload = {
        type: 'activity',
        activityType,
        duration: Number(duration),
        calories: Number(calories) || 0,
        notes,
        date: date ? new Date(date) : new Date()
      };
      
      if (editingHealthId) {
        const res = await api.put(`health/${editingHealthId}`, payload);
        setHealthData(healthData.map(h => h._id === editingHealthId ? res.data : h));
        setEditingHealthId(null);
      } else {
        const res = await api.post('health', payload);
        setHealthData([res.data, ...healthData]);
      }
      
      // Reset form
      setActivityType('');
      setDuration('');
      setCalories('');
      setNotes('');
      setDate('');
    } catch (e) {
      console.error(e);
      alert(`Failed to ${editingHealthId ? 'update' : 'log'} health activity.`);
    }
  };

  const startEdit = (record) => {
    setEditingHealthId(record._id);
    setActivityType(record.activityType);
    setDuration(record.duration.toString());
    setCalories(record.calories ? record.calories.toString() : '');
    setNotes(record.notes || '');
    if (record.date) {
      const d = new Date(record.date);
      setDate(`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`);
    }
  };

  const cancelEdit = () => {
    setEditingHealthId(null);
    setActivityType('');
    setDuration('');
    setCalories('');
    setNotes('');
    setDate('');
  };

  const deleteRecord = async (id) => {
    try {
      await api.delete(`health/${id}`);
      setHealthData(healthData.filter(h => h._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const activities = healthData.filter(h => h.type === 'activity');
  const totalDuration = activities.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalCalories = activities.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const totalCount = activities.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Health Management</Text>
          <Text style={styles.headerSubtitle}>Track your physical activities and wellness</Text>
        </View>
        <View style={styles.headerIconContainer}>
           <MaterialCommunityIcons name="heart-pulse" size={40} color="#6C63FF" />
        </View>
      </View>

      {/* ── Metric Cards ── */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: '#fff0f0' }]}>
            <Ionicons name="time" size={20} color="#ff7675" />
          </View>
          <View>
            <Text style={styles.metricLabel}>Total Activity Time</Text>
            <Text style={styles.metricValue}>{totalDuration} minutes</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: '#fff5f0' }]}>
            <MaterialCommunityIcons name="fire" size={20} color="#fd9644" />
          </View>
          <View>
            <Text style={styles.metricLabel}>Calories Burned</Text>
            <Text style={styles.metricValue}>{totalCalories} cal</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: '#f0eeff' }]}>
            <Ionicons name="calendar" size={20} color="#6C63FF" />
          </View>
          <View>
            <Text style={styles.metricLabel}>Total Activities</Text>
            <Text style={styles.metricValue}>{totalCount}</Text>
          </View>
        </View>
      </View>

      {/* ── Log New Activity Form ── */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="add-circle" size={20} color="#1a1a2e" />
          <Text style={styles.cardHeader}>Log New Activity</Text>
        </View>
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 2 }]}>
            <Text style={styles.label}>Activity Type</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Swimming, Running"
              value={activityType}
              onChangeText={setActivityType}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter duration"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Calories Burned</Text>
            <TextInput
              style={styles.input}
              placeholder="Estimated calories"
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputWithIcon}
                placeholder="mm/dd/yyyy"
                value={date}
                onChangeText={setDate}
              />
              <Ionicons name="calendar-outline" size={18} color="#666" />
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional notes about the activity"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.logButton} onPress={addActivity}>
            <Ionicons name={editingHealthId ? "save" : "add"} size={18} color="#fff" />
            <Text style={styles.logButtonText}>{editingHealthId ? "Update Activity" : "Log Activity"}</Text>
          </TouchableOpacity>
          {editingHealthId && (
            <TouchableOpacity style={[styles.logButton, { backgroundColor: '#94a3b8' }]} onPress={cancelEdit}>
              <Text style={styles.logButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Activity History Table ── */}
      <View style={[styles.card, { marginTop: 20 }]}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="time-outline" size={20} color="#1a1a2e" />
          <Text style={styles.cardHeader}>Activity History</Text>
        </View>

        <View style={styles.tableLabelRow}>
          <Text style={[styles.tableLabel, { flex: 2 }]}>DATE</Text>
          <Text style={[styles.tableLabel, { flex: 2 }]}>ACTIVITY</Text>
          <Text style={[styles.tableLabel, { flex: 1.5, textAlign: 'center' }]}>DURATION</Text>
          <Text style={[styles.tableLabel, { flex: 1.5, textAlign: 'center' }]}>CALORIES</Text>
          <Text style={[styles.tableLabel, { flex: 2 }]}>NOTES</Text>
          <Text style={[styles.tableLabel, { flex: 1, textAlign: 'right' }]}>ACTIONS</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6C63FF" style={{ marginVertical: 30 }} />
        ) : activities.length === 0 ? (
          <Text style={styles.noData}>No activity history found. Start logging!</Text>
        ) : (
          activities.map((item) => (
            <View key={item._id} style={styles.tableDataRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: '700', color: '#1a1a2e' }]}>{item.activityType}</Text>
              <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center' }]}>{item.duration} min</Text>
              <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center' }]}>{item.calories} cal</Text>
              <Text style={[styles.tableCell, { flex: 2, fontSize: 11, color: '#94a3b8' }]} numberOfLines={1}>
                {item.notes || '-'}
              </Text>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                <TouchableOpacity onPress={() => startEdit(item)}>
                  <Ionicons name="create-outline" size={18} color="#6C63FF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteRecord(item._id)}>
                  <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0eeff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Metrics ── */
  metricsGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
  },

  /* ── Card ── */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
    marginLeft: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingRight: 12,
  },
  inputWithIcon: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  logButton: {
    backgroundColor: '#00d084',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 25,
  },
  logButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 6,
  },

  /* ── Table ── */
  tableLabelRow: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 5,
  },
  tableLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCell: {
    fontSize: 13,
    color: '#64748b',
  },
  noData: {
    textAlign: 'center',
    color: '#94a3b8',
    paddingVertical: 30,
    fontSize: 14,
  }
});

export default HealthScreen;
