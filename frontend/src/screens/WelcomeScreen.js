import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>🚀</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Track Your Life, Improve Every Day</Text>
        <Text style={styles.subtitle}>Take control of your finances, health, tasks, and skills in one place.</Text>
        
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <LinearGradient colors={['#8A2387', '#E94057', '#F27121']} style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  illustrationContainer: { flex: 2, justifyContent: 'center', alignItems: 'center' },
  illustration: { fontSize: 120 },
  contentContainer: { flex: 1, padding: 30, backgroundColor: 'rgba(255,255,255,0.05)', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  title: { fontSize: 28, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  subtitle: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 30 },
  button: { padding: 18, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default WelcomeScreen;
