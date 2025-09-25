import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MemoriesContext = createContext(null);

/**
 * shape Memory:
 * {
 *   id: string, category: 'joy'|'personal'|'challenges',
 *   title: string, description: string,
 *   dateISO: string,     // '2025-09-18' (локальная дата) или ISO
 *   photoUri?: string,   // file://... или asset uri
 *   createdAt: number
 * }
 */

export function MemoriesProvider({ children }) {
  const [memories, setMemories] = useState([]);
  const [points, setPoints] = useState(0);
  const [purchasedTips, setPurchasedTips] = useState([]);

  // загрузка/сохранение
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@air_moments_diary__memories');
        if (raw) setMemories(JSON.parse(raw));
        
        const pointsRaw = await AsyncStorage.getItem('@air_moments_diary__points');
        if (pointsRaw) setPoints(parseInt(pointsRaw) || 0);
        
        const tipsRaw = await AsyncStorage.getItem('@air_moments_diary__purchased_tips');
        if (tipsRaw) setPurchasedTips(JSON.parse(tipsRaw));
      } catch {}
    })();
  }, []);
  
  useEffect(() => {
    AsyncStorage.setItem('@air_moments_diary__memories', JSON.stringify(memories)).catch(() => {});
  }, [memories]);
  
  useEffect(() => {
    AsyncStorage.setItem('@air_moments_diary__points', points.toString()).catch(() => {});
  }, [points]);
  
  useEffect(() => {
    AsyncStorage.setItem('@air_moments_diary__purchased_tips', JSON.stringify(purchasedTips)).catch(() => {});
  }, [purchasedTips]);

  const addMemory = (m) => {
    setMemories((arr) => [{ ...m, id: String(Date.now()), createdAt: Date.now() }, ...arr]);
  };
  const updateMemory = (id, patch) => setMemories((arr) => arr.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeMemory = (id) => setMemories((arr) => arr.filter((x) => x.id !== id));

  const getByDate = (dateISO) => memories.filter((m) => (m.dateISO || '').slice(0, 10) === dateISO.slice(0, 10));
  
  const addPoints = (amount) => setPoints(prev => prev + amount);
  const spendPoints = (amount) => {
    if (points >= amount) {
      setPoints(prev => prev - amount);
      return true;
    }
    return false;
  };
  
  const purchaseTip = (tipId, cost) => {
    if (spendPoints(cost)) {
      setPurchasedTips(prev => [...prev, tipId]);
      return true;
    }
    return false;
  };
  
  const isTipPurchased = (tipId) => purchasedTips.includes(tipId);

  const value = useMemo(() => ({ 
    memories, addMemory, updateMemory, removeMemory, getByDate,
    points, addPoints, spendPoints, purchaseTip, isTipPurchased
  }), [memories, points, purchasedTips]);

  return <MemoriesContext.Provider value={value}>{children}</MemoriesContext.Provider>;
}

export const useMemories = () => {
  const ctx = useContext(MemoriesContext);
  if (!ctx) throw new Error('useMemories must be used within MemoriesProvider');
  return ctx;
};
