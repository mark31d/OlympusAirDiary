// App.js — entry point for Air Moments Diary
// Экраны и контекст лежат в ./Components/

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/* context */
import { MemoriesProvider } from './Components/MemoriesContext';

/* screens (ровно те, что у тебя в папке) */
import Loader               from './Components/Loader';
import Onboarding           from './Components/Onboarding';
import HomeScreen           from './Components/HomeScreen';

import AddCategoryScreen    from './Components/AddCategoryScreen';
import AddMemoryPhotoTitle  from './Components/AddMemoryPhotoTitle';
import AddMemoryDateDesc    from './Components/AddMemoryDateDesc';
import AddMemoryDone        from './Components/AddMemoryDone';

import MemoryScreen         from './Components/MemoryScreen';
import CalendarScreen       from './Components/CalendarScreen';
import AboutScreen          from './Components/AboutScreen';

/* nav */
const Stack = createNativeStackNavigator();

/* Обёртка для Loader, чтобы мягко перейти на Onboarding */
function LoaderScreen({ navigation }) {
  return (
    <Loader
      delay={3000}
      fadeMs={300}
      onFinish={() => navigation.replace('Onboarding')}
    />
  );
}

export default function App() {
  // «тёмная подложка», чтобы не мигала белая между градиентами
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#000',
      card: '#000',
      text: '#fff',
      primary: '#FF6A3D',
      border: '#000',
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <NavigationContainer theme={theme}>
        <MemoriesProvider>
          <Stack.Navigator
            initialRouteName="Loader"
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: '#000' },
            }}
          >
            {/* Splash → Onboarding */}
            <Stack.Screen
              name="Loader"
              component={LoaderScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="Onboarding"
              component={Onboarding}
              options={{ gestureEnabled: false }}
            />

            {/* Меню */}
            <Stack.Screen name="Home" component={HomeScreen} />

            {/* Добавление памяти (3 шага + done) */}
            <Stack.Screen name="AddCategory"   component={AddCategoryScreen} />
            <Stack.Screen name="AddPhotoTitle" component={AddMemoryPhotoTitle} />
            <Stack.Screen name="AddDateDesc"   component={AddMemoryDateDesc} />
            <Stack.Screen name="AddDone"       component={AddMemoryDone} />

            {/* Память и Календарь */}
            <Stack.Screen name="Memory"   component={MemoryScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />

            {/* About */}
            <Stack.Screen name="About" component={AboutScreen} />
          </Stack.Navigator>
        </MemoriesProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
