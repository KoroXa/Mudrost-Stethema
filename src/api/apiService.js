// src/api/apiService.js

const BASE_URL = 'http://localhost:3000'; 

export const getQuotes = async (limit = 10) => {
  try {
    // 1. УБИРАЕМ ?_limit=10, чтобы сервер не искал несуществующее поле
    const response = await fetch(`${BASE_URL}/quotes`);
    
    console.log(`📡 Статус ответа API: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // 2. Получаем ВСЕ данные от сервера
    const data = await response.json();
    
    // 3. Если данных больше, чем лимит, отрезаем лишнее прямо в коде
    // (Если тебе вообще не нужен лимит, можешь просто вернуть data)
    return data.slice(0, limit); 
    
  } catch (error) {
    console.error("❌ Ошибка сети:", error);
    throw error;
  }
};