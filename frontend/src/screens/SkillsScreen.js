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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../api/axios';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

const SkillsScreen = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  // Add Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Beginner');
  const [newTargetHours, setNewTargetHours] = useState('');

  // Practice Log State for existing skills
  const [logFormState, setLogFormState] = useState({});

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/skills');
      if (res.data && Array.isArray(res.data)) {
        setSkills(res.data);
      } else {
        setSkills([]);
      }
    } catch (e) {
      console.error('Fetch skills error:', e);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchSkills();
    }
  }, [isFocused]);

  const addSkill = async () => {
    if (!newSkillName.trim()) {
      alert("Please enter a skill name");
      return;
    }
    try {
      const payload = {
        skillName: newSkillName,
        level: newSkillLevel,
        targetHours: Number(newTargetHours) || 0
      };
      const res = await api.post('/skills', payload);
      setSkills(prev => [res.data, ...prev]);
      
      // Reset form
      setNewSkillName('');
      setNewSkillLevel('Beginner');
      setNewTargetHours('');
    } catch (e) {
      console.error('Add skill error:', e);
      alert("Failed to add skill.");
    }
  };

  const deleteSkill = async (id) => {
    try {
      await api.delete(`/skills/${id}`);
      setSkills(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      console.error('Delete skill error:', e);
    }
  };

  const updateLogForm = (skillId, field, value) => {
    setLogFormState(prev => ({
      ...prev,
      [skillId]: {
        ...(prev[skillId] || { hours: '', date: '', description: '' }),
        [field]: value
      }
    }));
  };

  const logPractice = async (skillId) => {
    const form = logFormState[skillId];
    if (!form || !form.hours) {
      alert("Please enter practice hours");
      return;
    }
    if (isNaN(form.hours) || Number(form.hours) <= 0) {
      alert("Please enter valid positive hours");
      return;
    }

    try {
      const payload = {
        hours: Number(form.hours),
        date: form.date ? new Date(form.date) : new Date(),
        description: form.description
      };
      const res = await api.post(`/skills/${skillId}/practice`, payload);
      setSkills(prev => prev.map(s => s._id === skillId ? res.data : s));
      
      // Reset log form for this skill
      updateLogForm(skillId, 'hours', '');
      updateLogForm(skillId, 'date', '');
      updateLogForm(skillId, 'description', '');
    } catch (e) {
      console.error('Log practice error:', e);
      alert("Failed to log practice.");
    }
  };

  const getTotalPracticed = (skill) => {
    if (!skill || !skill.practiceLog) return 0;
    return skill.practiceLog.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0);
  };

  const safeSkills = Array.isArray(skills) ? skills : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Skill Development</Text>
          <Text style={styles.headerSubtitle}>Track your learning journey and skill progress</Text>
        </View>
        <View style={styles.headerIconContainer}>
           <MaterialCommunityIcons name="book-open-page-variant" size={35} color="#6C63FF" />
        </View>
      </View>

      {/* ── Metric Cards ── */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: '#f0eeff' }]}>
            <Ionicons name="book" size={18} color="#6C63FF" />
          </View>
          <View>
            <Text style={styles.metricLabel}>Total Skills</Text>
            <Text style={styles.metricValue}>{safeSkills.length}</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: '#e8faf0' }]}>
            <Ionicons name="time" size={18} color="#2ecc71" />
          </View>
          <View>
            <Text style={styles.metricLabel}>Skills Tracked</Text>
            <Text style={styles.metricValue}>{safeSkills.length} skills</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: '#e0fcfc' }]}>
            <Ionicons name="disc-outline" size={18} color="#00d084" />
          </View>
          <View>
            <Text style={styles.metricLabel}>Active Goals</Text>
            <Text style={styles.metricValue}>{safeSkills.filter(s => (s.targetHours || 0) > 0).length}</Text>
          </View>
        </View>
      </View>

      {/* ── Add New Skill Form ── */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="add-circle" size={20} color="#1a1a2e" />
          <Text style={styles.cardHeader}>Add New Skill</Text>
        </View>
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 2 }]}>
            <Text style={styles.label}>Skill Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Python, Guitar, Photography"
              value={newSkillName}
              onChangeText={setNewSkillName}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1.5 }]}>
            <Text style={styles.label}>Current Level</Text>
            <View style={styles.input}>
              <Text style={{ color: '#333' }}>{newSkillLevel}</Text>
            </View>
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Target Hours</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 100"
              keyboardType="numeric"
              value={newTargetHours}
              onChangeText={setNewTargetHours}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addSkill}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Add Skill</Text>
        </TouchableOpacity>
      </View>

      {/* ── Your Skills List ── */}
      <View style={{ marginTop: 30 }}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="list" size={20} color="#1a1a2e" />
          <Text style={styles.cardHeader}>Your Skills</Text>
        </View>

        {loading && safeSkills.length === 0 ? (
          <ActivityIndicator size="large" color="#6C63FF" style={{ marginVertical: 30 }} />
        ) : safeSkills.length === 0 ? (
          <Text style={styles.noData}>No skills found. Start adding your goals!</Text>
        ) : (
          safeSkills.map((skill) => {
            if (!skill || !skill._id) return null;
            const practiced = getTotalPracticed(skill);
            const currentForm = logFormState[skill._id] || { hours: '', date: '', description: '' };
            
            return (
              <View key={skill._id} style={styles.skillCard}>
                <View style={styles.skillCardHeader}>
                  <View>
                    <Text style={styles.skillNameText}>{skill.skillName}</Text>
                    <View style={styles.levelRow}>
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelBadgeText}>{(skill.level || 'Beginner').toUpperCase()}</Text>
                      </View>
                      <Text style={styles.targetText}>Target: {skill.targetHours || 0} hrs</Text>
                    </View>
                  </View>
                  <View style={styles.practicedInfo}>
                    <Ionicons name="time-outline" size={14} color="#6C63FF" />
                    <Text style={styles.practicedText}>{practiced.toFixed(1)} hours practiced</Text>
                  </View>
                </View>

                {/* Log Practice Subform */}
                <View style={styles.logPracticeRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.miniLabel}>Log Practice (hours)</Text>
                    <TextInput
                      style={styles.miniInput}
                      placeholder="Hours"
                      keyboardType="numeric"
                      value={currentForm.hours}
                      onChangeText={(val) => updateLogForm(skill._id, 'hours', val)}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1.5 }]}>
                    <Text style={styles.miniLabel}>Date</Text>
                    <View style={styles.miniInputWrapper}>
                      <TextInput
                        style={styles.miniInputText}
                        placeholder="mm/dd/yyyy"
                        value={currentForm.date}
                        onChangeText={(val) => updateLogForm(skill._id, 'date', val)}
                      />
                      <Ionicons name="calendar-outline" size={14} color="#aaa" />
                    </View>
                  </View>
                  <View style={[styles.formGroup, { flex: 2 }]}>
                    <Text style={styles.miniLabel}>What did you practice?</Text>
                    <TextInput
                      style={styles.miniInput}
                      placeholder="Brief description"
                      value={currentForm.description}
                      onChangeText={(val) => updateLogForm(skill._id, 'description', val)}
                    />
                  </View>
                  <TouchableOpacity 
                    style={styles.logBtn} 
                    onPress={() => logPractice(skill._id)}
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={styles.logBtnText}>Log</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.deleteSkillBtn} 
                  onPress={() => deleteSkill(skill._id)}
                >
                  <Ionicons name="trash-outline" size={14} color="#e74c3c" />
                  <Text style={styles.deleteSkillText}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          })
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
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#1a1a2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 6,
  },
  skillCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eef2f6',
  },
  skillCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  skillNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 10,
  },
  levelBadge: {
    backgroundColor: '#fff7e6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffd591',
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fa8c16',
  },
  targetText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  practicedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  practicedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6C63FF',
  },
  logPracticeRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 12,
    alignItems: isWeb ? 'flex-end' : 'stretch',
    backgroundColor: '#fcfcfd',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f4f8',
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  miniInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    color: '#333',
  },
  miniInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingRight: 8,
  },
  miniInputText: {
    flex: 1,
    padding: 8,
    fontSize: 13,
    color: '#333',
  },
  logBtn: {
    backgroundColor: '#00d084',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 0,
  },
  logBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 4,
  },
  deleteSkillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fff1f0',
  },
  deleteSkillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e74c3c',
    marginLeft: 4,
  },
  noData: {
    textAlign: 'center',
    color: '#94a3b8',
    paddingVertical: 30,
    fontSize: 14,
  }
});

export default SkillsScreen;
