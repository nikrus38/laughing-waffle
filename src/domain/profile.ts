/**
 * Правила профиля: нормализация имени и интересов, границы часов, инициалы.
 * Слой без React — поэтому проверяется unit-тестами без браузера.
 */

export const NAME_MIN = 2;
export const NAME_MAX = 60;
export const INTEREST_MAX_LENGTH = 24;
export const INTEREST_LIMIT = 8;
export const HOURS_MIN = 4;
export const HOURS_MAX = 30;

export type Course = 1 | 2 | 3 | 4;
export type Role = 'student' | 'partner';

export interface ProfileDraft {
  displayName: string;
  course: Course;
  interests: string[];
  weeklyHours: number;
}

/** Схлопывает лишние пробелы: «  Иван   Соколов » → «Иван Соколов». */
export function normalizeName(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** Текст ошибки под полем имени или null, если всё в порядке. */
export function validateName(value: string): string | null {
  const name = normalizeName(value);
  if (name.length < NAME_MIN) return 'Имя короче двух символов.';
  if (name.length > NAME_MAX) return `Не больше ${NAME_MAX} символов.`;
  return null;
}

export function normalizeInterest(value: string): string {
  return value.replace(/^#+/, '').replace(/\s+/g, ' ').trim();
}

export interface InterestResult {
  list: string[];
  error?: string;
}

/** Добавляет интерес без дублей и с ограничением количества. */
export function addInterest(list: string[], value: string): InterestResult {
  const interest = normalizeInterest(value);
  if (!interest) return { list };

  if (interest.length > INTEREST_MAX_LENGTH) {
    return { list, error: `Интерес длиннее ${INTEREST_MAX_LENGTH} символов.` };
  }

  const exists = list.some((item) => item.toLowerCase() === interest.toLowerCase());
  if (exists) return { list, error: 'Такой интерес уже есть.' };

  if (list.length >= INTEREST_LIMIT) {
    return { list, error: `Можно выбрать не больше ${INTEREST_LIMIT} интересов.` };
  }

  return { list: [...list, interest] };
}

export function removeInterest(list: string[], value: string): string[] {
  return list.filter((item) => item !== value);
}

export function clampHours(value: number): number {
  if (Number.isNaN(value)) return HOURS_MIN;
  return Math.min(HOURS_MAX, Math.max(HOURS_MIN, Math.round(value)));
}

/** Инициалы для аватара: первые буквы двух первых слов. */
export function initialsOf(name: string): string {
  const parts = normalizeName(name).split(' ').filter(Boolean).slice(0, 2);
  if (parts.length === 0) return 'ФТ';
  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

/** Сравнение черновика и сохранённого профиля — для кнопки «Сохранить». */
export function isDraftDirty(draft: ProfileDraft, saved: ProfileDraft): boolean {
  return (
    normalizeName(draft.displayName) !== normalizeName(saved.displayName) ||
    draft.course !== saved.course ||
    draft.weeklyHours !== saved.weeklyHours ||
    draft.interests.length !== saved.interests.length ||
    draft.interests.some((item, index) => item !== saved.interests[index])
  );
}
