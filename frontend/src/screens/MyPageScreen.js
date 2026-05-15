import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { AuthContext } from '../context/AuthContext';

export default function MyPageScreen({ navigation }) {
  const { user, logout, points, rechargePoints } = useContext(AuthContext);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "로그아웃", 
          style: "destructive",
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const handleRecharge = (amount) => {
    Alert.alert(
      "포인트 충전",
      `${amount.toLocaleString()}원을 결제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        { 
          text: "결제하기", 
          onPress: () => {
            rechargePoints(amount);
            setRechargeModalVisible(false);
            Alert.alert("충전 완료", `${amount.toLocaleString()} 포인트가 충전되었습니다.`);
          }
        }
      ]
    );
  };

  // 주사위 아이콘 결정 함수 — Ionicons 이름은 숫자가 아니라 영어 단어
  const getDiceIcon = (score) => {
    const numToWord = ['', 'one', 'two', 'three', 'four', 'five', 'six'];
    const roundedScore = Math.round(score);
    if (roundedScore <= 1) return "dice-outline";
    return `dice-${numToWord[Math.min(roundedScore, 6)]}-outline`;
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 섹션 */}
        {user ? (
          <View style={styles.profileSection}>
            <View style={styles.profileInfoContainer}>
              <View style={styles.profileIconContainer}>
                <Ionicons name="person" size={50} color={colors.primary} />
              </View>
              <View style={styles.profileTextContainer}>
                <Text style={styles.nicknameText}>{user.nickname}님</Text>
                <Text style={styles.emailText}>{user.email}</Text>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>매너 온도</Text>
                <View style={styles.diceContainer}>
                  <Ionicons name={getDiceIcon(user.mannerScore)} size={32} color={colors.primary} />
                  <Text style={styles.statValue}>{user.mannerScore.toFixed(1)}°C</Text>
                </View>
              </View>
              <View style={[styles.statBox, styles.statBoxDivider]}>
                <Text style={styles.statLabel}>보유 포인트</Text>
                <Text style={[styles.statValue, { color: colors.secondary }]}>{points.toLocaleString()} P</Text>
                <TouchableOpacity 
                  style={styles.rechargeBtnSmall}
                  onPress={() => setRechargeModalVisible(true)}
                >
                  <Text style={styles.rechargeBtnTextSmall}>충전</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.profileSection}>
            <Text style={styles.emailText}>로그인 정보가 없습니다.</Text>
          </View>
        )}

        {/* 포인트 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>포인트 관리</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => setRechargeModalVisible(true)}>
            <Ionicons name="card-outline" size={24} color={colors.text} style={styles.menuIcon} />
            <Text style={styles.menuText}>포인트 충전하기</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PointHistory')}>
            <Ionicons name="receipt-outline" size={24} color={colors.text} style={styles.menuIcon} />
            <Text style={styles.menuText}>포인트 사용 내역</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* 메뉴 리스트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 계정</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('준비 중', '프로필 수정 기능은 준비 중입니다.')}>
            <Ionicons name="create-outline" size={24} color={colors.text} style={styles.menuIcon} />
            <Text style={styles.menuText}>프로필 수정</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('준비 중', '고객센터 기능은 준비 중입니다.')}>
            <Ionicons name="help-circle-outline" size={24} color={colors.text} style={styles.menuIcon} />
            <Text style={styles.menuText}>고객센터</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.error }]}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 충전 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={rechargeModalVisible}
        onRequestClose={() => setRechargeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>포인트 충전</Text>
              <TouchableOpacity onPress={() => setRechargeModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.rechargeOptions}>
              {[5000, 10000, 30000, 50000].map((amount) => (
                <TouchableOpacity 
                  key={amount} 
                  style={styles.rechargeOption}
                  onPress={() => handleRecharge(amount)}
                >
                  <Text style={styles.rechargeAmount}>{amount.toLocaleString()} P</Text>
                  <Text style={styles.rechargePrice}>{amount.toLocaleString()}원</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* 하단 탭 네비게이션 바 */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Discovery')}>
          <Ionicons name="home-outline" size={24} color={colors.textLight} />
          <Text style={styles.tabText}>홈</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('GameSearch')}>
          <Ionicons name="search-outline" size={24} color={colors.textLight} />
          <Text style={styles.tabText}>검색</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MyMatches')}>
          <Ionicons name="list-outline" size={24} color={colors.textLight} />
          <Text style={styles.tabText}>내 매치</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ChatList')}>
          <Ionicons name="chatbubbles-outline" size={24} color={colors.textLight} />
          <Text style={styles.tabText}>채팅</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person" size={24} color={colors.primary} />
          <Text style={[styles.tabText, { color: colors.primary }]}>마이페이지</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  profileSection: {
    backgroundColor: colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  profileTextContainer: {
    marginLeft: 20,
  },
  nicknameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 15,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBoxDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  diceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  rechargeBtnSmall: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rechargeBtnTextSmall: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textLight,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  rechargeOptions: {
    paddingVertical: 20,
    gap: 12,
  },
  rechargeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rechargeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  rechargePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 24,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
    color: colors.textLight,
    fontWeight: '500',
  }
});
