import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { calculateEndTime } from '../utils/timeCalculator';
import { MatchContext } from '../context/MatchContext';
import { AuthContext } from '../context/AuthContext';

export default function MatchDetailScreen({ route, navigation }) {
  const { matchId } = route.params;
  const { matches, joinMatch } = useContext(MatchContext);
  const { user } = useContext(AuthContext);
  
  const match = matches.find(m => m.id === matchId);

  const [modalVisible, setModalVisible] = useState(false);
  const [ruleChecked, setRuleChecked] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isJoining, setIsJoining] = useState(false); // 로딩 상태 추가

  if (!match) return <View style={commonStyles.container}><Text>매치를 찾을 수 없습니다.</Text></View>;

  const endTime = calculateEndTime(match.startTime);
  
  // 구글 맵스 임베드용 URL 생성 (장소명 + 지점명 + 주소)
  const mapQuery = encodeURIComponent(`${match.location.venue} ${match.location.branch} ${match.location.address}`);
  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const renderDice = (score) => {
    let diceIcon = '🎲';
    return (
      <View style={styles.diceContainer}>
        <Text style={styles.diceIcon}>{diceIcon}</Text>
        <Text style={styles.diceScore}>{score}/6</Text>
      </View>
    );
  };

  const isAlreadyJoined = user && match.participants.some(p => p.nickname === user.nickname);

  const handlePayment = async () => {
    if (isJoining) return; // 이미 처리 중이면 무시 (따닥 클릭 방지)

    if (!ruleChecked) {
      Alert.alert('알림', '룰 영상을 모두 시청하고 체크박스를 확인해주세요.');
      return;
    }

    setIsJoining(true);
    const result = await joinMatch(match.id, user.nickname, user.mannerScore);
    setIsJoining(false);
    
    if (result.success) {
      Alert.alert('결제 완료', '매치 예약이 확정되었습니다! 가장 빠른 길로 보드웨이를 즐겨보세요 🎲');
      setModalVisible(false);
      navigation.goBack();
    } else {
      Alert.alert('참여 불가', result.message || '오류가 발생했습니다.');
    }
  };

  const extractVideoId = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      return urlObj.searchParams.get('v') || 'kYJqD0E4X5Y'; 
    } catch {
      return 'kYJqD0E4X5Y';
    }
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 섹션 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerLabel}>진행 예정 보드게임 (3종)</Text>
          {match.games.map((game, index) => (
            <Text key={index} style={styles.gameName}>
              {index + 1}. {game}
            </Text>
          ))}
          <View style={[styles.tagsContainer, { marginTop: 12 }]}>
            {match.tags.map((tag, index) => (
              <View key={index} style={commonStyles.badge}>
                <Text style={commonStyles.badgeText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 모이는 장소 및 지도 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>모이는 장소 📍</Text>
          <View style={styles.locationBox}>
            <Text style={styles.locationVenue}>{match.location.venue} {match.location.branch}</Text>
            <Text style={styles.locationAddress}>{match.location.address}</Text>
          </View>
          <View style={styles.mapContainer}>
            <WebView 
              source={{ uri: mapUrl }} 
              style={styles.mapWebView} 
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* 타임라인 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>보드웨이 룸 대여 타임라인 ⏳</Text>
          <View style={styles.timelineBox}>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineTime}>{match.startTime}</Text>
              <View style={styles.timelineDot} />
              <Text style={styles.timelineText}>매치 시작 및 인사</Text>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineRow}>
              <Text style={styles.timelineTime}>{endTime}</Text>
              <View style={[styles.timelineDot, { backgroundColor: colors.secondary }]} />
              <Text style={[styles.timelineText, { fontWeight: 'bold', color: colors.primary }]}>
                기본 종료 시간 (2시간)
              </Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            ※ 기본 이용 시간은 2시간입니다. 상호 간의 협의 하에 현장에서 추가 금액을 지불하고 시간을 연장할 수 있습니다.
          </Text>
        </View>

        {/* 참여자 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>현재 참여자 정보 ({match.participants.length}/{match.maxPlayers})</Text>
          {match.participants.map((user, index) => (
            <View key={index} style={styles.participantBox}>
              <View style={styles.participantNameRow}>
                <Text style={styles.participantName}>{user.nickname}</Text>
                {user.isMe && <Text style={styles.meBadge}>(본인)</Text>}
              </View>
              {user.mannerScore >= 5 && (
                <Text style={styles.bestGuide}>⭐ 굿 매너 유저</Text>
              )}
              {renderDice(user.mannerScore)}
            </View>
          ))}
        </View>

        {/* 룰 영상 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>룰 숙지 인증 📺</Text>
          <Text style={styles.ruleSubText}>가장 바른 즐거움을 위해 아래 3가지 게임의 룰을 모두 숙지해주세요.</Text>
          
          <View style={styles.videoTabs}>
            {match.games.map((game, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.tabButton, activeVideoIndex === index && styles.tabButtonActive]}
                onPress={() => setActiveVideoIndex(index)}
              >
                <Text style={[styles.tabText, activeVideoIndex === index && styles.tabTextActive]}>
                  {game}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.videoContainer}>
            <YoutubePlayer
              height={200}
              play={false}
              videoId={extractVideoId(match.ruleVideoUrls[activeVideoIndex])}
            />
          </View>
          <Text style={styles.currentVideoLabel}>현재 영상: {match.games[activeVideoIndex]}</Text>
        </View>

      </ScrollView>

      {/* 하단 고정 버튼 영역 */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[commonStyles.button, isAlreadyJoined && { backgroundColor: '#A0A0A0' }]}
          disabled={isAlreadyJoined}
          onPress={() => {
            if (!user) {
              Alert.alert(
                '로그인 필요',
                '매칭 신청은 로그인 후 이용 가능합니다.',
                [
                  { text: '로그인하기', onPress: () => navigation.navigate('Login') },
                  { text: '취소', onPress: () => {} }
                ]
              );
            } else {
              setModalVisible(true);
            }
          }}
        >
          <Text style={commonStyles.buttonText}>
            {isAlreadyJoined ? "이미 참여 완료된 매치입니다" : "룸 매치 참여 결제하기"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 결제 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>매치 참여 확인</Text>
            
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setRuleChecked(!ruleChecked)}
            >
              <View style={[styles.checkbox, ruleChecked && styles.checkboxChecked]}>
                {ruleChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>3가지 게임의 룰을 모두 숙지했습니다.</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.payButton, (!ruleChecked || isJoining) && styles.disabledButton]}
                onPress={handlePayment}
                disabled={!ruleChecked || isJoining}
              >
                <Text style={styles.payButtonText}>{isJoining ? "처리중..." : "결제하기"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  gameName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  locationBox: {
    marginBottom: 12,
  },
  locationVenue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textLight,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapWebView: {
    flex: 1,
  },
  timelineBox: {
    paddingLeft: 10,
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineTime: {
    width: 50,
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginHorizontal: 12,
  },
  timelineText: {
    fontSize: 16,
    color: colors.text,
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: colors.border,
    marginLeft: 67,
    marginVertical: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#E67E22',
    lineHeight: 20,
    backgroundColor: '#FDF2E9',
    padding: 12,
    borderRadius: 8,
  },
  participantBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  participantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  meBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 6,
  },
  bestGuide: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  diceContainer: {
    alignItems: 'center',
  },
  diceIcon: {
    fontSize: 20,
  },
  diceScore: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: 'bold',
    marginTop: 2,
  },
  ruleSubText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  videoTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  tabTextActive: {
    color: colors.surface,
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  currentVideoLabel: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 16,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: colors.primary,
  },
  payButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  }
});
