import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  Share,
  Dimensions,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const PANEL_H = Math.min(height * 0.62, 520);

/* assets */
const BG_IMG   = require('../assets/bg.webp');
const LOGO_SM  = require('../assets/logo.webp');
const LOGO_BIG = require('../assets/logo.webp');

/* Palettes (purple → yellow, как на скрине) */
const PANEL_GRADIENT = ['#4B1FAE', '#7B2CBF', '#F72585', '#FF8A4C', '#FFD84D'];
const BTN_GRADIENT   = ['#3C1B7A', '#7B2CBF', '#E350A4', '#FF8A4C', '#FFD84D'];
const OK_GRADIENT    = ['#145B47', '#20C997', '#2ECC71'];
const BAD_GRADIENT   = ['#8E1E1E', '#E03131', '#FF6B6B'];

/* ————— Quiz content ————— */
const QUESTIONS = [
  {
    id: 'q1',
    text: 'What is the main purpose of Air Moments Diary?',
    options: [
      { id: 'a', text: 'To turn your memories into a colorful journal', correct: true },
      { id: 'b', text: 'To edit long videos with effects', correct: false },
      { id: 'c', text: 'To manage team tasks and deadlines', correct: false },
    ],
    explain: 'Air Moments Diary is designed to preserve your sweetest memories in a playful, colorful journal.',
  },
  {
    id: 'q2',
    text: 'Which items can you add to a memory?',
    options: [
      { id: 'a', text: 'Photo, title, and a short note', correct: true },
      { id: 'b', text: 'Only a text caption', correct: false },
      { id: 'c', text: 'Only a photo without text', correct: false },
    ],
    explain: 'You can attach a photo, give it a title, and add a short note to capture every detail.',
  },
  {
    id: 'q3',
    text: 'How are memories organized in Air Moments Diary?',
    options: [
      { id: 'a', text: 'By file size', correct: false },
      { id: 'b', text: 'Into three bubble-inspired categories', correct: true },
      { id: 'c', text: 'Alphabetically by title only', correct: false },
    ],
    explain: 'Memories belong to bubble categories that reflect joy, love, and life lessons.',
  },
  {
    id: 'q4',
    text: 'Which views can you use to revisit your moments?',
    options: [
      { id: 'a', text: 'A simple list and a calendar view', correct: true },
      { id: 'b', text: 'Spreadsheet and code editor views', correct: false },
    ],
    explain: 'Browse memories as a friendly list or jump to specific dates using the calendar.',
  },
  {
    id: 'q5',
    text: 'What spirit does the app try to encourage?',
    options: [
      { id: 'a', text: 'Serious data analytics', correct: false },
      { id: 'b', text: 'Playful reflection and meaningful reminiscing', correct: true },
      { id: 'c', text: 'Competitive gaming', correct: false },
    ],
    explain: 'It’s built to make reminiscing enjoyable and meaningful—playful, not competitive.',
  },
];

