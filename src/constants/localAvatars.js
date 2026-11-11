// src/constants/localAvatars.js

// Здесь мы связываем имя автора (как в mockData) с локальным файлом
export const AVATARS = {
  'Альберт Эйнштейн': require('../../assets/avatars/einstein.jpg'),
  'Уильям Шекспир': require('../../assets/avatars/shakespeare.png'),
  'Джейсон Стетхем': require('../../assets/avatars/statham.png'),
  'Джейсон Стетхем (народное)': require('../../assets/avatars/statham.png'),
  'Владимир Путин': require('../../assets/avatars/putin.png'),
  'Дональд Трамп': require('../../assets/avatars/trump.png'),
  'Джо Байден': require('../../assets/avatars/biden.png'),
  'Ким Чен Ын (интернет-мем)': require('../../assets/avatars/kim.png'),
  'Иосиф Сталин': require('../../assets/avatars/stalin.png'),
  'Никита Хрущёв': require('../../assets/avatars/khrushchev.png'),
  'Борис Ельцин': require('../../assets/avatars/yeltsin.png'),
  'Вин Дизель (Доминик Торетто)': require('../../assets/avatars/vin_diesel.png'),
  'Вячеслав Володин': require('../../assets/avatars/volodin.png'),
  'Евгений Пригожин': require('../../assets/avatars/prigozhin.png'),
};

// Функция-помощник: возвращает картинку или null, если её нет
export const getLocalAvatar = (author) => {
  return AVATARS[author] || null;
};