// Components/Onboarding.js
import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, ImageBackground,
  FlatList, Dimensions, Pressable, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

/* ── assets ─────────────────────────────────────── */
const BG_IMG    = require('../assets/bg.webp');
const ONB1_IMG  = require('../assets/onb1.webp');
const ONB2_IMG  = require('../assets/onb2.webp');
const ONB3_IMG  = require('../assets/onb3.webp');
const ARROW_IMG = require('../assets/arrow.webp');
const FRAME_IMG = require('../assets/frame_candy.webp'); // PNG с прозрачным центром

/* ── палитра / размеры ──────────────────────────── */
const COLORS = {
  text: '#FFFFFF',
  titleShadow: 'rgba(0,0,0,0.35)',
  // тёплый оранжевый градиент вместо розового
  panelFrom: '#FFC766', // золото
  panelTo:   '#F46A1F', // апельсиновый
};

const R = {
  radiusPanel: 28,
  radiusCard:  32,
  padding:     18,
  titleSize:   26,
  bodySize:    16,
};

// толщина «трубочки»-рамки (подгони под свой PNG)
const FRAME_THICKNESS = 18;

export default function Onboarding({ navigation }) {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  const slides = useMemo(
    () => ([
      {
        id: '1',
        hero: ONB1_IMG,
        heroStyle: { width: width * 0.94, height: height * 0.50, marginTop: 8 },
        panelAt: 'bottom',
        title: 'Save important moments in life.',
        body:  'Add a photo, title and short caption so that\nnothing gets lost.',
      },
      {
        id: '2',
        hero: ONB2_IMG,
        heroStyle: { width: width * 1, height: height * 0.72, marginTop: height * 0.001,  },
        panelAt: 'top',
        title: 'All memories are divided into\ncategories:',
        body:  'Joyful moments, Personal and deep, Challenges\nand lessons. Choose your candy!',
      },
      {
        id: '3',
        hero: ONB3_IMG,
        heroStyle: { width: width * 0.94, height: height * 0.48, marginTop: 8 },
        panelAt: 'bottom',
        title: 'View your memories in the\ncalendar.',
        body:  'Return to special days whenever you want.',
      },
    ]),
    []
  );

  const goNext = useCallback(() => {
    if (index < slides.length - 1) listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    else navigation.replace('Home');
  }, [index, slides.length, navigation]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) setIndex(viewableItems[0].index ?? 0);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const renderItem = ({ item }) => (
    <ImageBackground source={BG_IMG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
      <SafeAreaView style={styles.safe}>

        {item.panelAt === 'top' && (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <CandyPanel title={item.title} body={item.body} isSecondScreen={item.id === '2' || item.id === '3'} />
          </View>
        )}

        <View style={styles.heroWrap}>
          <Image source={item.hero} style={[styles.heroImg, item.heroStyle]} resizeMode="contain" />
        </View>

        {item.panelAt === 'bottom' && (
          <View style={{ paddingHorizontal: 16 }}>
            <CandyPanel title={item.title} body={item.body} isSecondScreen={item.id === '3'} />
          </View>
        )}

        <Pressable onPress={goNext} style={styles.arrowWrap} android_ripple={{ color: '#ffffff22', borderless: true }}>
          <Image source={ARROW_IMG} style={styles.arrowImg} resizeMode="contain" />
        </Pressable>

        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );

  return (
    <>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />
    </>
  );
}

/* ── Панель: оранжевый градиент + рамка по центру ─ */
function CandyPanel({ title, body, isSecondScreen = false }) {
  return (
    <View style={[styles.panelOuter, isSecondScreen && styles.panelOuterSecond]}>
      <Image
        source={FRAME_IMG}
        style={[styles.frameImg, isSecondScreen && styles.frameImgSecond]}
        resizeMode="stretch"
        pointerEvents="none"
      />

      <View style={styles.panel}>
        <Text style={styles.title}>{title}</Text>
        {!!body && <Text style={styles.body}>{body}</Text>}
      </View>
    </View>
  );
}

/* ── styles ─────────────────────────────────────── */
const styles = StyleSheet.create({
  bg: { width, height },
  bgImage: { transform: [{ scale: 1.02 }] },
  safe: { flex: 1, justifyContent: 'flex-start' },

  heroWrap: { alignItems: 'center', marginBottom: 8 },
  heroImg: {
    borderRadius: R.radiusCard,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  /* панель и рамка */
  panelOuter: {
    alignSelf: 'center',
    width: '92%',
    minHeight: height * 0.25,
    position: 'relative',
    justifyContent: 'center',
  },
  panel: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Прозрачный фон
  },
  frameImg: {
    position: 'absolute',
    width: '110%',
    height: 250,
    top: -30,
    left: -15,
    resizeMode: 'contain',
  },
  frameImgSecond: {
    top: -20, // на 10 пикселей ниже
  },
  panelOuterSecond: {
    marginTop: 10, // дополнительное смещение контейнера
  },

  title: {
    fontSize: R.titleSize,
    lineHeight: R.titleSize * 1.15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    // Градиент для текста через textShadow
    color: '#FF8A35',
    textShadowColor: '#F72585',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  body: {
    fontSize: R.bodySize,
    lineHeight: R.bodySize * 1.5,
    textAlign: 'center',
    // Градиент для текста через textShadow
    color: '#FF8A35',
    textShadowColor: '#F72585',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  arrowWrap: {
    position: 'absolute',
    bottom: Platform.select({ ios: 30, android: 20 }),
    alignSelf: 'center',
    zIndex: 1000,
  },
  arrowImg: { width: 96, height: 96 },

  dots: {
    position: 'absolute',
    bottom: Platform.select({ ios: 6, android: 2 }),
    left: 0, right: 0,
    height: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { width: 20, backgroundColor: '#ffffff' },
});
