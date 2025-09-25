// Components/MemoryScreen.js
import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, ImageBackground, FlatList,
  Pressable, Dimensions, Share, TextInput, Platform,ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useMemories } from './MemoriesContext';

const { width, height } = Dimensions.get('window');

/* assets */
const BG_IMG   = require('../assets/bg.webp');
const LOGO     = require('../assets/logo.webp');
const FRAME    = require('../assets/frame_candy.webp');
const ARROW_S  = require('../assets/arrow.webp');

/* === Универсальная градиентная рамка (без padding) === */
function GradientBorder({
  children,
  radius = 20,
  borderWidth = 3,
  colors = ['#FF8A35', '#FF3B2E'], // оранжево-красный
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

const ICON_JOY  = require('../assets/joy.webp');
const ICON_CHAL = require('../assets/challenge.webp');
const ICON_PERS = require('../assets/personal.webp');
const CONTAINER = require('../assets/container.webp');   // ← НОВОЕ: фон-контейнер за шариком

const CAT_TABS = [
  { key: 'joy',        icon: ICON_JOY,  title: 'Memory' },
  { key: 'challenges', icon: ICON_CHAL, title: 'Memory' },
  { key: 'personal',   icon: ICON_PERS, title: 'Memory' },
];

// Цвет «подложки» контейнера при активном табе
const ACTIVE_COLORS = {
  joy:        '#E95D58',   // розово-красный
  challenges: '#F2C44A',   // жёлтый
  personal:   '#8A4A3A',   // шоколадный
};

const CARD_W = width - 24;

export default function MemoryScreen({ navigation, route }) {
  const { memories, updateMemory, removeMemory } = useMemories();

  const [cat, setCat] = useState('joy');
  const [mode, setMode] = useState('list'); // list | details | edit | confirmDelete
  const [currentId, setCurrentId] = useState(null);

  const item = useMemo(
    () => memories.find(m => m.id === currentId) || null,
    [memories, currentId]
  );

  const [title, setTitle] = useState('');
  const [date, setDate]   = useState(new Date());
  const [desc, setDesc]   = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const resetEdit = useCallback((src) => {
    setTitle(src?.title ?? '');
    setDesc(src?.description ?? '');
    setDate(src?.dateISO ? new Date(src.dateISO) : new Date());
    setPhotoUri(src?.photoUri ?? null);
  }, []);

  const goHome = () => navigation.replace('Home');

  /* data */
  const list = useMemo(() => {
    const arr = memories.filter(m => m.category === cat);
    return arr.sort((a, b) => (b.dateISO || '').localeCompare(a.dateISO || ''));
  }, [memories, cat]);

  /* handlers */
  const openDetails = (id) => { setCurrentId(id); setMode('details'); };
  const openEdit = () => { resetEdit(item); setMode('edit'); };
  const openDelete = () => setMode('confirmDelete');

  const shareItem = async () => {
    if (!item) return;
    try {
      await Share.share({
        title: item.title,
        message: `${item.title}\n${fmt(item.dateISO)}\n${item.description ?? ''}`,
      });
    } catch {}
  };

  const pickPhoto = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.9 });
    if (res?.assets?.length) setPhotoUri(res.assets[0].uri);
  };

  const saveEdit = () => {
    if (!item) return;
    updateMemory(item.id, {
      title: title.trim() || 'Untitled',
      description: desc.trim(),
      dateISO: date.toISOString(),
      photoUri,
    });
    setMode('details');
  };

  const doDelete = () => {
    if (!item) return;
    removeMemory(item.id);
    setMode('list');
    setCurrentId(null);
  };

  /* render */
  return (
    <ImageBackground source={BG_IMG} style={{ flex: 1 }} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }}>
          {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={goHome} hitSlop={10} style={styles.logoBtn}>
            <Image source={LOGO} style={styles.logo} />
          </Pressable>
          <Text style={styles.headerTitle}>Memory</Text>

          {/* нижняя часть квадрата со скруглением 25 */}
          <View pointerEvents="none" style={styles.headerCap} />
        </View>

        {/* LIST MODE */}
        {mode === 'list' && (
          <>
            {/* tabs with container */}
            <View style={styles.tabs}>
              {CAT_TABS.map(t => {
                const active = cat === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setCat(t.key)}
                    style={styles.tabSlot}
                  >
                    {/* контейнер как фон, красится через tintColor */}
        <Image
          source={CONTAINER}
          resizeMode="contain"                 // было "stretch"
          style={[
            styles.tabBg,
            { tintColor: active ? ACTIVE_COLORS[t.key] : 'rgba(255,255,255,0.50)' },
          ]}
        />
                    {/* сам шарик сверху */}
                    <Image source={t.icon} style={styles.tabIconAbs} resizeMode="contain" />
                  </Pressable>
                );
              })}
            </View>

            {/* list / empty */}
            {list.length === 0 ? (
              <CandyPanel text="You have no entries for this category yet." />
            ) : (
              <FlatList
                data={list}
                keyExtractor={(i) => i.id}
                renderItem={({ item: it }) => (
                  <Pressable onPress={() => openDetails(it.id)} style={styles.cardWrap}>
                    <View style={styles.card}>
                      {!!it.photoUri && (
                        <Image source={{ uri: it.photoUri }} style={styles.cardPhoto} />
                      )}

                      <Text style={styles.cardTitle}>{it.title}</Text>
                      <Text style={styles.cardDate}>{fmt(it.dateISO)}</Text>
                      {!!it.description && (
                        <Text numberOfLines={2} style={styles.cardDesc}>{it.description}</Text>
                      )}

                      <Pressable hitSlop={10} onPress={() => openDetails(it.id)} style={styles.moreBtn}>
                        <Text style={styles.moreText}>More</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                )}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 30, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}

        {/* DETAILS */}
        {mode === 'details' && item && (
          <>
            <Pressable onPress={() => setMode('list')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 8 }}>
              <Image source={ARROW_S} style={styles.backArrow} />
            </Pressable>

            <View style={styles.card}>
              {!!item.photoUri && <Image source={{ uri: item.photoUri }} style={styles.photo} />}
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>{fmt(item.dateISO)}</Text>
              {!!item.description && <Text style={styles.desc}>{item.description}</Text>}

              <View style={styles.actions}>
                <Pressable onPress={shareItem}><Text style={styles.actionText}>Share</Text></Pressable>
                <Pressable onPress={openEdit}><Text style={styles.actionText}>Edit</Text></Pressable>
                <Pressable onPress={openDelete}><Text style={styles.actionText}>Delete</Text></Pressable>
              </View>
            </View>
          </>
        )}

        {/* EDIT */}
        {mode === 'edit' && item && (
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => setMode('details')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 8 }}>
              <Image source={ARROW_S} style={styles.backArrow} />
            </Pressable>

            <Pressable onPress={pickPhoto} style={styles.photoBox}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
              ) : item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ 
                    fontSize: 18, 
                    color: '#FF8A35',
                    textShadowColor: '#F72585',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 2,
                  }}>Add photo</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.inputWrap}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholder="Title"
                placeholderTextColor="#111"
              />
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
                  onChange={(_, d) => { setShowPicker(false); if (d) setDate(d); }}
                  style={styles.calendar}
                  themeVariant="light"
                  accentColor="#FF6B35"
                  textColor="#FF6B35"
                />
              </View>
            )}

            <View style={styles.textAreaWrap}>
              <TextInput
                value={desc}
                onChangeText={setDesc}
                placeholder="Description"
                placeholderTextColor="#111"
                style={styles.textArea}
                multiline
              />
            </View>

            <View style={styles.saveRow}>
              <Pressable onPress={() => setMode('details')}><Text style={styles.btnText}>Cancel</Text></Pressable>
              <Pressable onPress={saveEdit}><Text style={styles.btnText}>Save</Text></Pressable>
            </View>
          </View>
        )}

        {/* CONFIRM DELETE */}
        {mode === 'confirmDelete' && item && (
          <ConfirmModal
            text={'Are you sure you want to\ndelete?'}
            onYes={doDelete}
            onNo={() => setMode('details')}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

/* helpers in-file */
function CandyPanel({ text }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyPanelOuter}>
        <Image
          source={FRAME}
          style={styles.frameImg}
          resizeMode="stretch"
          pointerEvents="none"
        />
        <View style={styles.emptyPanel}>
          <Text style={styles.emptyText}>{text}</Text>
        </View>
      </View>
    </View>
  );
}

