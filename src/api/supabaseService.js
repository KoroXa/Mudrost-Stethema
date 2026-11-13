// src/api/supabaseService.js
import { supabase } from '../lib/supabase';

// 1. Получение цитат текущего пользователя
export const getQuotesFromDB = async () => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('date_added', { ascending: false });
    
  if (error) throw error;
  return data;
};

// 2. Добавление новой цитаты в базу
// src/api/supabaseService.js
// ... (функция getQuotesFromDB остается без изменений)

// 2. Добавление новой цитаты в базу
export const createQuoteInDB = async (quoteData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Пользователь не авторизован');

  const { data, error } = await supabase
    .from('quotes')
    .insert([{ 
      // ВАЖНО: Мы НЕ передаем id, Supabase сгенерирует его сам!
      text: quoteData.text,
      author: quoteData.author,
      tags: quoteData.tags,
      source_url: quoteData.sourceUrl,
      cover_image: quoteData.coverImage,
      is_liked: false,
      status_history: quoteData.statusHistory,
      user_id: user.id
    }])
    .select(); // .select() возвращает нам только что созданную запись

  if (error) throw error;
  return data[0];
};

// ... (остальные функции toggleLikeInDB и deleteQuoteFromDB без изменений)

// 3. Обновление лайка
export const toggleLikeInDB = async (id, isLiked) => {
  const { error } = await supabase
    .from('quotes')
    .update({ is_liked: isLiked })
    .eq('id', id);
    
  if (error) throw error;
};

// 4. Удаление цитаты
export const deleteQuoteFromDB = async (id) => {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};