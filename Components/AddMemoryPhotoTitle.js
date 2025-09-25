import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ImageBackground, Pressable,
  TextInput, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

const BG_IMG     = require('../assets/bg.webp');
const LOGO_SMALL = require('../assets/logo.webp');
const ARROW_IMG  = require('../assets/arrow.webp');

export default function AddMemoryPhotoTitle({ route, navigation }) {
  const { category } = route.params ?? {};
  const [photoUri, setPhotoUri] = useState(null);
  const [title, setTitle] = useState('');

  const goHome = () => navigation.replace('Home');

  const pickPhoto = useCallback(async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.9 });
    if (res?.assets?.length) setPhotoUri(res.assets[0].uri);
  }, []);

  const goNext = useCallback(() => {
    navigation.navigate('AddDateDesc', { category, photoUri, title });
  }, [category, photoUri, title, navigation]);

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

        <View style={styles.sectionRow}>
          <Image source={require('../assets/arrow.webp')} style={styles.smallArrow} />
          <Text style={styles.sectionTitle}>Enter the data:</Text>
          <View style={styles.dots}><View style={[styles.dot, styles.dotActive]} /><View style={styles.dot} /></View>
        </View>

        {/* Photo picker */}
        <Pressable onPress={pickPhoto} style={styles.photoBox}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoImg} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Image source={require('../assets/add_photo_icon.webp')} style={{ width: 40, height: 40, tintColor: '#FFD700' }} />
              <Text style={{ marginTop: 8, fontSize: 18, color: '#FFD700' }}>Add photo</Text>
            </View>
          )}
        </Pressable>

        {/* Title input */}
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Title"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <Pressable onPress={goNext} style={styles.arrowWrap} android_ripple={{ color: '#ffffff22' }}>
          <Image source={ARROW_IMG} style={styles.arrow} />
        </Pressable>
      </SafeAreaView>
    </ImageBackground>
  );
}


const TILE = width - 64;

const styles = StyleSheet.create({
  bg: { flex: 1 }, safe: { flex: 1 },

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

  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 16, gap: 10 },
  smallArrow: { 
    width: 48, 
    height: 48, 
    transform: [{ rotate: '180deg' }] // Поворачиваем стрелку на 180 градусов
  },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#FFD700', textShadowColor: '#B02B2B', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  dots: { flexDirection: 'row', marginLeft: 'auto', gap: 8 },
  dot: { 
    width: 16, height: 16, borderRadius: 8, // Увеличиваем размер
    backgroundColor: 'rgba(255, 107, 53, 0.5)' // Оранжево-красный полупрозрачный
  },
  dotActive: { 
    width: 20, height: 16, borderRadius: 8, // Овальный активный круг
    backgroundColor: '#F72585' // Розовый активный
  },

  photoBox: {
    width: TILE, height: TILE * 0.66, borderRadius: 18, borderWidth: 3,
    borderColor: '#B43A34', alignSelf: 'center', marginTop: 10, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  photoImg: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  inputWrap: {
    marginTop: 18, 
    marginHorizontal: 16, 
    borderRadius: 22, 
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255, 107, 53, 0.3)', // Оранжевый полупрозрачный фон
    borderWidth: 2,
    borderColor: '#F72585', // Оранжевая рамка
  },
  input: { height: 56, fontSize: 20, color: '#FFD700' }, // Желтый текст

  arrowWrap: { alignSelf: 'center', marginTop: 16, marginBottom: Platform.select({ ios: 18, android: 12 }) },
  arrow: { width: 110, height: 110, resizeMode: 'contain' },
});