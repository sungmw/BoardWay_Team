import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IntroScreen from '../screens/IntroScreen';
import DiscoveryScreen from '../screens/DiscoveryScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Intro"
      screenOptions={{
        headerShown: false, // 커스텀 헤더를 사용하므로 기본 헤더 숨김
        animation: 'fade', // 부드러운 화면 전환
      }}
    >
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="Discovery" component={DiscoveryScreen} />
      <Stack.Screen 
        name="MatchDetail" 
        component={MatchDetailScreen} 
        options={{ 
          animation: 'slide_from_bottom',
          headerShown: true,
          title: '매치 상세 정보',
          headerTintColor: '#1A2A3A',
          headerBackTitleVisible: false
        }} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ animation: 'slide_from_bottom' }} 
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen} 
        options={{ 
          headerShown: true, 
          title: '', 
          headerShadowVisible: false 
        }} 
      />
    </Stack.Navigator>
  );
}
