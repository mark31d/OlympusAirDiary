// Components/AddMemoryDateDesc.js
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ImageBackground, Pressable,
  TextInput, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemories } from './MemoriesContext';

const { width } = Dimensions.get('window');

const BG_IMG     = require('../assets/bg.webp');
const LOGO_SMALL = require('../assets/logo.webp');
const ARROW_IMG  = require('../assets/arrow.webp');

/* === Универсальная градиентная рамка (без padding) === */
function GradientBorder({
  children,
  radius = 20,
  borderWidth = 3,
  colors = ['#F72585', '#E91E63'], // розовый
  start = { x: 0, y: 0 },
  end   = { x: 1, y: 1 },
  style,
  innerStyle,
}) {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[{ borderRadius: radius }, style]}
    >
      <View
        style={[
          {
            borderRadius: radius - 0.5,
            margin: borderWidth,
            backgroundColor: 'rgba(0,0,0,0.18)',
          },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}

export default function AddMemoryDateDesc({ route, navigation }) {
  const { category, photoUri, title } = route.params ?? {};
  const { addMemory } = useMemories();

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [desc, setDesc] = useState('');

  const goHome = () => navigation.replace('Home');

  const onPick = (_, d) => {
    setShowPicker(false);
    if (d) setDate(d);
  };

  const submit = useCallback(() => {
    const dateISO = date.toISOString();
    const payload = {
      category,
      title: title?.trim() || 'Untitled',
      description: desc.trim(),
      dateISO,
      photoUri,
    };
    addMemory(payload);
    navigation.replace('AddDone', { memory: payload });
  }, [addMemory, category, date, desc, photoUri, title, navigation]);

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
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </View>

        {/* Дата c градиентной рамкой */}
        <Pressable onPress={() => setShowPicker(true)} style={styles.dateWrap}>
          <GradientBorder radius={20} borderWidth={3}>
            <View style={styles.dateBox}>
              <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
            </View>
          </GradientBorder>
        </Pressable>

        {showPicker && (
          <View style={styles.calendarContainer}>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.select({ ios: 'inline', android: 'default' })}
              onChange={onPick}
              style={styles.calendar}
              themeVariant="light"
              accentColor="#F72585"
              textColor="#F72585"
            />
          </View>
        )}

        {/* Description с градиентной рамкой */}
        <View style={styles.textAreaWrap}>
          <GradientBorder radius={22} borderWidth={3} innerStyle={{ padding: 0 }}>
            <TextInput
              placeholder="Description"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              style={styles.textArea}
              value={desc}
              onChangeText={setDesc}
              multiline
            />
          </GradientBorder>
        </View>

        <Pressable onPress={submit} style={styles.arrowWrap} android_ripple={{ color: '#ffffff22' }}>
          <Image source={ARROW_IMG} style={styles.arrow} />
        </Pressable>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ============= styles ============= */
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

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    gap: 10,
  },
  smallArrow: {
    width: 48,
    height: 48,
    transform: [{ rotate: '180deg' }],
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFD700',
    textShadowColor: '#B02B2B',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  dots: { flexDirection: 'row', marginLeft: 'auto', gap: 8 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.5)',
  },
  dotActive: {
    width: 20,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F72585',
  },

  dateWrap: { marginTop: 16, paddingHorizontal: 16 },
  dateBox: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dateText: { fontSize: 20, color: '#FFD700', fontWeight: '700' },

  textAreaWrap: { marginTop: 18, marginHorizontal: 16 },
  textArea: {
    minHeight: 200,
    padding: 14,
    fontSize: 18,
    color: '#FFD700',
  },

  calendarContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Белый полупрозрачный фон
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: '#F72585', // Оранжевая рамка
    shadowColor: '#F72585',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  calendar: {
    backgroundColor: 'transparent',
  },

  arrowWrap: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: Platform.select({ ios: 18, android: 12 }),
  },
  arrow: { width: 110, height: 110, resizeMode: 'contain' },
});