function ConfirmModal({ text, onYes, onNo }) {
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalPanel}>
        <View style={styles.modalPanelOuter}>
          <Image
            source={FRAME}
            style={styles.modalFrame}
            resizeMode="stretch"
            pointerEvents="none"
          />
          <View style={styles.modalFill}>
            <Text style={styles.modalTitle}>{text}</Text>
            <View style={styles.modalRow}>
              <Pressable onPress={onYes} style={styles.modalBtn}><Text style={styles.modalBtnText}>Yes</Text></Pressable>
              <Pressable onPress={onNo}  style={styles.modalBtn}><Text style={styles.modalBtnText}>No</Text></Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function fmt(iso) {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = d.getFullYear();
    return `${dd}.${mm}.${yy}`;
  } catch { return ''; }
}

/* styles */
const TAB_W = (width - 24 - 28) / 3;
const styles = StyleSheet.create({
  header: {
    position: 'relative',
    marginHorizontal: -5,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 40,      // ← добавили место под "кап" (важно)
    marginBottom: 6,        // ← небольшой отступ от табов
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    overflow: 'visible',
  },

  /* нижняя кромка хедера (теперь не наезжает на табы) */
  headerCap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,              // ← было -1
    height: 36,             // ← слегка больше, чтобы красиво замкнуть
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderColor: '#F72585',
    borderWidth: 3,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    zIndex: 0,              // ← на всякий случай кап ниже
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

  tabs: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    zIndex: 1,              // ← табы поверх, если что
  },

  // НОВОЕ: слот с контейнером + иконкой
  // слот побольше и без обрезаний
  tabSlot: {
    width: TAB_W,
    height: 118,            // ← было 110
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  // фон-контейнер целиком виден
  tabBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  tabIconAbs: {
    width: '78%',
    height: '78%',
  },

  /* empty panel */
  emptyWrap: { marginTop: 12, marginHorizontal: 12, alignItems: 'center' },
  emptyPanelOuter: {
    position: 'relative',
    width: '80%', // Делаем меньше
    minHeight: 200, // Уменьшаем высоту
    justifyContent: 'center',
  },
  frameImg: {
    position: 'absolute',
    width: '120%', // Убираем лишние проценты
    height: 230, // Уменьшаем высоту
    top: 0, // Убираем отрицательный отступ
    left: -30, // Убираем отрицательный отступ
    resizeMode: 'contain',
  },
  emptyPanel: {
    position: 'absolute',
    top: 20, // Уменьшаем отступы
    left: 20,
    right: 20,
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center', // Центрируем текст
    backgroundColor: 'transparent', // Убираем белый квадрат
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    color: '#FFD700', // Белый текст
  },

  /* cards */
  cardWrap: { marginBottom: 12 },
  card: {
    width: CARD_W, 
    alignSelf: 'center',
    borderRadius: 24, 
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 140, 53, 0.3)', // Оранжевый полупрозрачный
    borderWidth: 2.5, 
    borderColor: '#F72585', // Оранжевая рамка
    overflow: 'hidden',
  },
  cardPhoto: { width: '100%', height: Math.min(240, height * 0.25) },
  cardTitle: {
    fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 6, marginHorizontal: 10,
    textShadowColor: '#B82D2D', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  cardDate: { 
    marginTop: 10, 
    marginHorizontal: 12, 
    fontSize: 16, 
    color: '#FF8A35',
    textShadowColor: '#F72585',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontWeight: '600' 
  },
  cardDesc: { 
    marginTop: 8, 
    marginHorizontal: 12, 
    fontSize: 16, 
    color: '#FF8A35',
    textShadowColor: '#F72585',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  moreBtn: { position: 'absolute', right: 12, bottom: 10, padding: 6 },
  moreText: {
    fontSize: 22, fontWeight: '900', color: '#fff',
    textShadowColor: '#B82D2D', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },

  /* details */
  photo: { width: '100%', height: Math.min(260, height * 0.28) },
  title: {
    fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 8, marginHorizontal: 12,
    textShadowColor: '#B82D2D', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  date: { 
    marginTop: 12, 
    marginHorizontal: 12, 
    fontSize: 16, 
    color: '#FF8A35',
    textShadowColor: '#F72585',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontWeight: '700' 
  },
  desc: { 
    marginTop: 10, 
    marginHorizontal: 12, 
    fontSize: 16, 
    color: '#FF8A35',
    textShadowColor: '#F72585',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  actions: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10 },
  actionText: {
    fontSize: 28, fontWeight: '900', color: '#fff',
    textShadowColor: '#B02B2B', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },

  /* edit */
  photoBox: {
    width: width - 32, 
    height: (width - 32) * 0.56, 
    borderRadius: 18, 
    borderWidth: 3, 
    borderColor: '#F72585', // Оранжевая рамка
    alignSelf: 'center', 
    marginTop: 12, 
    overflow: 'hidden', 
    backgroundColor: 'rgba(255, 140, 53, 0.3)', // Оранжевый полупрозрачный
  },
  inputWrap: { 
    marginTop: 12, 
    marginHorizontal: 16, 
    borderRadius: 22, 
    paddingHorizontal: 18, 
    backgroundColor: 'rgba(255, 140, 53, 0.3)', // Оранжевый полупрозрачный
    borderWidth: 3, 
    borderColor: '#F72585' // Оранжевая рамка
  },
  input: { 
    height: 56, 
    fontSize: 20, 
    color: '#FF8A35',
    textShadowColor: '#F72585',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dateWrap: { marginTop: 12, paddingHorizontal: 16 },
  dateBox: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  calendarContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Белый полупрозрачный фон
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: '#F72585', // Оранжевая рамка
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  calendar: {
    backgroundColor: 'transparent',
  },
  dateText: { fontSize: 20, color: '#FFD700', fontWeight: '700' },
  textAreaWrap: { 
    marginTop: 12, 
    marginHorizontal: 16, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255, 140, 53, 0.3)', // Оранжевый полупрозрачный
    borderWidth: 3, 
    borderColor: '#F72585' // Оранжевая рамка
  },
  textArea: { 
    minHeight: 180, 
    padding: 14, 
    fontSize: 18, 
    color: '#FF8A35',
    textShadowColor: '#F72585',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  saveRow: { marginTop: 16, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24 },
  btnText: { fontSize: 28, fontWeight: '900', color: '#fff', textShadowColor: '#B02B2B', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },

  /* arrow */
  backArrow: {
    width: 48, 
    height: 48,
    transform: [{ rotate: '180deg' }], // Разворачиваем стрелку на 180 градусов
  },

  /* modal */
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  modalPanel: { width: width - 34, alignItems: 'center' },
  modalPanelOuter: {
    position: 'relative',
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
  },
  modalFrame: {
    position: 'absolute',
    width: '106%',
    height: 220,
    top: -20,
    left: -10,
    resizeMode: 'contain',
  },
  modalFill: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Убираем фон, оставляем только рамку
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    color: '#FFD700', // Белый текст
  },
  modalRow: { marginTop: 14, flexDirection: 'row', gap: 50 },
  modalBtn: { paddingVertical: 6, paddingHorizontal: 14 },
  modalBtnText: { fontSize: 28, fontWeight: '900', color: '#fff', textShadowColor: '#B02B2B', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
});
