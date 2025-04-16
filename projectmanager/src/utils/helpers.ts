import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Форматирует дату в локализованный формат
 * @param date - Строка даты в ISO формате или объект Date
 * @param formatStr - Строка формата (опционально)
 * @returns Отформатированная строка даты
 */
export function formatDate(date: string | Date | undefined, formatStr: string = 'd MMMM yyyy'): string {
  if (!date) return 'Не указана';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ru });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Неверный формат';
  }
}

/**
 * Вычисляет процент выполнения на основе завершенных и общего количества задач
 * @param completed - Количество завершенных задач
 * @param total - Общее количество задач
 * @returns Процент выполнения (0-100)
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Форматирует относительную дату (сегодня, вчера, завтра, и т.д.)
 * @param date - Строка даты в ISO формате или объект Date
 * @returns Относительная строка даты
 */
export function formatRelativeDate(date: string | Date | undefined): string {
  if (!date) return 'Не указана';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    
    // Сброс времени для сравнения только дат
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const targetDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    if (targetDate.getTime() === today.getTime()) {
      return 'Сегодня';
    } else if (targetDate.getTime() === tomorrow.getTime()) {
      return 'Завтра';
    } else if (targetDate.getTime() === yesterday.getTime()) {
      return 'Вчера';
    } else {
      return formatDate(date);
    }
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Неверный формат';
  }
}

/**
 * Проверяет, просрочена ли дата
 * @param date - Строка даты в ISO формате или объект Date
 * @returns true, если дата в прошлом
 */
export function isOverdue(date: string | Date | undefined): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    
    // Сброс времени для более честного сравнения (считать просроченным только если дата < сегодня)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    return targetDate < today;
  } catch (error) {
    console.error('Error checking if date is overdue:', error);
    return false;
  }
}

/**
 * Сокращает текст до указанной длины с добавлением многоточия
 * @param text - Исходный текст
 * @param maxLength - Максимальная длина
 * @returns Сокращенный текст
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

/**
 * Генерирует случайный цвет в формате HEX
 * @returns Строка с HEX цветом
 */
export function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Генерирует пастельный цвет на основе строки (например, имени пользователя)
 * @param str - Строка для генерации цвета
 * @returns Строка с HEX цветом
 */
export function stringToColor(str: string): string {
  if (!str) return '#6366f1'; // Значение по умолчанию (indigo)
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    // Создаем более пастельные цвета, смещая диапазон
    const value = ((hash >> (i * 8)) & 0xFF);
    const pastelValue = Math.floor(((value + 255) / 2) * 0.7 + 76.5); // Смещаем к пастельным оттенкам
    const hex = pastelValue.toString(16).padStart(2, '0');
    color += hex;
  }
  
  return color;
} 