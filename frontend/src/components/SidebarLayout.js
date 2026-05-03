import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Sidebar from './Sidebar';

const ROUTE_TITLES = {
  Dashboard:  'Dashboard',
  Finance:    'Transactions',
  Budgets:    'Budgets',
  Tasks:      'Tasks',
  Health:     'Health',
  Skills:     'Skills',
  Reports:    'Reports',
  Profile:    'Profile',
};

const SidebarLayout = ({ children, navigation, routeName }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = ROUTE_TITLES[routeName] || routeName;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ── Top Header Bar ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.hamburger}
            onPress={() => setSidebarOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.bar} />
            <View style={[styles.bar, styles.barMid]} />
            <View style={[styles.bar, styles.barShort]} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{pageTitle}</Text>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Page Content ── */}
        <View style={styles.content}>
          {children}
        </View>

        {/* ── Animated Sidebar (overlay) ── */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navigation={navigation}
          activeRoute={routeName}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 5,
  },
  hamburger: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0eeff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  bar: {
    width: 20,
    height: 2.5,
    backgroundColor: '#6C63FF',
    borderRadius: 2,
  },
  barMid: {
    width: 14,
    marginVertical: 3,
  },
  barShort: {
    width: 17,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: 0.2,
  },
  avatarBtn: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  /* ── Content ── */
  content: {
    flex: 1,
  },
});

export default SidebarLayout;
