import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { notify } from '../utils/dialog';
import { apiFetch } from '../utils/api';
import { MatchContext } from '../context/MatchContext';
import { AuthContext } from '../context/AuthContext';

const DIFFICULTIES = ['쉬움', '보통', '어려움', '매우 어려움'];

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function CreateMatchScreen({ navigation }) {
  const { fetchMatches } = useContext(MatchContext);
  const { token } = useContext(AuthContext);

  const [gamesText, setGamesText] = useState('');
  const [difficulty, setDifficulty] = useState('보통');
  const [tagsText, setTagsText] = useState('');
  const [date, setDate] = useState(tomorrowISO());
  const [startTime, setStartTime] = useState('18:00');
  const [venue, setVenue] = useState('');
  const [branch, setBranch] = useState('');
  const [address, setAddress] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const games = gamesText.split(',').map(s => s.trim()).filter(Boolean);
    if (games.length === 0) {
      notify('알림', '게임을 1개 이상 입력해주세요. (콤마로 구분)');
      return;
    }
    if (!venue.trim() || !branch.trim() || !address.trim()) {
      notify('알림', '장소(매장·지점·주소)를 모두 입력해주세요.');
      return;
    }
    const players = parseInt(maxPlayers, 10);
    if (!players || players < 2) {
      notify('알림', '최대 인원은 2 이상이어야 합니다.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      notify('알림', '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      notify('알림', '시간 형식이 올바르지 않습니다. (HH:MM)');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        games,
        difficulty,
        tags: tagsText.split(',').map(s => s.trim()).filter(Boolean),
        date,
        startTime,
        ruleVideoUrls: [],
        location: { venue: venue.trim(), branch: branch.trim(), address: address.trim() },
        maxPlayers: players,
      };
      const res = await apiFetch('/matches', { method: 'POST', token, json: body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        notify('생성 실패', data.detail || '매치 생성에 실패했습니다.');
        return;
      }
      const created = await res.json();
      await fetchMatches();
      notify('생성 완료', '매치가 만들어졌습니다!');
      navigation.replace('MatchDetail', { matchId: created.id });
    } catch (e) {
      console.error('Create match error:', e);
      notify('오류', '서버와 연결할 수 없습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>새 매치 만들기</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>게임 (콤마로 구분)</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 스플랜더, 카탄"
          value={gamesText}
          onChangeText={setGamesText}
        />

        <Text style={styles.label}>난이도</Text>
        <View style={styles.difficultyRow}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.difficultyBtn, difficulty === d && styles.difficultyBtnActive]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={[styles.difficultyText, difficulty === d && styles.difficultyTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>태그 (선택, 콤마로 구분)</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 전략, 입문"
          value={tagsText}
          onChangeText={setTagsText}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>날짜 (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-05-17"
              value={date}
              onChangeText={setDate}
              autoCapitalize="none"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>시간 (HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="18:00"
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
        </View>

        <Text style={styles.label}>장소 — 매장</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 레드버튼"
          value={venue}
          onChangeText={setVenue}
        />

        <Text style={styles.label}>장소 — 지점</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 강남점"
          value={branch}
          onChangeText={setBranch}
        />

        <Text style={styles.label}>장소 — 주소</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 서울 강남구"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>최대 인원</Text>
        <TextInput
          style={styles.input}
          placeholder="4"
          value={maxPlayers}
          onChangeText={setMaxPlayers}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={[commonStyles.button, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={commonStyles.buttonText}>매치 만들기</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  content: { padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
  },
  difficultyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  difficultyBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  difficultyText: {
    fontSize: 13,
    color: colors.text,
  },
  difficultyTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
