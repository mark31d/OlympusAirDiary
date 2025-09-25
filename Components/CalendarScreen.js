// Components/CalendarScreen.js
import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, ImageBackground,
  Pressable, FlatList, Share, Dimensions,
  TextInput, Platform
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
const ARROW_L  = require('../assets/arrowL.webp');

/* Универсальная градиентная рамка */
function GradientBorder({
  children,
  radius = 20,
  borderWidth = 3,
  colors = ['#F72585', '#E91E63'],
  start = { x: 0, y: 0 },
  end   = { x: 1, y: 1 },
  style,
  innerStyle,
}) {
  return (
    <LinearGradient colors={colors} start={start} end={end} style={[{ borderRadius: radius }, style]}>
      <View style={[{ borderRadius: radius - 0.5, margin: borderWidth, backgroundColor: 'rgba(0,0,0,0.18)' }, innerStyle]}>
        {children}
      </View>
    </LinearGradient>
  );
}

export default function CalendarScreen({ navigation }) {
  const { memories, updateMemory, removeMemory } = useMemories();

  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedISO, setSelectedISO] = useState(null);

  const [mode, setMode] = useState('calendar'); // 'calendar' | 'details' | 'edit' | 'confirmDelete'
  const [currentId, setCurrentId] = useState(null);

  // state для редактирования (как в MemoryScreen)
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [desc, setDesc] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const goHome = () => navigation.replace('Home');

  const month = useMemo(() => buildMonth(monthDate), [monthDate]);

  const daysWith = useMemo(() => {
    const map = new Set();
    const y = monthDate.getFullYear(), m = monthDate.getMonth();
    for (const it of memories) {
      if (!it.dateISO) continue;
      const d = new Date(it.dateISO);
      if (d.getFullYear() === y && d.getMonth() === m) map.add(keyISO(d));
    }
    return map;
  }, [memories, monthDate]);

  const dayList = useMemo(() => {
    if (!selectedISO) return [];
    return memories
      .filter(m => keyISO(new Date(m.dateISO)) === selectedISO)
      .sort((a, b) => (b.dateISO || '').localeCompare(a.dateISO || ''));
  }, [memories, selectedISO]);

  const currentItem = useMemo(
    () => memories.find(m => m.id === currentId) || null,
    [memories, currentId]
  );

  /* handlers */
  const prevMonth = () => setMonthDate(shiftMonth(monthDate, -1));
  const nextMonth = () => setMonthDate(shiftMonth(monthDate, +1));

  const onShare = useCallback(async (it) => {
    try {
      await Share.share({
        title: it.title,
        message: `${it.title}\n${fmt(it.dateISO)}\n${it.description ?? ''}`,
      });
    } catch {}
  }, []);

  const openDetails = (id) => { setCurrentId(id); setMode('details'); };

  const openEdit = () => {
    if (!currentItem) return;
    setTitle(currentItem.title || '');
    setDesc(currentItem.description || '');
    setDate(currentItem.dateISO ? new Date(currentItem.dateISO) : new Date());
    setPhotoUri(currentItem.photoUri || null);
    setShowPicker(false);
    setMode('edit');
  };

  const openDelete = () => setMode('confirmDelete');

  const pickPhoto = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.9 });
    if (res?.assets?.length) setPhotoUri(res.assets[0].uri);
  };

  const saveEdit = () => {
    if (!currentItem) return;
    const nextISO = date.toISOString();
    updateMemory(currentItem.id, {
      title: title.trim() || 'Untitled',
      description: desc.trim(),
      dateISO: nextISO,
      photoUri,
    });
    setSelectedISO(keyISO(new Date(nextISO)));
    setMode('details');
  };

  const doDelete = () => {
    if (!currentItem) return;
    removeMemory(currentItem.id);
    setMode('calendar');
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
            <Text style={styles.headerTitle}>Calendar</Text>
            <View pointerEvents="none" style={styles.headerCap} />
          </View>

          {/* CALENDAR */}
          {mode === 'calendar' && (
            <>
              <View style={styles.monthRow}>
                <Pressable onPress={prevMonth} style={styles.monthArrow}>
                  <Image source={ARROW_L} style={styles.monthArrowImg} />
                </Pressable>
                <Text style={styles.monthTitle}>{month.title}</Text>
                <Pressable onPress={nextMonth} style={styles.monthArrow}>
                  <Image source={ARROW_L} style={[styles.monthArrowImg, styles.monthArrowRight]} />
                </Pressable>
              </View>

              <View style={styles.grid}>
                {month.days.map((d, idx) => {
                  const key = d ? keyISO(d) : `e-${idx}`;
                  const active = d && selectedISO === key;
                  const has = d && daysWith.has(key);
                  return (
                    <Pressable
                      key={key}
                      disabled={!d}
                      onPress={() => { setSelectedISO(key); setCurrentId(null); }}
                      style={[styles.cell, !d && styles.cellEmpty, active && styles.cellActive, has && styles.cellHas]}
                    >
                      {!!d && <Text style={styles.cellText}>{d.getDate()}</Text>}
                    </Pressable>
                  );
                })}
              </View>

              {selectedISO ? (
                dayList.length === 0 ? (
                  <CandyPanel text="You had no entries on this day." />
                ) : (
                  <FlatList
                    data={dayList}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => <CardPreview item={item} onOpen={() => openDetails(item.id)} />}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                  />
                )
              ) : null}
            </>
          )}

          {/* DETAILS */}
          {mode === 'details' && currentItem && (
            <View style={styles.detailsContainer}>
              <Pressable onPress={() => setMode('calendar')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 8 }}>
                <Image source={ARROW_S} style={styles.backArrow} />
              </Pressable>

              <View style={styles.card}>
                {!!currentItem.photoUri && <Image source={{ uri: currentItem.photoUri }} style={styles.cardPhoto} />}
                <Text style={styles.cardTitle}>{currentItem.title}</Text>
                <Text style={styles.cardDate}>{fmt(currentItem.dateISO)}</Text>
                {!!currentItem.description && <Text style={styles.cardDesc}>{currentItem.description}</Text>}

                <View style={styles.actions}>
                  <Pressable onPress={() => onShare(currentItem)}><Text style={styles.actionText}>Share</Text></Pressable>
                  <Pressable onPress={openEdit}><Text style={styles.actionText}>Edit</Text></Pressable>
                  <Pressable onPress={openDelete}><Text style={styles.actionText}>Delete</Text></Pressable>
                </View>
              </View>
            </View>
          )}

          {/* EDIT */}
          {mode === 'edit' && currentItem && (
            <View style={styles.editContainer}>
              <Pressable onPress={() => setMode('details')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 8 }}>
                <Image source={ARROW_S} style={styles.backArrow} />
              </Pressable>

              <Pressable onPress={pickPhoto} style={styles.photoBox}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
                ) : currentItem.photoUri ? (
                  <Image source={{ uri: currentItem.photoUri }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, color: '#FFD700', textShadowColor: '#F72585', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>Add photo</Text>
                  </View>
                )}
              </Pressable>

              <View style={styles.inputWrap}>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  placeholder="Title"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                />
              </View>

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
                  />
                </View>
              )}

              <View style={styles.textAreaWrap}>
                <TextInput
                  value={desc}
                  onChangeText={setDesc}
                  placeholder="Description"
                  placeholderTextColor="rgba(255,255,255,0.7)"
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
          {mode === 'confirmDelete' && currentItem && (
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

/* helpers */
function CardPreview({ item, onOpen }) {
  return (
    <View style={styles.preview}>
      {!!item.photoUri && <Image source={{ uri: item.photoUri }} style={styles.previewPhoto} />}
      <Text style={styles.previewTitle}>{item.title}</Text>
      <Text style={styles.previewDate}>{fmt(item.dateISO)}</Text>
      {!!item.description && <Text numberOfLines={2} style={styles.previewDesc}>{item.description}</Text>}
      <Pressable onPress={onOpen} hitSlop={10} style={styles.moreBtn}><Text style={styles.moreText}>More</Text></Pressable>
    </View>
  );
}

function CandyPanel({ text }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyPanelOuter}>
        <Image source={FRAME} style={styles.frameImg} resizeMode="stretch" pointerEvents="none" />
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
          <Image source={FRAME} style={styles.modalFrame} resizeMode="stretch" pointerEvents="none" />
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

/* date utils */
function keyISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
function shiftMonth(d, delta) {
  const nd = new Date(d);
  nd.setMonth(nd.getMonth() + delta);
  return nd;
}
function buildMonth(d) {
  const y = d.getFullYear();
  const m = d.getMonth();
  const first = new Date(y, m, 1);
  const startWeekday = (first.getDay() + 6) % 7; // 0 = Monday
  const daysIn = new Date(y, m + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let i = 1; i <= daysIn; i++) days.push(new Date(y, m, i));

  const monthName = first.toLocaleString(undefined, { month: 'long' });
  return { title: `${cap(monthName)} ${y}`, days };
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* styles */
const CELL = Math.floor((width - 24 - 6 * 8) / 7);

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    marginHorizontal: -5,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 40,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    overflow: 'visible',
  },
  headerCap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 36,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderColor: '#F72585',
    borderWidth: 3,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    zIndex: 0,
  },
  logoBtn: { padding: 6 },
  logo: { width: 98, height: 98, borderRadius: 10 },
  headerTitle: { fontSize: 30, fontWeight: '900', color: '#FFD700', textShadowColor: '#F72585', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },

  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 8 },
  monthTitle: { fontSize: 30, fontWeight: '800', color: '#FFD700', textShadowColor: '#F72585', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  monthArrow: { padding: 8 },
  monthArrowImg: { width: 32, height: 32, tintColor: '#F72585' },
  monthArrowRight: { transform: [{ rotate: '180deg' }] },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, marginTop: 8, marginBottom: 8 },
  cell: {
    width: CELL, height: CELL, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  cellEmpty: { opacity: 0 },
  cellHas: { backgroundColor: '#F72585' },
  cellActive: { borderWidth: 3, borderColor: '#F72585' },
  cellText: { fontSize: 18, fontWeight: '700', color: '#FFD700' },

  /* empty panel */
  emptyWrap: { marginTop: 8, marginHorizontal: 12, alignItems: 'center' },
  emptyPanelOuter: { position: 'relative', width: '80%', minHeight: 200, justifyContent: 'center' },
  frameImg: { position: 'absolute', width: '106%', height: 200, top: 0, left: 0, resizeMode: 'contain' },
  emptyPanel: { position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  emptyText: { fontSize: 22, fontWeight: '900', textAlign: 'center', color: '#FFD700', textShadowColor: '#F72585', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },

  /* preview card */
  preview: {
    borderRadius: 22, paddingBottom: 10,
    backgroundColor: 'rgba(247, 37, 133, 0.3)',
    borderWidth: 2.5, borderColor: '#F72585',
    overflow: 'hidden', width: width - 32, alignSelf: 'center', marginBottom: 12
  },
  previewPhoto: { width: '100%', height: Math.min(210, height * 0.23) },
  previewTitle: { fontSize: 24, fontWeight: '900', color: '#FFD700', marginTop: 6, marginHorizontal: 10, textShadowColor: '#B82D2D', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  previewDate: { marginTop: 8, marginHorizontal: 12, fontSize: 16, color: '#FFD700', textShadowColor: '#F72585', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, fontWeight: '700' },
  previewDesc: { marginTop: 6, marginHorizontal: 12, fontSize: 16, color: '#FFD700', textShadowColor: '#F72585', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  moreBtn: { position: 'absolute', right: 12, bottom: 8, padding: 6 },
  moreText: { fontSize: 22, fontWeight: '900', color: '#FFD700', textShadowColor: '#B82D2D', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },

  /* details card */
  card: {
    width: width - 32, alignSelf: 'center',
    borderRadius: 24, paddingBottom: 12,
    backgroundColor: 'rgba(247, 37, 133, 0.3)',
    borderWidth: 2.5, borderColor: '#F72585',
    overflow: 'hidden', marginTop: 4
  },
  cardPhoto: { width: '100%', height: Math.min(260, height * 0.28) },
  cardTitle: { fontSize: 28, fontWeight: '900', color: '#FFD700', marginTop: 8, marginHorizontal: 12, textShadowColor: '#B82D2D', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  cardDate: { marginTop: 12, marginHorizontal: 12, fontSize: 16, color: '#FFD700', textShadowColor: '#F72585', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, fontWeight: '700' },
  cardDesc: { marginTop: 10, marginHorizontal: 12, fontSize: 16, color: '#FFD700', textShadowColor: '#F72585', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  actions: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, marginBottom: 8 },
  actionText: { fontSize: 28, fontWeight: '900', color: '#FFD700', textShadowColor: '#B02B2B', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },

  /* back arrow */
  backArrow: {left:-160, width: 48, height: 48, transform: [{ rotate: '180deg' }] },

  /* edit */
  editContainer: { flex: 1, alignItems: 'center' },
  detailsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  photoBox: {
    width: width - 32, height: (width - 32) * 0.56,
    borderRadius: 18, borderWidth: 3, borderColor: '#F72585',
    alignSelf: 'center', marginTop: 12, overflow: 'hidden',
    backgroundColor: 'rgba(247, 37, 133, 0.3)',
  },
  inputWrap: {
    marginTop:10,
   width:350,
    borderRadius: 22, paddingHorizontal: 18,
    backgroundColor: 'rgba(247, 37, 133, 0.3)',
    borderWidth: 3, borderColor: '#F72585'
  },
  input: {height: 56, fontSize: 20, color: '#FFD700', textShadowColor: '#F72585', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },

  dateWrap: { marginTop: 12, paddingHorizontal: 4, width:350,},
  dateBox: { borderRadius: 18, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  dateText: { fontSize: 20, color: '#FFD700', fontWeight: '700' },

  calendarContainer: {
    marginTop: 16, marginHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16, padding: 12, borderWidth: 2, borderColor: '#F72585',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  calendar: { backgroundColor: 'transparent' },

  textAreaWrap: { width:350,
    marginTop: 12, marginHorizontal: 4,
    borderRadius: 22, backgroundColor: 'rgba(247, 37, 133, 0.3)',
    borderWidth: 3, borderColor: '#F72585'
  },
  textArea: { minHeight: 180, padding: 14, fontSize: 18, color: '#FFD700', textShadowColor: '#F72585', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },

  saveRow: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, gap: 20 },
  btnText: { fontSize: 28, fontWeight: '900', color: '#FFD700', textShadowColor: '#B02B2B', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
});
