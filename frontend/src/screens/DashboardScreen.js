import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../api/axios';
import { useIsFocused } from '@react-navigation/native';
import { PieChart } from "react-native-chart-kit";

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    finance: [],
    tasks: [],
    health: [],
    skills: []
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [finRes, taskRes, healthRes, skillRes] = await Promise.all([
        api.get('finance'),
        api.get('tasks'),
        api.get('health'),
        api.get('skills')
      ]);
      
      setData({
        finance: finRes.data,
        tasks: taskRes.data,
        health: healthRes.data,
        skills: skillRes.data
      });
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchDashboardData();
    }
  }, [isFocused]);

  // Calculations
  const totalIncome = data.finance.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = data.finance.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;
  const pendingTasks = data.tasks.filter(t => t.status !== 'Completed').length;
  const caloriesBurned = data.health.filter(h => h.type === 'activity').reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const skillsCount = data.skills.length;

  const metrics = [
    { title: 'Total Income', value: `Rs. ${totalIncome.toFixed(2)}`, icon: 'arrow-up', iconColor: '#4cd137' },
    { title: 'Total Expenses', value: `Rs. ${totalExpense.toFixed(2)}`, icon: 'arrow-down', iconColor: '#ff7979' },
    { title: 'Current Balance', value: `Rs. ${balance.toFixed(2)}`, icon: 'scale-balance', iconColor: '#a29bfe', isMaterial: true },
    { title: 'Pending Tasks', value: pendingTasks.toString(), icon: 'clipboard-list', iconColor: '#00cec9', isMaterial: true },
    { title: 'Calories Burned', value: `${caloriesBurned} cal`, icon: 'fire', iconColor: '#ff7675', isMaterial: true },
    { title: 'Skills Tracking', value: `${skillsCount} skills`, icon: 'book', iconColor: '#6c5ce7', isMaterial: true },
  ];

  const quickActions = [
    { label: '+ Add Transaction', bgColor: '#111', textColor: '#fff', route: 'Finance' },
    { label: '+ Add Task', bgColor: '#fff', textColor: '#111', borderColor: '#ccc', route: 'Tasks' },
    { label: '+ Log Activity', bgColor: '#00e676', textColor: '#fff', route: 'Health' },
    { label: '+ Track Skill', bgColor: '#111', textColor: '#fff', route: 'Skills' },
  ];

  if (loading && !data.finance.length) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

      <View style={styles.grid}>
        {metrics.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: item.iconColor }]}>
              {item.isMaterial ? (
                <MaterialCommunityIcons name={item.icon} size={26} color="#fff" />
              ) : (
                <Ionicons name={item.icon} size={26} color="#fff" />
              )}
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.quickActionsCard}>
        <View style={styles.quickActionsHeader}>
          <Ionicons name="flash" size={20} color="#111" />
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
          {quickActions.map((action, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => action.route && navigation.navigate(action.route)}
              style={[
                styles.actionBtn, 
                { backgroundColor: action.bgColor },
                action.borderColor && { borderWidth: 1, borderColor: action.borderColor }
              ]}
            >
              <Text style={[styles.actionBtnText, { color: action.textColor }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Overview Chart ── */}
      <View style={styles.chartCard}>
        <View style={styles.quickActionsHeader}>
          <Ionicons name="pie-chart" size={20} color="#111" />
          <Text style={styles.quickActionsTitle}>Activity Distribution</Text>
        </View>
        <PieChart
          data={[
            { name: "Finance", population: data.finance.length, color: "#4cd137", legendFontColor: "#7F7F7F", legendFontSize: 12 },
            { name: "Tasks", population: data.tasks.length, color: "#00cec9", legendFontColor: "#7F7F7F", legendFontSize: 12 },
            { name: "Health", population: data.health.length, color: "#ff7675", legendFontColor: "#7F7F7F", legendFontSize: 12 },
            { name: "Skills", population: data.skills.length, color: "#6c5ce7", legendFontColor: "#7F7F7F", legendFontSize: 12 }
          ]}
          width={width - 60}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: width > 768 ? '31%' : '48%', 
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: width > 768 ? 20 : 14,
    fontWeight: '700',
    color: '#222',
  },
  quickActionsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginLeft: 8,
  },
  quickActionsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 5,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
});

export default DashboardScreen;
