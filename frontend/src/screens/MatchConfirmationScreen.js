import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { calculateEndTime } from '../utils/timeCalculator';

export default function MatchConfirmationScreen({ route, navigation }) {
  // MatchDetailScreen에서 넘겨받은 매치 정보
  const { match } = route.params;
  const endTime = calculateEndTime(match.startTime);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.checkIcon}>🎉</Text>
          <Text style={styles.title}>매치 예약이 확정되었습니다!</Text>
          <Text style={styles.subtitle}>가장 빠른 길로 보드웨이를 즐겨보세요</Text>

          <View style={styles.receiptBox}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>게임</Text>
              <View style={styles.gamesList}>
                {match.games.map((game, idx) => (
                  <Text key={idx} style={styles.receiptValue}>{game}</Text>
                ))}
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>장소</Text>
              <Text style={styles.receiptValue}>{match.location.venue} {match.location.branch}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>시간</Text>
              <Text style={[styles.receiptValue, { color: colors.primary, fontWeight: 'bold' }]}>
                {match.startTime} ~ {endTime}
              </Text>
            </View>
          </View>
          
          <Text style={styles.infoText}>
            자세한 내역과 참여자 정보는 홈 화면의 '내 매치'에서 다시 확인할 수 있습니다.
          </Text>
        </View>

        <TouchableOpacity 
          style={commonStyles.button}
          onPress={() => navigation.navigate('Discovery')}
        >
          <Text style={commonStyles.buttonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 40,
    textAlign: 'center',
  },
  receiptBox: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  receiptLabel: {
    fontSize: 15,
    color: colors.textLight,
    fontWeight: '600',
    width: 60,
  },
  receiptValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: 4,
  },
  gamesList: {
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 24,
    textAlign: 'center',
    lineHeight: 20,
  }
});
