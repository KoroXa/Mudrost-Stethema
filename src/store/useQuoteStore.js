// src/store/useQuoteStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getQuotes } from '../api/apiService';

// Глобальная переменная для контроллера (вне стора, чтобы не вызывать ререндер)
let abortController = null;

export const useQuoteStore = create(
  persist(
    (set, get) => ({
      quotes: [],
      isLoading: false,
      isRefreshing: false, // Для Pull-to-Refresh
      error: null,
      hasHydrated: false,
      page: 1,             // Для пагинации
      hasMore: true,       // Есть ли еще данные

      fetchQuotes: async (isRefresh = false) => {
        // Отменяем предыдущий запрос, если он был (предотвращение утечек)
        if (abortController) abortController.abort();
        abortController = new AbortController();

        if (isRefresh) {
          set({ isRefreshing: true });
        } else {
          set({ isLoading: true, page: 1 });
        }
        set({ error: null });

        try {
          const allQuotes = await getQuotes(20, abortController.signal);
          
          // Имитация пагинации на клиенте (берем первые 10 для 1-й страницы)
          const itemsPerPage = 10;
          const paginatedQuotes = allQuotes.slice(0, itemsPerPage);

          set({ 
            quotes: paginatedQuotes, 
            hasMore: allQuotes.length > itemsPerPage 
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            set({ error: "Не удалось загрузить цитаты. Проверьте интернет-соединение." });
          }
        } finally {
          set({ isLoading: false, isRefreshing: false });
        }
      },

      loadMore: async () => {
        const { quotes, page, hasMore, isLoading } = get();
        if (!hasMore || isLoading) return;

        set({ isLoading: true });
        try {
          const allQuotes = await getQuotes(20);
          const nextPage = page + 1;
          const itemsPerPage = 10;
          
          const newItems = allQuotes.slice(page * itemsPerPage, nextPage * itemsPerPage);

          set({ 
            quotes: [...quotes, ...newItems], 
            page: nextPage,
            hasMore: allQuotes.length > nextPage * itemsPerPage
          });
        } catch (err) {
          console.log("Ошибка пагинации", err);
        } finally {
          set({ isLoading: false });
        }
      },

      addQuote: (quoteData) => { /* ... без изменений ... */ },
      toggleLike: (id) => { /* ... без изменений ... */ },
      deleteQuote: (id) => { /* ... без изменений ... */ },
    }),
    {
      name: 'mudrost-stethema-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 23, // Сброс кеша
      migrate: (persistedState, version) => {
        if (version !== 23) return { quotes: [] }; 
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    }
  )
);