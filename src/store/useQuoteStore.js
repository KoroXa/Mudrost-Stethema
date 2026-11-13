// src/store/useQuoteStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getQuotesFromDB, createQuoteInDB, toggleLikeInDB, deleteQuoteFromDB } from '../api/supabaseService';

export const useQuoteStore = create(
  persist(
    (set, get) => ({
      quotes: [],
      isLoading: false,
      isRefreshing: false,
      error: null,
      hasHydrated: false,

      // 1. ЗАГРУЗКА ЦИТАТ
      fetchQuotes: async (isRefresh = false) => {
        if (isRefresh) set({ isRefreshing: true });
        else set({ isLoading: true });
        set({ error: null });

        try {
          const serverQuotes = await getQuotesFromDB();
          
          // Преобразуем поля из базы (snake_case) в наш формат (camelCase)
          const formattedQuotes = serverQuotes.map(q => ({
            ...q,
            sourceUrl: q.source_url,
            coverImage: q.cover_image,
            isLiked: q.is_liked,
            dateAdded: q.date_added,
            statusHistory: q.status_history
          }));

          set({ quotes: formattedQuotes });
        } catch (err) {
          console.log("Ошибка загрузки:", err);
          set({ error: "Не удалось загрузить цитаты. Проверьте интернет." });
        } finally {
          set({ isLoading: false, isRefreshing: false });
        }
      },

      // 2. ДОБАВЛЕНИЕ ЦИТАТЫ
      addQuote: async (quoteData) => {
        const now = new Date().toISOString();
        const payload = {
          ...quoteData,
          statusHistory: [{ status: 'created', date: now }],
        };

        try {
          const savedQuote = await createQuoteInDB(payload);
          
          const formattedQuote = {
            ...savedQuote,
            sourceUrl: savedQuote.source_url,
            coverImage: savedQuote.cover_image,
            isLiked: savedQuote.is_liked,
            dateAdded: savedQuote.date_added,
            statusHistory: savedQuote.status_history
          };

          set((state) => ({ quotes: [formattedQuote, ...state.quotes] }));
        } catch (error) {
          console.log("Ошибка сохранения в БД:", error);
          alert("Не удалось сохранить цитату на сервере.");
        }
      },

      // 3. ЛАЙК / ДИЗЛАЙК
      toggleLike: async (id) => {
        const currentQuote = get().quotes.find(q => q.id === id);
        if (!currentQuote) return;
        const newIsLiked = !currentQuote.isLiked;

        // Оптимистичное обновление (сразу меняем цвет сердечка)
        set((state) => ({
          quotes: state.quotes.map((q) => q.id === id ? { ...q, isLiked: newIsLiked } : q),
        }));

        try {
          await toggleLikeInDB(id, newIsLiked);
        } catch (error) {
          console.log("Ошибка обновления лайка:", error);
          // Если ошибка — возвращаем как было
          set((state) => ({
            quotes: state.quotes.map((q) => q.id === id ? { ...q, isLiked: !newIsLiked } : q),
          }));
        }
      },

      // 4. УДАЛЕНИЕ
      deleteQuote: async (id) => {
        set((state) => ({ quotes: state.quotes.filter((q) => q.id !== id) }));
        try {
          await deleteQuoteFromDB(id);
        } catch (error) {
          console.log("Ошибка удаления:", error);
        }
      },
    }),
    {
      name: 'mudrost-stethema-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 27, // Сбрасываем кеш, чтобы приложение начало с чистого листа
      migrate: (persistedState, version) => {
        if (version !== 27) return { quotes: [] }; 
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    }
  )
);