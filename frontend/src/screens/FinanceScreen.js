import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Platform, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../api/axios';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

const FinanceScreen = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(false);

  // Income form state
  const [incAmount, setIncAmount] = useState('');
  const [incSource, setIncSource] = useState('');
  const [incDate, setIncDate] = useState('');
  const [incDescription, setIncDescription] = useState('');

  // Expense form state
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [expDate, setExpDate] = useState('');
  const [expDescription, setExpDescription] = useState('');

  // Budget form state
  const [budgets, setBudgets] = useState([]);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  const fetchFinances = async () => {
    try {
      setLoading(true);
      const res = await api.get('/finance');
      setFinances(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchFinances();
      fetchBudgets();
    }
  }, [isFocused]);

  const addTransaction = async (type) => {
    const amount      = type === 'income' ? incAmount      : expAmount;
    const category    = type === 'income' ? incSource      : expCategory;
    const date        = type === 'income' ? incDate        : expDate;
    const description = type === 'income' ? incDescription : expDescription;

    if (!amount || !category) return;
    try {
      const payload = {
        amount: Number(amount),
        category,
        type,
        ...(date        ? { date }        : {}),
        ...(description ? { description } : {}),
      };
      const res = await api.post('/finance', payload);
      
      // Check if expense exceeds budget
      if (type === 'expense') {
        const budget = budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
        if (budget) {
          const spent = getCategorySpent(category) + Number(amount);
          if (spent > budget.limit) {
            const over = spent - budget.limit;
            Alert.alert(
              "🚨 Budget Alert!",
              `Warning: Your spending on "${category}" has exceeded the monthly limit of Rs. ${budget.limit.toFixed(2)} by Rs. ${over.toFixed(2)}.`
            );
          }
        }
      }

      setFinances([res.data, ...finances]);
      if (type === 'income') {
        setIncAmount('');
        setIncSource('');
        setIncDate('');
        setIncDescription('');
      } else {
        setExpAmount('');
        setExpCategory('');
        setExpDate('');
        setExpDescription('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.delete(`/finance/${id}`);
      setFinances(finances.filter(f => f._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const addBudget = async () => {
    if (!budgetCategory || !budgetLimit) return;
    try {
      const res = await api.post('/budgets', {
        category: budgetCategory,
        limit: Number(budgetLimit),
        month: new Date().toISOString().slice(0, 7)
      });
      setBudgets([res.data, ...budgets]);
      setBudgetCategory('');
      setBudgetLimit('');
    } catch (e) {
      console.error(e);
    }
  };

  const deleteBudget = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      setBudgets(budgets.filter(b => b._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const getCategorySpent = (category) => {
    return finances
      .filter(f => f.type === 'expense' && f.category.toLowerCase() === category.toLowerCase())
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const totalIncome = finances.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = finances.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const renderTransactionsTab = () => (
    <View>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: '#4cd137' }]}>
            <Ionicons name="arrow-up" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.metricTitle}>Total Income</Text>
            <Text style={styles.metricValue}>Rs. {totalIncome.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: '#ff7979' }]}>
            <Ionicons name="arrow-down" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.metricTitle}>Total Expenses</Text>
            <Text style={styles.metricValue}>Rs. {totalExpense.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: '#a29bfe' }]}>
            <MaterialCommunityIcons name="scale-balance" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.metricTitle}>Balance</Text>
            <Text style={styles.metricValue}>Rs. {balance.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.formsGrid}>
        {/* ── Add Income Form ── */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={[styles.formIconBox, { backgroundColor: '#e8faf0' }]}>
              <Ionicons name="add-circle" size={20} color="#2ecc71" />
            </View>
            <Text style={styles.formTitle}>Add Income</Text>
          </View>

          <Text style={styles.inputLabel}>Amount (Rs.)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="cash-outline" size={16} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter amount"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              value={incAmount}
              onChangeText={setIncAmount}
            />
          </View>

          <Text style={styles.inputLabel}>Source</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="briefcase-outline" size={16} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="e.g., Salary, Freelance"
              placeholderTextColor="#bbb"
              value={incSource}
              onChangeText={setIncSource}
            />
          </View>

          <Text style={styles.inputLabel}>Date</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="calendar-outline" size={16} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#bbb"
              value={incDate}
              onChangeText={setIncDate}
            />
          </View>

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional description"
            placeholderTextColor="#bbb"
            value={incDescription}
            onChangeText={setIncDescription}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity style={styles.btnIncome} onPress={() => addTransaction('income')}>
            <Ionicons name="add" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnIncomeText}>Add Income</Text>
          </TouchableOpacity>
        </View>

        {/* ── Add Expense Form ── */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={[styles.formIconBox, { backgroundColor: '#fff0f0' }]}>
              <Ionicons name="remove-circle" size={20} color="#e74c3c" />
            </View>
            <Text style={styles.formTitle}>Add Expense</Text>
          </View>

          <Text style={styles.inputLabel}>Amount (Rs.)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="cash-outline" size={16} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter amount"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              value={expAmount}
              onChangeText={setExpAmount}
            />
          </View>

          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="pricetag-outline" size={16} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="e.g., Food, Transport"
              placeholderTextColor="#bbb"
              value={expCategory}
              onChangeText={setExpCategory}
            />
          </View>

          <Text style={styles.inputLabel}>Date</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="calendar-outline" size={16} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#bbb"
              value={expDate}
              onChangeText={setExpDate}
            />
          </View>

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional description"
            placeholderTextColor="#bbb"
            value={expDescription}
            onChangeText={setExpDescription}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity style={styles.btnExpense} onPress={() => addTransaction('expense')}>
            <Ionicons name="remove" size={16} color="#ff7675" style={{ marginRight: 6 }} />
            <Text style={styles.btnExpenseText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listCard}>
        <View style={styles.formHeader}>
          <Ionicons name="list" size={20} color="#111" />
          <Text style={styles.formTitle}>Recent Transactions</Text>
        </View>
        <View style={styles.tableHeader}>
           <Text style={[styles.th, {flex: 2}]}>DATE</Text>
           <Text style={[styles.th, {flex: 3}]}>CATEGORY</Text>
           <Text style={[styles.th, {flex: 2, textAlign: 'right'}]}>AMOUNT</Text>
           <Text style={[styles.th, {flex: 1, textAlign: 'center'}]}>ACTION</Text>
        </View>
        {loading ? <ActivityIndicator size="large" color="#6C63FF" style={{marginTop: 20}} /> : (
          finances.map(item => (
            <View key={item._id} style={styles.tableRow}>
              <Text style={[styles.td, {flex: 2}]}>{new Date(item.date).toLocaleDateString()}</Text>
              <Text style={[styles.td, {flex: 3, fontWeight: '600'}]}>{item.category}</Text>
              <Text style={[styles.td, {flex: 2, textAlign: 'right', fontWeight: 'bold', color: item.type === 'income' ? '#2ecc71' : '#e74c3c' }]}>
                {item.type === 'income' ? '+' : '-'}Rs. {item.amount.toFixed(2)}
              </Text>
              <View style={{flex: 1, alignItems: 'center'}}>
                <TouchableOpacity onPress={() => deleteTransaction(item._id)}>
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderBudgetsTab = () => (
    <View>
      <View style={styles.budgetOverviewCard}>
        <View style={styles.budgetHeaderRow}>
          <Text style={styles.budgetOverviewTitle}>Monthly Overview</Text>
          <Text style={styles.budgetMonthText}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
        </View>
        <View style={styles.budgetMetricsRow}>
          <View style={styles.budgetMetricItem}>
            <Text style={styles.budgetMetricLabel}>Total Income</Text>
            <Text style={styles.budgetMetricVal}>Rs. {totalIncome.toFixed(2)}</Text>
          </View>
          <View style={styles.budgetMetricItem}>
            <Text style={styles.budgetMetricLabel}>Total Expenses</Text>
            <Text style={styles.budgetMetricVal}>Rs. {totalExpense.toFixed(2)}</Text>
          </View>
          <View style={styles.budgetMetricItem}>
            <Text style={styles.budgetMetricLabel}>Balance</Text>
            <Text style={styles.budgetMetricVal}>Rs. {balance.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Active Budgets List */}
      <View style={styles.listCard}>
        <View style={styles.formHeader}>
          <Ionicons name="wallet-outline" size={20} color="#111" />
          <Text style={styles.formTitle}>Active Budgets</Text>
        </View>
        {budgets.length === 0 ? (
          <Text style={{ color: '#888', textAlign: 'center', padding: 10 }}>No active budgets set.</Text>
        ) : (
          budgets.map(budget => {
            const spent = getCategorySpent(budget.category);
            const progress = budget.limit > 0 ? Math.min(spent / budget.limit, 1) : 0;
            return (
              <View key={budget._id} style={styles.budgetItem}>
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetName}>{budget.category}</Text>
                  <TouchableOpacity onPress={() => deleteBudget(budget._id)}>
                    <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: progress > 0.9 ? '#e74c3c' : '#6C63FF' }]} />
                </View>
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetStats}>Rs. {spent.toFixed(2)} spent of Rs. {budget.limit.toFixed(2)}</Text>
                  <Text style={[styles.budgetPercent, { color: progress > 0.9 ? '#e74c3c' : '#6C63FF' }]}>{Math.round(progress * 100)}%</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.listCard}>
         <View style={styles.formHeader}>
            <Ionicons name="add-circle" size={20} color="#111" />
            <Text style={styles.formTitle}>Create New Budget</Text>
          </View>
          <View style={{flexDirection: isWeb ? 'row' : 'column', gap: 15}}>
             <View style={{flex: 1}}>
                <Text style={styles.inputLabel}>Category</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Select Category" 
                  value={budgetCategory}
                  onChangeText={setBudgetCategory}
                />
             </View>
             <View style={{flex: 1}}>
                <Text style={styles.inputLabel}>Monthly Limit (Rs.)</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter limit" 
                  keyboardType="numeric"
                  value={budgetLimit}
                  onChangeText={setBudgetLimit}
                />
             </View>
          </View>
          <TouchableOpacity 
            style={[styles.btnIncome, {backgroundColor: '#111', alignSelf: 'flex-start', marginTop: 15}]}
            onPress={addBudget}
          >
            <Text style={styles.btnIncomeText}>Create Budget</Text>
          </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'transactions' && styles.tabBtnActive]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'transactions' && styles.tabBtnTextActive]}>Transactions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'budgets' && styles.tabBtnActive]}
          onPress={() => setActiveTab('budgets')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'budgets' && styles.tabBtnTextActive]}>Budgets</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'transactions' ? renderTransactionsTab() : renderBudgetsTab()}

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
    paddingTop: 20,
    paddingBottom: 40,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 25,
    padding: 4,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabBtnTextActive: {
    color: '#111',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: isWeb ? '32%' : '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  metricTitle: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  formsGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  formIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  btnIncome: {
    backgroundColor: '#00e676',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  btnIncomeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  btnExpense: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ff7675',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  btnExpenseText: {
    color: '#ff7675',
    fontWeight: '700',
    fontSize: 14,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 10,
  },
  th: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  td: {
    fontSize: 14,
    color: '#334155',
  },
  budgetOverviewCard: {
    backgroundColor: '#5b6cde',
    borderRadius: 16,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#5b6cde',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetOverviewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  budgetMonthText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  budgetMetricsRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 15,
  },
  budgetMetricItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 10,
  },
  budgetMetricLabel: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  budgetMetricVal: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  budgetDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  budgetDetailName: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  budgetDetailVal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  budgetItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  budgetStats: {
    fontSize: 12,
    color: '#666',
  },
  budgetPercent: {
    fontSize: 12,
    fontWeight: '700',
  }
});

export default FinanceScreen;
