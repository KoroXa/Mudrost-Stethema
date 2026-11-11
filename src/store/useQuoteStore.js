// src/store/useQuoteStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getQuotes } from '../api/apiService';

export const useQuoteStore = create(
  persist(
    (set, get) => ({
      quotes: [],
      isLoading: false,
      hasHydrated: false, // <--- Флаг загрузки из памяти

      fetchQuotes: async () => {
        set({ isLoading: true });
        console.log("🚀 Запрос к серверу...");
        
        try {
          const serverQuotes = await getQuotes(20);
          console.log("📦 Что пришло от API:", serverQuotes);
          
          // Проверка: если сервер вернул массив, сохраняем его
          if (Array.isArray(serverQuotes)) {
             set({ quotes: serverQuotes });
             console.log("✅ Данные сохранены в стор!");
          } else {
             console.log("⚠️ Сервер вернул не массив!");
          }
        } catch (error) {
          console.log("⚠️ Ошибка сети:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addQuote: (quoteData) => {
        const now = new Date().toISOString();
        const newQuote = {
          ...quoteData,
          id: Date.now().toString(),
          isLiked: false,
          dateAdded: now,
          statusHistory: [{ status: 'created', date: now }],
        };
        set((state) => ({ quotes: [newQuote, ...state.quotes] }));
      },

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

      deleteQuote: (id) => {
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== id),
        }));
      },
    }),
    {
      name: 'mudrost-stethema-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 22, // <--- СБРАСЫВАЕМ КЕШ ЕЩЕ РАЗ
      migrate: (persistedState, version) => {
        if (version !== 22) return { quotes: [] }; 
        return persistedState;
      },
      // ЭТА ФУНКЦИЯ ВКЛЮЧАЕТ ФЛАГ, КОГДА ДАННЫЕ ЗАГРУЖЕНЫ ИЗ ПАМЯТИ
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);