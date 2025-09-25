// Components/AddCategoryScreen.js
import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, ImageBackground, Dimensions,
  FlatList, Pressable, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const BG_IMG     = require('../assets/bg.webp');
const LOGO_SMALL = require('../assets/logo.webp');
const ARROW_IMG  = require('../assets/arrow.webp');

const CAT_JOY      = require('../assets/cat_joy.webp');
const CAT_PERSONAL = require('../assets/cat_personal.webp');
const CAT_CHALL    = require('../assets/cat_challenge.webp');

const CATEGORIES = [
  { key: 'joy',        title: 'Joyful moments',         image: CAT_JOY },
 
  { key: 'challenges', title: 'Challenges and lessons', image: CAT_CHALL },
  { key: 'personal',   title: 'Personal and Deep',      image: CAT_PERSONAL },
];

const R = { headerRadius: 18, cardRadius: 22 };

export default function AddCategoryScreen({ navigation }) {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  const goHome = useCallback(() => navigation.replace('Home'), [navigation]);

  const onArrow = useCallback(() => {
    const cat = CATEGORIES[index];
    navigation.navigate('AddPhotoTitle', { category: cat.key });
  }, [index, navigation]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) setIndex(viewableItems[0].index ?? 0);
  }).current;

  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 60 }), []);

  const renderItem = ({ item }) => (
    <Pressable 
      style={styles.card}
      onPress={() => {
        const catIndex = CATEGORIES.findIndex(cat => cat.key === item.key);
        setIndex(catIndex);
      }}
    >
      <Image source={item.image} style={styles.balloon} resizeMode="contain" />
    </Pressable>
  );

  return (
    <ImageBackground source={BG_IMG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={goHome} hitSlop={10} style={styles.logoBtn}>
            <Image source={LOGO_SMALL} style={styles.logo} />
          </Pressable>
          <Text style={styles.headerTitle}>Add a memory</Text>

          {/* нижняя часть квадрата со скруглением 25 */}
          <View pointerEvents="none" style={styles.headerCap} />
        </View>

        <Text style={styles.sectionTitle}>Choose category</Text>

        <FlatList
          ref={listRef}
          data={CATEGORIES}
          renderItem={renderItem}
          keyExtractor={(it) => it.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          style={{ flex: 1 }}
        />

        <Pressable onPress={onArrow} style={styles.arrowWrap} android_ripple={{ color: '#ffffff22' }}>
          <Image source={ARROW_IMG} style={styles.arrow} resizeMode="contain" />
        </Pressable>
      </SafeAreaView>
    </ImageBackground>
  );
}

const CARD_W = width - 32;
const CARD_H = Math.min(400, height * 0.5);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },

  header: {
    position: 'relative',
    marginHorizontal: -5,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
   
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // тонкая линия как на макете
    
    overflow: 'visible',
  },

  /* тот самый «срезанный квадрат» */
  headerCap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,          // чуть увести, чтобы линия хедера сливалась
    height: 34,          // это «нижняя часть квадрата»
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,

    borderColor: '#F72585',
    borderWidth: 3,
    borderTopWidth: 0,   // срезаем верх – остаются боковые+низ
    backgroundColor: 'transparent',
  },

  logoBtn: { padding: 6 },
  logo: { width: 98, height: 98, borderRadius: 10 },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: '#F72585',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  sectionTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: '#FFD700',
    marginTop: 12,
    marginBottom: 20,
    textShadowColor: '#F72585',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  card: {
    width: CARD_W,
    height: CARD_H,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
paddingTop:25,

  },
  balloon: { width: CARD_W * 1.17, height: CARD_W * 1.17 },

  arrowWrap: {
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: Platform.select({ ios: 18, android: 12 }),
  },
  arrow: { width: 110, height: 110 },
});
