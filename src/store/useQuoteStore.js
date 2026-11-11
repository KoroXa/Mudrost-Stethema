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
      error: null, // <--- ДОБАВИЛИ СОСТОЯНИЕ ОШИБКИ
      hasHydrated: false,

      fetchQuotes: async () => {
        set({ isLoading: true, error: null }); // Сбрасываем старую ошибку при новом запросе
        console.log("🚀 Запрос к серверу...");
        
        try {
          const serverQuotes = await getQuotes(20);
          set({ quotes: serverQuotes });
          console.log("✅ Данные получены!");
        } catch (err) {
          console.log("⚠️ Ошибка сети:", err.message);
          // Записываем понятный текст ошибки для UI
          set({ error: "Не удалось загрузить цитаты. Проверьте интернет-соединение." });
        } finally {
          // Блок finally гарантированно выключает спиннер (как требует ТЗ)
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