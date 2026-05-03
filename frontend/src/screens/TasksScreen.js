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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axios';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

const TasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('Medium');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchTasks();
    }
  }, [isFocused]);

  const addTask = async () => {
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }
    try {
      const payload = {
        title,
        description,
        priority,
        location,
        time,
        dueDate: date ? new Date(date) : undefined
      };
      const res = await api.post('/tasks', payload);
      setTasks([res.data, ...tasks]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setLocation('');
      setPriority('Medium');
    } catch (e) {
      console.error(e);
      alert("Failed to add task.");
    }
  };

  const toggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* ── Add New Task Form ── */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Add New Task</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task title"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter task description"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Date *</Text>
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
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Time *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputWithIcon}
                placeholder="--:-- --"
                value={time}
                onChangeText={setTime}
              />
              <Ionicons name="time-outline" size={18} color="#666" />
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter task location (e.g., Park, Office)"
              value={location}
              onChangeText={setLocation}
            />
            <Ionicons name="location-outline" size={18} color="#666" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority *</Text>
          <View style={styles.priorityRow}>
            {['Low', 'Medium', 'High'].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityBtn,
                  priority === p && styles.priorityBtnActive
                ]}
                onPress={() => setPriority(p)}
              >
                <View style={[styles.radio, priority === p && styles.radioActive]} />
                <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* ── Task List Table ── */}
      <View style={[styles.card, { marginTop: 20 }]}>
        <View style={styles.tableHeaderRow}>
          <Ionicons name="list" size={20} color="#1a1a2e" />
          <Text style={styles.cardHeader}>Task List</Text>
        </View>

        {/* Table Header Labels */}
        <View style={styles.tableLabelRow}>
          <Text style={[styles.tableLabel, { flex: 3 }]}>TITLE</Text>
          <Text style={[styles.tableLabel, { flex: 1.5, textAlign: 'center' }]}>PRIORITY</Text>
          <Text style={[styles.tableLabel, { flex: 1.5, textAlign: 'center' }]}>STATUS</Text>
          <Text style={[styles.tableLabel, { flex: 2, textAlign: 'center' }]}>DUE</Text>
          <Text style={[styles.tableLabel, { flex: 1.5, textAlign: 'right' }]}>ACTIONS</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6C63FF" style={{ marginVertical: 30 }} />
        ) : tasks.length === 0 ? (
          <Text style={styles.noTasks}>No tasks available. Add one above!</Text>
        ) : (
          tasks.map((item) => (
            <View key={item._id} style={styles.tableDataRow}>
              <View style={{ flex: 3 }}>
                <Text style={styles.taskTitleText}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.taskSubtext} numberOfLines={1}>{item.description}</Text>
                ) : null}
              </View>
              
              <View style={{ flex: 1.5, alignItems: 'center' }}>
                <Text style={styles.priorityBadge}>{item.priority || 'Medium'}</Text>
              </View>

              <View style={{ flex: 1.5, alignItems: 'center' }}>
                <Text style={[styles.statusBadge, item.status === 'Completed' && styles.statusCompleted]}>
                  {(item.status || 'Pending').toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 2, alignItems: 'center' }}>
                <Text style={styles.dueText}>
                  {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => toggleStatus(item)} style={styles.actionBtn}>
                  <Ionicons 
                    name={item.status === 'Completed' ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={item.status === 'Completed' ? "#2ecc71" : "#6C63FF"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item._id)} style={styles.actionBtn}>
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
  cardHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 20,
    marginLeft: 8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
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
    height: 100,
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
  row: {
    flexDirection: 'row',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  priorityBtnActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#f0eeff',
  },
  radio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#666',
    marginRight: 8,
  },
  radioActive: {
    borderColor: '#6C63FF',
    borderWidth: 4,
    backgroundColor: '#fff',
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  priorityTextActive: {
    color: '#6C63FF',
  },
  addButton: {
    backgroundColor: '#00d084',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 25,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 6,
  },

  /* ── Table Styles ── */
  tableLabelRow: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 5,
  },
  tableLabel: {
    fontSize: 11,
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
  taskTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  taskSubtext: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  priorityBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  statusCompleted: {
    color: '#2ecc71',
    backgroundColor: '#e8faf0',
  },
  dueText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  actionRow: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionBtn: {
    padding: 4,
  },
  noTasks: {
    textAlign: 'center',
    color: '#94a3b8',
    paddingVertical: 30,
    fontSize: 14,
  }
});

export default TasksScreen;
