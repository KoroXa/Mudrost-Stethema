// src/store/useQuoteStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_QUOTES } from '../constants/mockData';

export const useQuoteStore = create(
  persist(
    (set, get) => ({
      quotes: [],
      isLoading: false,
      hasHydrated: false,

      // 1. READ (Имитация загрузки)
      fetchQuotes: async () => {
        set({ isLoading: true });
        console.log("🚀 Загрузка цитат (локальный режим)...");
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (get().quotes.length === 0) {
          set({ quotes: MOCK_QUOTES });
        }
        set({ isLoading: false });
        console.log("✅ Цитаты загружены!");
      },

      // 2. CREATE (Добавление)
      addQuote: (quoteData) => {
        const newQuote = {
          ...quoteData,
          id: Date.now().toString(),
          isLiked: false,
          dateAdded: new Date().toISOString(),
          statusHistory: [{ status: 'created', date: new Date().toISOString() }],
        };
        set((state) => ({ quotes: [newQuote, ...state.quotes] }));
      },

      // 3. UPDATE (Лайк/Дизлайк)
      toggleLike: (id) => {
        set((state) => ({
          quotes: state.quotes.map((q) => {
            if (q.id === id) {
              const newStatus = !q.isLiked ? 'liked' : 'unliked';
              return {
                ...q,
                isLiked: !q.isLiked,
                statusHistory: [...q.statusHistory, { status: newStatus, date: new Date().toISOString() }],
              };
            }
            return q;
          }),
        }));
      },

      // 4. DELETE (Удаление)
      deleteQuote: (id) => {
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== id),
        }));
      },
    }),
    {
      name: 'mudrost-stethema-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 14, 
      migrate: (persistedState, version) => {
        if (version !== 14) {
          return { quotes: [] }; 
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    }
  )
);