import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/styles';

import { API_URL } from '../config';

export default function GameSearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${API_URL}/games`);
      const data = await response.json();
      setGames(data.games);
    } catch (error) {
      console.error('게임 데이터를 불러오는 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGameItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.gameCard}
      onPress={() => navigation.navigate('GameDetail', { game: item })}
    >
      <Image source={{ uri: item.image }} style={styles.gameImage} />
      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{item.name}</Text>
        <Text style={styles.gameDesc} numberOfLines={1}>{item.description}</Text>
        <View style={styles.gameMeta}>
          <Text style={styles.metaText}>👥 {item.players}</Text>
          <Text style={[styles.metaText, styles.difficultyText]}>📊 {item.difficulty}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게임 도감</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="어떤 게임이 궁금하신가요?"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredGames}
          renderItem={renderGameItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>찾으시는 게임이 아직 도감에 없네요!</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    ...commonStyles.shadow,
  },
  gameImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  gameInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  gameDesc: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 6,
  },
  gameMeta: {
    flexDirection: 'row',
  },
  metaText: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 10,
  },
  difficultyText: {
    color: colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: colors.textLight,
    fontSize: 16,
  }
});
