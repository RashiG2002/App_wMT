import React, { useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = 270;

const navItems = [
  { label: 'Dashboard',    route: 'Dashboard',    icon: 'home-outline' },
  { label: 'Transactions', route: 'Finance',      icon: 'swap-horizontal-outline' },
  { label: 'Budgets',      route: 'Budgets',      icon: 'wallet-outline' },
  { label: 'Tasks',        route: 'Tasks',        icon: 'checkbox-outline' },
  { label: 'Health',       route: 'Health',       icon: 'heart-outline' },
  { label: 'Skills',       route: 'Skills',       icon: 'school-outline' },
  { label: 'Reports',      route: 'Reports',      icon: 'bar-chart-outline' },
];

const Sidebar = ({ isOpen, onClose, navigation, activeRoute }) => {
  const { logout, userData } = useContext(AuthContext);
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleNavPress = (route) => {
    onClose();
    setTimeout(() => navigation.navigate(route), 180);
  };

  const handleLogout = () => {
    onClose();
    setTimeout(() => logout(), 200);
  };

  if (!isOpen) {
    // still render so animation can play out
  }

  return (
    <>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
              pointerEvents: isOpen ? 'auto' : 'none',
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Sidebar Panel */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>

        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={22} color="#555" />
        </TouchableOpacity>

        {/* Logo / Brand */}
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>LT</Text>
          </View>
          <View style={styles.brandText}>
            <Text style={styles.appName}>LifeTracker</Text>
            <Text style={styles.welcomeText}>Welcome, {userData?.username || 'User'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Nav Items */}
        <View style={styles.navList}>
          {navItems.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => handleNavPress(item.route)}
                activeOpacity={0.75}
              >
                <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
                  <Ionicons
                    name={item.icon}
                    size={19}
                    color={isActive ? '#6C63FF' : '#777'}
                  />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Bottom actions */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.bottomItem} onPress={() => handleNavPress('Profile')}>
            <View style={styles.bottomIconWrap}>
              <Ionicons name="person-circle-outline" size={19} color="#777" />
            </View>
            <Text style={styles.bottomLabel}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomItem}>
            <View style={styles.bottomIconWrap}>
              <Ionicons name="settings-outline" size={19} color="#777" />
            </View>
            <Text style={styles.bottomLabel}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bottomItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={[styles.bottomIconWrap, styles.logoutIconWrap]}>
              <Ionicons name="log-out-outline" size={19} color="#e74c3c" />
            </View>
            <Text style={styles.logoutLabel}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 10,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: height,
    backgroundColor: '#f8f7ff',
    zIndex: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : (StatusBar.currentHeight || 0) + 15,
    paddingBottom: 30,
    paddingHorizontal: 0,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 20,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginRight: 18,
    marginBottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 22,
    marginTop: 4,
  },
  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  brandText: {
    flex: 1,
  },
  appName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: 0.2,
  },
  welcomeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e8e6f5',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  navList: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: '#ede9fe',
  },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0eeff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navIconWrapActive: {
    backgroundColor: '#ddd6fe',
  },
  navLabel: {
    fontSize: 14.5,
    color: '#555',
    fontWeight: '500',
    flex: 1,
  },
  navLabelActive: {
    color: '#6C63FF',
    fontWeight: '700',
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#6C63FF',
  },
  bottomSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  bottomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
  },
  bottomIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0eeff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bottomLabel: {
    fontSize: 14.5,
    color: '#555',
    fontWeight: '500',
  },
  logoutItem: {
    marginTop: 4,
  },
  logoutIconWrap: {
    backgroundColor: '#fff0f0',
  },
  logoutLabel: {
    fontSize: 14.5,
    color: '#e74c3c',
    fontWeight: '600',
  },
});

export default Sidebar;
