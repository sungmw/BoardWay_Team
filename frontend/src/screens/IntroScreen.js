import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { colors } from '../theme/colors';

export default function IntroScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // 화면 마운트 시 페이드 인
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 2초 뒤에 메인 화면(Discovery)으로 이동
    const timer = setTimeout(() => {
      navigation.replace('Discovery');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image 
          source={require('../../assets/slogan_white.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.sloganText}>보드게임을 즐기는 가장 빠른 길</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface, // 하얀색 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoImage: {
    width: 280,
    height: 280,
    marginBottom: 24,
  },
  sloganText: {
    fontSize: 20,
    color: colors.primary, // 딥 네이비 텍스트
    fontWeight: '700',
    letterSpacing: 1.2,
  }
});
