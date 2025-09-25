// Components/Loader.js
import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Image,
  ImageBackground,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

/* ── assets ──────────────────────────────────────────────────────────── */
// поменяй пути, если у тебя другие имена файлов
const BG_IMG   = require('../assets/bg.webp');      // полноэкранный фон
const LOGO_IMG = require('../assets/logo.webp');    // квадратный логотип

export default function Loader({
  delay = 3000,   // сколько держать заставку (мс)
  fadeMs = 300,   // длительность затухания (мс)
  onFinish,       // колбэк после исчезновения
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.5)).current;

  // HTML для WebView: новая анимация с градиентом и пульсацией
  const glitchHTML = useMemo(
    () => `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  html,body{margin:0;padding:0;background:transparent;overflow:hidden;}
  .wrap{display:flex;align-items:center;justify-content:center;width:100%;height:100%;}
  
  .loading-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px;
    width: 100%;
    height: 100%;
  }
  
  .loading-text {
    font-size: 18px;
    font-weight: 900;
    background: linear-gradient(45deg, #F72585, #FFD700, #F72585);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 2s ease-in-out infinite, pulse 1.5s ease-in-out infinite;
    text-shadow: 0 0 20px rgba(247, 37, 133, 0.5);
    letter-spacing: 1px;
    text-align: center;
    line-height: 1.2;
  }
  
  .loading-dots {
    display: flex;
    gap: 4px;
    margin-top: 12px;
  }
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(45deg, #F72585, #FFD700);
    animation: bounce 1.4s ease-in-out infinite both;
  }
  
  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }
  .dot:nth-child(3) { animation-delay: 0s; }
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { 
      transform: scale(0);
      opacity: 0.5;
    }
    40% { 
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="loading-container">
      <div class="loading-text">OLYMPUS AIR DIARY</div>
      <div class="loading-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  </div>
</body>
</html>`,
    []
  );

  useEffect(() => {
    // Анимация появления логотипа
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Анимация появления текста с задержкой
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // Непрерывная анимация пульсации логотипа
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    const t = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: fadeMs,
        useNativeDriver: true,
      }).start(() => {
        onFinish && onFinish();
      });
    }, delay);
    
    return () => {
      clearTimeout(t);
      pulseAnimation.stop();
    };
  }, [delay, fadeMs, onFinish, opacity, scale, rotate, textOpacity, textScale]);

  return (
    <Animated.View style={[styles.root, { opacity }]} pointerEvents="none">
      <ImageBackground
        source={BG_IMG}
        style={styles.bg}
        imageStyle={styles.bgImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe}>
          {/* анимированный логотип по центру */}
          <View style={styles.logoWrap}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [
                    { scale: scale },
                    { 
                      rotate: rotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }
                  ]
                }
              ]}
            >
              <Image source={LOGO_IMG} style={styles.logo} resizeMode="contain" />
            </Animated.View>
          </View>

          {/* анимированный текст загрузки */}
          <Animated.View 
            style={[
              styles.loadBar,
              {
                opacity: textOpacity,
                transform: [{ scale: textScale }]
              }
            ]}
          >
            <WebView
              originWhitelist={['*']}
              source={{ html: glitchHTML }}
              style={styles.webview}
              containerStyle={styles.webviewContainer}
              automaticallyAdjustContentInsets={false}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              bounces={false}
              javaScriptEnabled
              domStorageEnabled
              androidHardwareAccelerationDisabled={false}
            />
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </Animated.View>
  );
}

/* ── styles ───────────────────────────────────────────────────────────── */
const BAR_W = Math.min(0.85 * width, 400);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  bgImage: { transform: [{ scale: 1.02 }] },
  safe: { flex: 1, justifyContent: 'space-between' },

  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  },
  logoContainer: {
    shadowColor: '#F72585',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: 32,
  },

  loadBar: {
    alignSelf: 'center',
    width: BAR_W,
    height: 60,
    marginBottom: Platform.select({ ios: 36, android: 28 }),
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F72585',
    shadowColor: '#F72585',
    shadowOpacity: 0.6,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webviewContainer: {
    backgroundColor: 'transparent',
  },
});
