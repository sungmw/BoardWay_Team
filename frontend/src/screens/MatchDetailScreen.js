import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { MatchContext } from '../context/MatchContext';
import { AuthContext } from '../context/AuthContext';
import { notify, confirmAction } from '../utils/dialog';
import YoutubePlayer from "react-native-youtube-iframe";
import { WebView } from 'react-native-webview';

// 지도/유튜브 임베드 — 웹에선 iframe, 모바일은 기존 라이브러리.
// Platform.OS 분기로 보호되어 모바일에선 iframe 코드가 호출되지 않음.
const MapEmbed = ({ query, height = 200 }) => {
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  if (Platform.OS === 'web') {
    return (
      <iframe
        src={embedUrl}
        style={{ width: '100%', height, border: 0 }}
        title="지도"
      />
    );
  }
  return (
    <WebView
      source={{ uri: embedUrl }}
      style={{ flex: 1 }}
      scrollEnabled={false}
    />
  );
};

const YoutubeEmbed = ({ videoId, height = 200 }) => {
  if (!videoId) return null;
  if (Platform.OS === 'web') {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        style={{ width: '100%', height, border: 0 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="rule video"
      />
    );
  }
  return <YoutubePlayer height={height} play={false} videoId={videoId} />;
};

export default function MatchDetailScreen({ route, navigation }) {
  const { matchId } = route.params;
  const { matches, joinMatch, cancelMatch } = useContext(MatchContext);
  const { user, points, usePoints } = useContext(AuthContext);
  
  const [match, setMatch] = useState(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const foundMatch = matches.find(m => m.id === matchId);
    setMatch(foundMatch);
  }, [matchId, matches]);

  if (!match) return <View style={commonStyles.container}><Text>매치를 찾을 수 없습니다.</Text></View>;

  const isAlreadyJoined = user && match.participants.some(p => p.nickname === user.nickname);

  const handleJoin = async () => {
    if (points < 12000) {
      notify('포인트 부족', '보유 포인트가 부족합니다. 충전 후 이용해주세요.');
      return;
    }

    setIsJoining(true);

    const cost = 12000;
    const pointResult = await usePoints(cost, `[${match.games.join(', ')}] 매치 참여 결제`);

    if (!pointResult.success) {
      notify('오류', pointResult.message);
      setIsJoining(false);
      return;
    }

    const joinResult = await joinMatch(match.id);
    setIsJoining(false);

    if (joinResult.success) {
      setModalVisible(false);
      notify('신청 완료', '매칭 신청 및 결제가 완료되었습니다! 내 매치에서 확인하세요.');
      navigation.navigate('MyMatches');
    } else {
      notify('오류', joinResult.message || '매치 참여에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const renderDice = (score) => {
    const diceIcons = ['dice-one', 'dice-two', 'dice-three', 'dice-four', 'dice-five', 'dice-six'];
    const iconName = diceIcons[Math.min(Math.max(score - 1, 0), 5)];
    return <Ionicons name={iconName} size={24} color={colors.primary} />;
  };

  const extractVideoId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const mapQuery = `${match.location.venue} ${match.location.branch}`;

  const matchStart = new Date(`${match.date}T${match.startTime}:00`);
  const now = new Date();
  const isStarted = now > matchStart;
  const isFull = match.participants.length >= match.maxPlayers;
  const isCancelled = !!match.cancelled;
  const isAdmin = !!user?.is_admin;

  const handleCancelMatch = () => {
    confirmAction(
      '매치 취소',
      `이 매치를 취소하시겠습니까?\n참여자 ${match.participants.length}명에게 12,000P 씩 자동 환불됩니다.`,
      async () => {
        const result = await cancelMatch(match.id);
        if (result.success) {
          notify('취소 완료', result.message || '매치가 취소되었습니다.');
          navigation.goBack();
        } else {
          notify('오류', result.message);
        }
      },
      { confirmText: '취소하기', destructive: true },
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>매치 상세정보</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gameSection}>
          <Text style={styles.matchDate}>{match.date} {match.startTime}</Text>
          <Text style={styles.matchTitle}>
            {match.games.join(' ➔ ')}
          </Text>
          <View style={[styles.tagsContainer, { marginTop: 12 }]}>
            {match.tags.map((tag, index) => (
              <View key={index} style={commonStyles.badge}>
                <Text style={commonStyles.badgeText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>모이는 장소 📍</Text>
          <View style={styles.locationBox}>
            <Text style={styles.locationVenue}>{match.location.venue} {match.location.branch}</Text>
            <Text style={styles.locationAddress}>{match.location.address}</Text>
          </View>
          <View style={styles.mapContainer}>
            <MapEmbed query={mapQuery} height={200} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>현재 참여자 정보 ({match.participants.length}/{match.maxPlayers})</Text>
          {match.participants.map((participant, index) => (
            <View key={index} style={styles.participantBox}>
              <View style={styles.participantNameRow}>
                <Text style={styles.participantName}>{participant.nickname}</Text>
                {match.host === participant.nickname && <Text style={styles.hostBadge}>👑 방장</Text>}
                {user && user.nickname === participant.nickname && <Text style={styles.meBadge}>(본인)</Text>}
              </View>
              {participant.mannerScore >= 5 && (
                <Text style={styles.bestGuide}>⭐ 굿 매너 유저</Text>
              )}
              {renderDice(participant.mannerScore)}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>룰 숙지 인증 📺</Text>
          <Text style={styles.ruleSubText}>가장 바른 즐거움을 위해 아래 {match.games.length}가지 게임의 룰을 모두 숙지해주세요.</Text>
          
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
            <YoutubeEmbed
              videoId={extractVideoId(match.ruleVideoUrls[activeVideoIndex])}
              height={200}
            />
          </View>
          {extractVideoId(match.ruleVideoUrls[activeVideoIndex])
            ? <Text style={styles.currentVideoLabel}>현재 영상: {match.games[activeVideoIndex]}</Text>
            : <Text style={styles.currentVideoLabel}>이 매치에는 룰 영상이 등록되어 있지 않습니다.</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isAdmin && !isCancelled && (
          <TouchableOpacity
            style={[commonStyles.button, styles.cancelMatchBtn]}
            onPress={handleCancelMatch}
          >
            <Text style={commonStyles.buttonText}>매치 취소 (운영진)</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            commonStyles.button,
            (isAlreadyJoined || isFull || isStarted || isCancelled) && { backgroundColor: '#A0A0A0' }
          ]}
          disabled={isAlreadyJoined || isFull || isStarted || isCancelled}
          onPress={() => {
            if (!user) {
              confirmAction(
                '로그인 필요',
                '매칭 신청은 로그인 후 이용 가능합니다.',
                () => navigation.navigate('Login'),
                { confirmText: '로그인하기' }
              );
            } else {
              setModalVisible(true);
            }
          }}
        >
          <Text style={commonStyles.buttonText}>
            {isCancelled
              ? "취소된 매치입니다"
              : isAlreadyJoined
                ? "이미 참여 완료된 매치입니다"
                : isStarted
                  ? "이미 시작된 매치입니다"
                  : isFull
                    ? "매치가 마감되었습니다"
                    : "매치 참여 결제하기"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>매치 참여 결제 확인</Text>
            <View style={styles.paymentInfoBox}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>내 보유 포인트</Text>
                <Text style={styles.paymentValue}>{points.toLocaleString()} P</Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>차감 예정 포인트</Text>
                <Text style={[styles.paymentValue, { color: colors.error }]}>- 12,000 P</Text>
              </View>
              <View style={[styles.paymentRow, styles.paymentTotalRow]}>
                <Text style={styles.paymentTotalLabel}>결제 후 잔액</Text>
                <Text style={styles.paymentTotalValue}>{(points - 12000).toLocaleString()} P</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn, isJoining && { opacity: 0.7 }]}
                onPress={handleJoin}
                disabled={isJoining}
              >
                {isJoining ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>결제 및 참여</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  gameSection: {
    marginBottom: 24,
  },
  matchDate: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  locationBox: {
    backgroundColor: '#F1F2F6',
    padding: 16,
    borderRadius: 12,
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
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EEEEEE',
  },
  mapWebView: {
    flex: 1,
  },
  participantBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  participantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  meBadge: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  hostBadge: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginLeft: 6,
    backgroundColor: '#00000005',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#D4AF37',
  },
  bestGuide: {
    fontSize: 12,
    color: '#D4A000',
    fontWeight: 'bold',
  },
  ruleSubText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  videoTabs: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: colors.textLight,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
    marginBottom: 8,
  },
  currentVideoLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    ...commonStyles.shadow,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  paymentInfoBox: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  paymentTotalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  paymentTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelMatchBtn: {
    backgroundColor: colors.error,
    marginBottom: 12,
  },
});
