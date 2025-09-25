import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Pressable, Share, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const BG_IMG     = require('../assets/bg.webp');
const LOGO_SMALL = require('../assets/logo.webp');
const FRAME_IMG  = require('../assets/frame_candy.webp');

export default function AddMemoryDone({ route, navigation }) {
  const { memory } = route.params ?? {};
  const goHome = () => navigation.replace('Home');

  const onShare = useCallback(async () => {
    const msg = `Air Moments Diary\n${memory?.title || 'Memory'} — ${new Date(memory?.dateISO || Date.now()).toLocaleDateString()}\n${memory?.description || ''}`;
    try {
      await Share.share({ message: msg, title: memory?.title || 'Air Moments Diary' });
    } catch {}
  }, [memory]);

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

        {/* единая иллюстрация (книга + шарики) */}
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Image
            source={require('../assets/success_hero.webp')} // ← один элемент
            style={styles.hero}
            resizeMode="contain"
          />
        </View>

        {/* панель с рамкой-картинкой */}
        <View style={styles.panelWrap}>
          <View style={styles.panelOuter}>
            <Image
              source={FRAME_IMG}
              style={styles.frameImg}
              resizeMode="stretch"
              pointerEvents="none"
            />
            <View style={styles.panel}>
              <Text style={styles.title}>Your entry has been successfully{'\n'}added!</Text>
              <Text style={styles.body}>
                You can view it in Memories or in the calendar{'\n'}by date.
              </Text>
            </View>
          </View>
        </View>

        {/* кнопки */}
        <View style={styles.actions}>
          <Pressable onPress={onShare} style={styles.actionBtn}><Text style={styles.actionText}>Share</Text></Pressable>
          <Pressable onPress={goHome} style={styles.actionBtn}><Text style={styles.actionText}>Back</Text></Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

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

  /* единая иллюстрация */
  hero: {
    width: width * 0.78,
    height: width * 0.86, marginTop:-30, // подгони при необходимости под реальное соотношение
  },

  /* панель с рамкой-картинкой */
  panelWrap: { 
    marginTop: 12, 
    marginHorizontal: 16, 
    alignItems: 'center'
  },
  panelOuter: {
    position: 'relative',
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
  },
  frameImg: {
    position: 'absolute',
    width: '100%',
    height: 230,
    top: -20,
    left: 0,
    resizeMode: 'contain',
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

  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    textAlign: 'center',
    marginBottom: 10,
    // Градиент для текста через textShadow
    color: '#FFD700',
    textShadowColor: '#E91E63',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  body: { 
    fontSize: 16, 
    textAlign: 'center',
    // Градиент для текста через textShadow
    color: '#FFD700',
    textShadowColor: '#E91E63',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  actions: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 14 },
  actionText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: '#B02B2B',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});