/* ————— Screen ————— */
export default function AboutScreen({ navigation }) {
  const goHome = () => {
    console.log('Navigating to Home screen...');
    navigation.replace('Home');
  };

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const total = QUESTIONS.length;

  const q = useMemo(() => QUESTIONS[step], [step]);

  const onPick = (opt) => {
    if (picked) return;
    setPicked(opt.id);
    if (opt.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (step + 1 < total) { setStep(step + 1); setPicked(null); }
    else { setFinished(true); }
  };

  const restart = () => { setStep(0); setPicked(null); setScore(0); setFinished(false); };

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        title: 'Air Moments Diary — Quiz result',
        message: `I scored ${score}/${total} on the Air Moments Diary quiz! 📔✨`,
      });
    } catch {}
  }, [score, total]);

  return (
    <ImageBackground source={BG_IMG} style={{ flex: 1 }} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable 
              onPress={goHome} 
              hitSlop={15} 
              style={styles.logoBtn}
              android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            >
              <Image source={LOGO_SM} style={styles.logo} />
            </Pressable>
            <Text style={styles.headerTitle}>About · Quiz</Text>
            <View pointerEvents="none" style={styles.headerCap} />
          </View>

          {/* Logo */}
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Pressable 
              onPress={goHome} 
              hitSlop={20}
              style={({ pressed }) => [
                { 
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }]
                }
              ]}
            >
              <Image source={LOGO_BIG} style={{ width: width * 0.52, height: width * 0.52, borderRadius: 24 }} resizeMode="contain" />
            </Pressable>
            <Text style={styles.logoHint}>Нажмите на логотип для возврата на главную</Text>
          </View>

          {/* SINGLE container panel */}
          {!finished ? (
            <LinearGradient colors={PANEL_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.panel}>
              <View style={styles.content}>
                <Text style={[styles.progress, { marginTop: 6, textAlign: 'center' }]}>{`Question ${step + 1} of ${total}`}</Text>
                <Text style={[styles.qText, { marginTop: 8 }]}>{q.text}</Text>

                <FlatList
                  data={q.options}
                  keyExtractor={(o) => o.id}
                  contentContainerStyle={{ marginTop: 8 }}
                  scrollEnabled={false}
                  renderItem={({ item: opt }) => {
                    const isPicked = picked === opt.id;
                    const correct = opt.correct;

                    let grad = BTN_GRADIENT;
                    if (picked) {
                      if (isPicked && correct) grad = OK_GRADIENT;
                      else if (isPicked && !correct) grad = BAD_GRADIENT;
                      else if (correct) grad = ['#134E40', '#1FB985', '#2ECC71']; // показать правильный
                    }

                    return (
                      <View style={{ marginHorizontal: 16, marginVertical: 10 }}>
                        <Pressable disabled={!!picked} onPress={() => onPick(opt)} style={{ alignSelf: 'stretch' }}>
                           <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.option}>
                             {/* Внутренний «отступ» реализован margin у текста */}
                             <Text style={[styles.optionText, { marginVertical: 16, marginHorizontal: 18 }]}>
                               {opt.text}
                             </Text>
                           </LinearGradient>
                        </Pressable>
                      </View>
                    );
                  }}
                />

                {picked && <Text style={[styles.explain, { marginTop: 10 }]}>{q.explain}</Text>}

                <Pressable
                  onPress={next}
                  disabled={!picked}
                  style={[styles.primaryBtn, !picked && { opacity: 0.5 }, { marginTop: 14, alignSelf: 'center' }]}
                >
                  <Text style={[styles.primaryTxt, { marginHorizontal: 18, marginVertical: 8 }]}>
                    {step + 1 === total ? 'Finish' : 'Next'}
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          ) : (
            <LinearGradient colors={PANEL_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.panel}>
              <View style={styles.content}>
                <Text style={[styles.resultTitle, { marginTop: 4 }]}>Great job!</Text>
                <Text style={[styles.resultScore, { marginTop: 4 }]}>{`${score} / ${total}`}</Text>
                <Text style={[styles.resultHint, { marginTop: 6 }]}>
                  Air Moments Diary helps you turn your sweetest memories into a playful, meaningful journal.
                </Text>

                <View style={[styles.row, { marginTop: 10 }]}>
                  <Pressable onPress={restart} style={[styles.secondaryBtn, { marginLeft: 8 }]}>
                    <Text style={[styles.secondaryTxt, { marginHorizontal: 12, marginVertical: 6 }]}>Try again</Text>
                  </Pressable>
                  <Pressable onPress={onShare} style={[styles.primaryBtn, { marginRight: 8 }]}>
                    <Text style={[styles.primaryTxt, { marginHorizontal: 14, marginVertical: 6 }]}>Share</Text>
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ————— styles ————— */
const styles = StyleSheet.create({
  header: {
    position: 'relative',
    marginHorizontal: -5,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerCap: {
    position: 'absolute',
    left: 0, right: 0, bottom: -1,
    height: 34,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderColor: '#FF6B35',
    borderWidth: 3,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
  },
  logoBtn: { 
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logo: { width: 98, height: 98, borderRadius: 10 },
  logoHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: '#7B2CBF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  /* SINGLE panel container */
  panel: {
    width: width - 16,
    minHeight: PANEL_H,
    borderRadius: 28,
    alignSelf: 'center',
    marginTop: 14,
    // лёгкое свечение
    shadowColor: '#7B2CBF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden', // ничего не дублируется и не вылезает
  },
  content: {
    marginHorizontal: 12, // отступы — margin
    marginVertical: 10,
    alignSelf: 'stretch',
  },

  progress: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  qText: {
    fontSize: 20,
    lineHeight: 26,
    color: '#FFD84D',
    textAlign: 'center',
    textShadowColor: '#7B2CBF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

   option: {
     borderRadius: 20,
     borderWidth: 2,
     borderColor: 'rgba(255,255,255,0.3)',
     minHeight: 60, // увеличиваем минимальную высоту
   },
   optionText: { 
     fontSize: 18, 
     color: '#FFFFFF', 
     fontWeight: '700', 
     textAlign: 'center',
     lineHeight: 24,
   },

  explain: { fontSize: 14, lineHeight: 20, color: '#FFFFFF', textAlign: 'center' },

  primaryBtn: { borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  primaryTxt: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: '#7B2CBF',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  /* result */
  resultTitle: {
    fontSize: 22, fontWeight: '900', color: '#FFFFFF',
    textShadowColor: '#7B2CBF', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, textAlign: 'center',
  },
  resultScore: {
    fontSize: 40, fontWeight: '900', color: '#FFFFFF',
    textShadowColor: '#7B2CBF', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6, textAlign: 'center',
  },
  resultHint: {
    fontSize: 16, color: '#FFD84D', textAlign: 'center',
    textShadowColor: '#7B2CBF', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  secondaryBtn: { borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  secondaryTxt: {
    fontSize: 24, fontWeight: '900', color: '#FFFFFF',
    textShadowColor: '#7B2CBF', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
});
