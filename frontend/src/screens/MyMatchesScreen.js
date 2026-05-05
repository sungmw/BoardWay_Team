import React, { useState, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';
import { MatchContext } from '../context/MatchContext';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// 달력 한국어 설정
LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

export default function MyMatchesScreen({ navigation }) {
  const { matches } = useContext(MatchContext);
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 내 매치만 필터링
  const myMatches = useMemo(() => {
    if (!user) return [];
    return matches.filter(match => 
      match.participants.some(p => p.nickname === user.nickname)
    );
  }, [matches, user]);

  // 달력에 표시할 마킹 데이터 생성
  const markedDates = useMemo(() => {
    const marks = {};
    
    // 내 매치가 있는 날짜 표시
    myMatches.forEach(match => {
      if (match.date) {
        marks[match.date] = {
          marked: true,
          dotColor: colors.secondary,
          customStyles: {
            container: {
              backgroundColor: colors.primary + '20',
              borderRadius: 8
            },
            text: {
              color: colors.primary,
              fontWeight: 'bold'
            }
          }
        };
      }
    });

    // 선택된 날짜 강조
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: 'white'
    };

    return marks;
  }, [myMatches, selectedDate]);

  // 선택된 날짜의 매치 목록
  const selectedDateMatches = useMemo(() => {
    return myMatches.filter(match => match.date === selectedDate);
  }, [myMatches, selectedDate]);

  const renderMatchItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.matchItem}
      onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })}
    >
      <View style={styles.matchTimeContainer}>
        <Text style={styles.matchTime}>{item.startTime}</Text>
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.matchGames} numberOfLines={1}>
          {item.games.join(' ➔ ')}
        </Text>
        <Text style={styles.matchLocation}>
          📍 {item.location.venue} {item.location.branch}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 매치 일정</Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            todayTextColor: colors.secondary,
            arrowColor: colors.primary,
            monthTextColor: colors.primary,
            indicatorColor: colors.primary,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: 'bold',
          }}
          enableSwipeMonths={true}
        />
      </View>

      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {selectedDate.split('-')[1]}월 {selectedDate.split('-')[2]}일 일정
          </Text>
          <Text style={styles.matchCount}>{selectedDateMatches.length}건</Text>
        </View>

        {selectedDateMatches.length > 0 ? (
          <FlatList
            data={selectedDateMatches}
            renderItem={renderMatchItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>해당 날짜에 참여한 매치가 없습니다.</Text>
          </View>
        )}
      </View>

      {/* 하단 네비게이션 바 (임시 - 나중에 공통 컴포넌트화 권장) */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Discovery')}>
          <Ionicons name="home-outline" size={24} color={colors.textLight} />
          <Text style={styles.tabText}>홈</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('GameSearch')}>
          <Ionicons name="search-outline" size={24} color={colors.textLight} />
          <Text style={styles.tabText}>검색</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="list" size={24} color={colors.primary} />
          <Text style={[styles.tabText, { color: colors.primary }]}>내 매치</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Chat')}>
          <Ionicons name="chatbubbles-outline" size={24} color={colors.textLight} />
          <Text style={styles.tabText}>채팅</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color={colors.textLight} />
          <Text style={styles.tabText}>마이페이지</Text>
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
  calendarContainer: {
    backgroundColor: colors.surface,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  matchCount: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    ...commonStyles.shadow,
  },
  matchTimeContainer: {
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    marginRight: 15,
  },
  matchTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  matchInfo: {
    flex: 1,
  },
  matchGames: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  matchLocation: {
    fontSize: 13,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textLight,
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
