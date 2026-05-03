import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FinanceScreen from '../screens/FinanceScreen';
import HealthScreen from '../screens/HealthScreen';
import SkillsScreen from '../screens/SkillsScreen';
import TasksScreen from '../screens/TasksScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Layout
import SidebarLayout from '../components/SidebarLayout';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

/** Wraps a screen component with the persistent sidebar */
const withSidebar = (ScreenComponent, routeName) => {
  return (props) => (
    <SidebarLayout navigation={props.navigation} routeName={routeName}>
      <ScreenComponent {...props} />
    </SidebarLayout>
  );
};

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard"  component={withSidebar(DashboardScreen, 'Dashboard')} />
    <Stack.Screen name="Finance"    component={withSidebar(FinanceScreen,   'Finance')} />
    <Stack.Screen name="Budgets"    component={withSidebar(FinanceScreen,   'Budgets')} />
    <Stack.Screen name="Tasks"      component={withSidebar(TasksScreen,     'Tasks')} />
    <Stack.Screen name="Health"     component={withSidebar(HealthScreen,    'Health')} />
    <Stack.Screen name="Skills"     component={withSidebar(SkillsScreen,    'Skills')} />
    <Stack.Screen name="Reports"    component={withSidebar(ReportsScreen,   'Reports')} />
    <Stack.Screen name="Profile"    component={withSidebar(ProfileScreen,   'Profile')} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken !== null ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
