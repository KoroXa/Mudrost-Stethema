// src/api/apiService.js
const BASE_URL = 'http://localhost:3000'; 

// Добавляем параметр signal
export const getQuotes = async (limit = 20, signal = null) => {
  try {
    // Если сервер json-server v1, он игнорирует _limit, поэтому забираем всё
    const response = await fetch(`${BASE_URL}/quotes`, { signal });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    return data; // Возвращаем весь массив (пагинацию сделаем на клиенте)
  } catch (error) {
    // Убираем console.error, чтобы не было красных экранов
    throw error; 
  }
};