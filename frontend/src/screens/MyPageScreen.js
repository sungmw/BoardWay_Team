import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { AuthContext } from '../context/AuthContext';
import { notify, confirmAction } from '../utils/dialog';

export default function MyPageScreen({ navigation }) {
  const { user, logout, points } = useContext(AuthContext);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [mannerModalVisible, setMannerModalVisible] = useState(false);

  const handleLogout = async () => {
    confirmAction(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      async () => {
        await logout();
        navigation.reset({ index: 0, routes: [{ name: 'Intro' }] });
      },
      { confirmText: "로그아웃", destructive: true }
    );
  };

  const handleRecharge = (amount) => {
    setRechargeModalVisible(false);
    navigation.navigate('PaymentWebView', { amount });
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
              <TouchableOpacity 
                style={styles.statBox}
                onPress={() => setMannerModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.statLabel}>매너 주사위</Text>
                  <Ionicons name="help-circle-outline" size={14} color={colors.textLight} style={{ marginBottom: 8 }} />
                </View>
                <View style={styles.diceContainer}>
                  <View style={{ flexDirection: 'row', gap: 3, marginRight: 6 }}>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <Ionicons 
                        key={num} 
                        name={Math.round(user.mannerScore) >= num ? "dice" : "dice-outline"} 
                        size={20} 
                        color={Math.round(user.mannerScore) >= num ? colors.secondary : colors.border} 
                      />
                    ))}
                  </View>
                  <Text style={styles.statValue}>{user.mannerScore.toFixed(1)}</Text>
                </View>
              </TouchableOpacity>
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
            <Text style={[styles.emailText, { marginBottom: 16 }]}>로그인 후 이용 가능한 기능입니다.</Text>
            <TouchableOpacity
              style={[commonStyles.button, { alignSelf: 'flex-start' }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={commonStyles.buttonText}>로그인 / 회원가입</Text>
            </TouchableOpacity>
          </View>
        )}

        {user && (
          <>
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
              <TouchableOpacity style={styles.menuItem} onPress={() => notify('준비 중', '프로필 수정 기능은 준비 중입니다.')}>
                <Ionicons name="create-outline" size={24} color={colors.text} style={styles.menuIcon} />
                <Text style={styles.menuText}>프로필 수정</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => notify('준비 중', '고객센터 기능은 준비 중입니다.')}>
                <Ionicons name="help-circle-outline" size={24} color={colors.text} style={styles.menuIcon} />
                <Text style={styles.menuText}>고객센터</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color={colors.error} style={styles.menuIcon} />
                <Text style={[styles.menuText, { color: colors.error }]}>로그아웃</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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

      {/* 매너 주사위 설명 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={mannerModalVisible}
        onRequestClose={() => setMannerModalVisible(false)}
      >
        <View style={styles.modalOverlayCentered}>
          <View style={styles.mannerModalContent}>
            <View style={styles.mannerModalHeader}>
              <Ionicons name="dice" size={28} color={colors.primary} />
              <Text style={styles.mannerModalTitle}>보드웨이 매너 주사위 안내</Text>
            </View>
            
            <ScrollView style={styles.mannerModalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.mannerIntroText}>
                보드웨이의 매너 주사위는 매칭 참여자들끼리 평가한 평균 주사위 눈수를 바탕으로 계산되는 신뢰 지표입니다.
              </Text>
              
              <View style={styles.mannerRuleRow}>
                <Ionicons name="dice-outline" size={20} color={colors.primary} />
                <View style={styles.mannerRuleTextWrap}>
                  <Text style={styles.mannerRuleTitle}>주사위 범위</Text>
                  <Text style={styles.mannerRuleDesc}>최소 1.0 ~ 최대 6.0 (6단계)</Text>
                </View>
              </View>

              <View style={styles.mannerRuleRow}>
                <Ionicons name="rocket-outline" size={20} color={colors.primary} />
                <View style={styles.mannerRuleTextWrap}>
                  <Text style={styles.mannerRuleTitle}>시작 주사위</Text>
                  <Text style={styles.mannerRuleDesc}>신규 가입 시 기본 5.0에서 시작합니다.</Text>
                </View>
              </View>

              <View style={styles.mannerRuleRow}>
                <Ionicons name="shuffle-outline" size={20} color={colors.primary} />
                <View style={styles.mannerRuleTextWrap}>
                  <Text style={styles.mannerRuleTitle}>반영 방식</Text>
                  <Text style={styles.mannerRuleDesc}>
                    매칭 완료 후 멤버들로부터 받은 주사위 점수(1~6점)들의 산술 평균이 매너 주사위 점수로 자동 갱신됩니다.
                  </Text>
                </View>
              </View>

              <View style={styles.mannerRuleRow}>
                <Ionicons name="ribbon-outline" size={20} color={colors.secondary} />
                <View style={styles.mannerRuleTextWrap}>
                  <Text style={styles.mannerRuleTitle}>굿 매너 배지</Text>
                  <Text style={styles.mannerRuleDesc}>
                    매너 주사위가 5.0 이상인 경우 '⭐ 굿 매너 유저' 배지가 부여되어 매칭 신뢰도가 대폭 상승합니다!
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.mannerCloseBtn}
              onPress={() => setMannerModalVisible(false)}
            >
              <Text style={styles.mannerCloseBtnText}>확인</Text>
            </TouchableOpacity>
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
  },
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mannerModalContent: {
    width: '95%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    ...commonStyles.shadow,
  },
  mannerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  mannerModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  mannerModalBody: {
    maxHeight: 300,
  },
  mannerIntroText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 20,
  },
  mannerRuleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  mannerRuleTextWrap: {
    flex: 1,
  },
  mannerRuleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  mannerRuleDesc: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },
  mannerCloseBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  mannerCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
