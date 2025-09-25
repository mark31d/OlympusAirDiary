// Components/HomeScreen.js
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  Share,
  Dimensions,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

/* ── assets ─────────────────────────────────────── */
const BG_IMG        = require('../assets/bg.webp');
const TILE_ADD      = require('../assets/tile_add.webp');
const TILE_MEMORY   = require('../assets/tile_memory.webp');
const TILE_CALENDAR = require('../assets/tile_calendar.webp');
const TILE_ABOUT    = require('../assets/tile_about.webp');
const JOY_IMG       = require('../assets/joy.webp');
const CHALLENGE_IMG = require('../assets/challenge.webp');
const PERSONAL_IMG  = require('../assets/personal.webp');

/* ── palette ────────────────────────────────────── */
const COLORS = {
  frame: '#F72585',
  frameDark: '#E91E63',
  panelFrom: 'rgba(123, 44, 191, 0.7)',
  panelTo:   'rgba(75, 31, 174, 0.6)',
  text: '#FFD700',
  black: '#000000',
};

export default function HomeScreen({ navigation }) {
  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message:
          'Air Moments Diary — save your happiest memories with photos and notes!',
        url: 'https://example.com/air-moments-diary', // при желании подмени на реальную ссылку
        title: 'Air Moments Diary',
      });
    } catch (e) {
      // no-op
    }
  }, []);

  const tiles = [
    { key: 'add',      title: 'Add a\nmemory', image: TILE_ADD,      route: 'AddCategory' },
    { key: 'memory',   title: 'Memory',        image: TILE_MEMORY,   route: 'Memory' },
    { key: 'calendar', title: 'Calendar',      image: TILE_CALENDAR, route: 'Calendar' },
    { key: 'about',    title: 'About',         image: TILE_ABOUT,    route: 'About' },
  ];

  const renderTile = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate(item.route)}
      style={styles.tile}
      android_ripple={{ color: '#ffffff22' }}
    >
      <Image source={item.image} style={styles.tileImage} resizeMode="cover" />
    </Pressable>
  );

  return (
    <ImageBackground source={BG_IMG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* Welcome card */}
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={[COLORS.panelFrom, COLORS.panelTo]}
          style={styles.welcome}
        >
          <View style={styles.welcomeRow}>
            <Text style={styles.welcomeText}>
              <Text style={styles.welcomeTextBold}>Welcome to </Text>
              <Text style={styles.welcomeBrand}>Air Moments</Text>
            </Text>
            <Text style={styles.welcomeBrandRight}>Diary</Text>
          </View>

          {/* Декоративные 3D объекты */}
          <View style={styles.decorativeObjects}>
            <Image source={PERSONAL_IMG} style={styles.decorativePersonal} resizeMode="contain" />
            <Image source={JOY_IMG} style={styles.decorativeJoy} resizeMode="contain" />
            <Image source={CHALLENGE_IMG} style={styles.decorativeChallenge} resizeMode="contain" />
          </View>

          {/* Кнопка Share app в правом нижнем углу */}
          <Pressable onPress={onShare} hitSlop={10} style={styles.shareBtnCorner}>
            <Text style={styles.shareText}>Share app</Text>
          </Pressable>

          {/* двойной «карамельный» кант */}
          <View style={styles.frameOuter} pointerEvents="none" />
        </LinearGradient>

        {/* Grid 2×2 */}
        <FlatList
          contentContainerStyle={styles.grid}
          data={tiles}
          renderItem={renderTile}
          keyExtractor={(it) => it.key}
          numColumns={2}
          columnWrapperStyle={{ gap: 16 }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ── styles ─────────────────────────────────────── */
const CARD_RADIUS = 18;
const TILE_SIZE = (width - 16 * 3) / 2;

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 16 },

  /* Welcome */
  welcome: {
    marginTop: 6,
    borderRadius: 22,
    marginHorizontal: -10,
    minHeight: 220,
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  welcomeRow: {
    padding: 30,
    paddingBottom: 80, // отступ от шариков
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  welcomeText: { flexShrink: 1},
  welcomeTextBold: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: '700',
    lineHeight: 28,
    textShadowColor: '#F72585',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  welcomeBrand: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: '900',
    lineHeight: 28,
    textShadowColor: '#F72585',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  welcomeBrandRight: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: '900',
    lineHeight: 28,
    textShadowColor: '#F72585',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    alignSelf: 'flex-end',
  },
  shareBtn: { 
    paddingHorizontal: 6, 
    paddingVertical: 4,
    flexShrink: 0,
  },
  shareBtnCorner: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    zIndex: 10,
  },
  shareText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFD700',
    textShadowColor: '#F72585',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  frameOuter: {
    position: 'absolute',
    inset: 0,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: COLORS.frame,
  },

  /* Декоративные объекты */
  decorativeObjects: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    top:-10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  decorativeJoy: {
    width: 70,
    height: 70,
    marginRight: -25,
    right:40,
    top:-40,
    zIndex: 3,
  },
  decorativeChallenge: {
    width: 100,
    height: 100,
    marginRight: -25,
    left:-70,
    top:-10,
    transform: [{ rotate: '0deg' }],
    zIndex: 4,
  },
  decorativePersonal: {
    width: 70,
    height: 70,
    left:-10,
    top:-30,
    transform: [{ rotate: '-15deg' }],
    zIndex: 3,
  },

  /* Grid */
  grid: {
    paddingTop: 16,
    paddingBottom: Platform.select({ ios: 20, android: 12 }),
    gap: 16,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(123, 44, 191, 0.3)',
  },
  tileImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    borderRadius: CARD_RADIUS,
  },
});
