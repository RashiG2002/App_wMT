import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import api from '../api/axios';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

const ReportsScreen = () => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('All Time');
  const [data, setData] = useState({
    finance: [],
    tasks: [],
    health: [],
    skills: [],
    budgets: []
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [finRes, taskRes, healthRes, skillRes, budgetRes] = await Promise.all([
        api.get('/finance'),
        api.get('/tasks'),
        api.get('/health'),
        api.get('/skills'),
        api.get('/budgets')
      ]);
      
      setData({
        finance: finRes.data,
        tasks: taskRes.data,
        health: healthRes.data,
        skills: skillRes.data,
        budgets: budgetRes.data
      });
    } catch (e) {
      console.error('Reports fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchAllData();
  }, [isFocused]);

  // --- Calculations ---
  const totalIncome = data.finance.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = data.finance.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const totalActivityMin = data.health.filter(h => h.type === 'activity').reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const completedTasks = data.tasks.filter(t => t.status === 'Completed').length;
  const taskCompletionRate = data.tasks.length > 0 ? (completedTasks / data.tasks.length) * 100 : 0;

  const expenseCategories = data.finance
    .filter(f => f.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const activityTypes = data.health
    .filter(h => h.type === 'activity')
    .reduce((acc, curr) => {
      acc[curr.activityType] = (acc[curr.activityType] || 0) + curr.duration;
      return acc;
    }, {});

  const budgetWatchlist = data.budgets.map(b => {
    const spent = data.finance
      .filter(f => f.type === 'expense' && f.category.toLowerCase() === b.category.toLowerCase())
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { ...b, spent, percent: b.limit > 0 ? (spent / b.limit) * 100 : 0 };
  }).filter(b => b.percent > 70); // Show only if > 70% used

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* ── Header Section ── */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Analysis Reports</Text>
          <View style={styles.allTimeTag}>
            <Text style={styles.allTimeTagText}>{period}</Text>
          </View>
        </View>
        <Text style={styles.headerDesc}>Decision-focused analytics to help you optimize your life performance.</Text>
        
        {/* Filters */}
        <View style={styles.filterRow}>
          {['All Time', 'Daily', 'Weekly', 'Monthly'].map(p => (
            <TouchableOpacity 
              key={p} 
              style={[styles.filterBtn, period === p && styles.filterBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.filterBtnText, period === p && styles.filterBtnTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Summary Statistics ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={styles.summaryValue}>Rs. {totalIncome.toLocaleString()}</Text>
          <Text style={styles.summarySub}>+12.5% vs last month</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={[styles.summaryValue, { color: '#ff7675' }]}>Rs. {totalExpense.toLocaleString()}</Text>
          <Text style={styles.summarySub}>-2.4% vs last month</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Savings Rate</Text>
          <Text style={[styles.summaryValue, { color: '#00d084' }]}>{savingsRate.toFixed(1)}%</Text>
          <Text style={styles.summarySub}>Healthy range</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Activity Min</Text>
          <Text style={styles.summaryValue}>{totalActivityMin}m</Text>
          <Text style={styles.summarySub}>Top 15% of users</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Task Completion</Text>
          <Text style={styles.summaryValue}>{taskCompletionRate.toFixed(0)}%</Text>
          <Text style={styles.summarySub}>Productive week</Text>
        </View>
      </ScrollView>

      {/* ── Main Reports Grid ── */}
      <View style={styles.reportsGrid}>
        
        {/* Financial Summary */}
        <View style={styles.reportItem}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Financial Summary</Text>
            <Ionicons name="cash-outline" size={18} color="#6C63FF" />
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Income</Text>
            <Text style={styles.detailVal}>Rs. {totalIncome.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Savings</Text>
            <Text style={[styles.detailVal, { color: '#00d084' }]}>Rs. {savings.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Net Cash Flow</Text>
            <Text style={styles.detailVal}>Rs. {savings.toFixed(2)}</Text>
          </View>
        </View>

        {/* Expenses by Category */}
        <View style={styles.reportItem}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Expenses by Category</Text>
            <Ionicons name="pie-chart-outline" size={18} color="#6C63FF" />
          </View>
          {Object.entries(expenseCategories).length === 0 ? (
            <Text style={styles.noDataText}>No expenses logged yet.</Text>
          ) : (
            Object.entries(expenseCategories).map(([cat, amt]) => (
              <View key={cat} style={styles.categoryRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catLabel}>{cat}</Text>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${(amt / totalExpense) * 100}%`, backgroundColor: '#ff7675' }]} />
                  </View>
                </View>
                <Text style={styles.catAmt}>Rs. {amt.toFixed(0)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Activity Breakdown */}
        <View style={styles.reportItem}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Activity Breakdown</Text>
            <Ionicons name="fitness-outline" size={18} color="#6C63FF" />
          </View>
          {Object.entries(activityTypes).length === 0 ? (
            <Text style={styles.noDataText}>No activities logged yet.</Text>
          ) : (
            Object.entries(activityTypes).map(([type, mins]) => (
              <View key={type} style={styles.categoryRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catLabel}>{type}</Text>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${(mins / totalActivityMin) * 100}%`, backgroundColor: '#6C63FF' }]} />
                  </View>
                </View>
                <Text style={styles.catAmt}>{mins}m</Text>
              </View>
            ))
          )}
        </View>

        {/* Budget Watchlist */}
        <View style={styles.reportItem}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Budget Watchlist</Text>
            <Ionicons name="alert-circle-outline" size={18} color="#fd9644" />
          </View>
          {budgetWatchlist.length === 0 ? (
            <Text style={styles.noDataText}>All budgets are within safe limits.</Text>
          ) : (
            budgetWatchlist.map(b => (
              <View key={b._id} style={styles.watchlistRow}>
                <Text style={styles.watchLabel}>{b.category}</Text>
                <Text style={[styles.watchPercent, { color: b.percent > 95 ? '#ff7675' : '#fd9644' }]}>
                  {Math.round(b.percent)}% Used
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Task Performance */}
        <View style={styles.reportItem}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Task Performance</Text>
            <Ionicons name="checkmark-done-circle-outline" size={18} color="#6C63FF" />
          </View>
          <View style={styles.taskMetricGrid}>
            <View style={styles.taskMetric}>
              <Text style={styles.tmVal}>{completedTasks}</Text>
              <Text style={styles.tmLabel}>Completed</Text>
            </View>
            <View style={styles.taskMetric}>
              <Text style={styles.tmVal}>{data.tasks.length - completedTasks}</Text>
              <Text style={styles.tmLabel}>Pending</Text>
            </View>
            <View style={styles.taskMetric}>
              <Text style={[styles.tmVal, { color: '#ff7675' }]}>0</Text>
              <Text style={styles.tmLabel}>Overdue</Text>
            </View>
          </View>
        </View>

        {/* Guided Tutorials */}
        <View style={styles.reportItem}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Guided Tutorials</Text>
            <Ionicons name="play-circle-outline" size={18} color="#6C63FF" />
          </View>
          <TouchableOpacity style={styles.tutorialItem}>
            <Ionicons name="school-outline" size={16} color="#666" />
            <Text style={styles.tutorialText}>Mastering Personal Finance 101</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tutorialItem}>
            <Ionicons name="bulb-outline" size={16} color="#666" />
            <Text style={styles.tutorialText}>10 Tips for Better Time Management</Text>
          </TouchableOpacity>
        </View>

        {/* Personalized Recommendations */}
        <View style={[styles.reportItem, { backgroundColor: '#f0eeff', borderColor: '#6C63FF', borderWidth: 0.5 }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: '#6C63FF' }]}>Personalized Recommendations</Text>
            <Ionicons name="star" size={18} color="#6C63FF" />
          </View>
          <Text style={styles.recText}>• Reduce 'Dining Out' by 15% to reach your savings goal faster.</Text>
          <Text style={styles.recText}>• Most productive time: 8 AM - 10 AM. Schedule deep work here.</Text>
          <Text style={styles.recText}>• Your sleep consistency improved! Try keeping it for 7 days.</Text>
        </View>

        {/* Period Comparison */}
        <View style={styles.reportItem}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Period Comparison (vs last 30d)</Text>
            <Ionicons name="git-compare-outline" size={18} color="#6C63FF" />
          </View>
          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Income</Text>
            <Text style={[styles.compVal, { color: '#00d084' }]}>+ Rs. 1,200 (↑ 8%)</Text>
          </View>
          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Expenses</Text>
            <Text style={[styles.compVal, { color: '#ff7675' }]}>- Rs. 450 (↓ 3%)</Text>
          </View>
          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Tasks Done</Text>
            <Text style={[styles.compVal, { color: '#00d084' }]}>+ 12 (↑ 15%)</Text>
          </View>
        </View>

        {/* Analysis Insights */}
        <View style={[styles.reportItem, { backgroundColor: '#1a1a2e' }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: '#fff' }]}>Analysis Insights</Text>
            <Ionicons name="analytics" size={18} color="#00d084" />
          </View>
          <Text style={[styles.insightText, { color: '#e2e8f0' }]}>
            Your financial health is currently "Excellent". You have managed to save {savingsRate.toFixed(1)}% of your income this month. 
            However, your activity levels dropped slightly on weekends. Consider a short Sunday morning run to maintain consistency.
          </Text>
        </View>

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
    paddingBottom: 40,
  },
  headerSection: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  allTimeTag: {
    backgroundColor: '#f0eeff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  allTimeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C63FF',
  },
  headerDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterBtnActive: {
    backgroundColor: '#1a1a2e',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  filterBtnTextActive: {
    color: '#fff',
  },

  summaryScroll: {
    paddingLeft: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginRight: 15,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  summarySub: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },

  reportsGrid: {
    padding: 20,
    gap: 20,
  },
  reportItem: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  progressBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    flex: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  catAmt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a2e',
    marginLeft: 15,
    width: 70,
    textAlign: 'right',
  },
  watchlistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  watchLabel: {
    fontSize: 13,
    color: '#1a1a2e',
    fontWeight: '600',
  },
  watchPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  taskMetricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskMetric: {
    alignItems: 'center',
    flex: 1,
  },
  tmVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6C63FF',
  },
  tmLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  tutorialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 10,
  },
  tutorialText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  recText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 8,
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  compLabel: {
    fontSize: 13,
    color: '#475569',
  },
  compVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 22,
  },
  noDataText: {
    textAlign: 'center',
    color: '#94a3b8',
    paddingVertical: 10,
    fontSize: 13,
  }
});

export default ReportsScreen;
