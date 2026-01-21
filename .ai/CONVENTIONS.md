# Соглашения по коду

## Язык

- **Код**: английский
- **Комментарии в коде**: английский
- **Документация в .ai/**: русский
- **Термины D&D**: официальные названия из SRD 5.2.1

## Именование

### Файлы и папки
- **Компоненты**: PascalCase (`CharacterSheet.tsx`)
- **Хуки**: camelCase с префиксом use (`useCharacters.ts`)
- **Сервисы**: camelCase с суффиксом .service (`characters.service.ts`)
- **Стили**: имя компонента + `.scss` (`CharacterSheet.scss`)
- **Типы**: в `shared/src/types.ts` или локально в компоненте

### Переменные и функции
- **Переменные**: camelCase
- **Константы**: UPPER_SNAKE_CASE для глобальных, camelCase для локальных
- **Компоненты**: PascalCase
- **Типы/Интерфейсы**: PascalCase

## Структура компонента

```tsx
// 1. Imports
import { useState } from 'react';
import { SomeType } from '@shared/types';
import './Component.scss';

// 2. Types (если локальные)
interface ComponentProps {
  // ...
}

// 3. Component
export const Component: React.FC<ComponentProps> = ({ prop }) => {
  // hooks first
  const [state, setState] = useState();

  // handlers
  const handleClick = () => {};

  // render
  return <div></div>;
};
```

## Стили (SCSS)

- БЭМ-подобное именование: `.block__element--modifier`
- Переменные для цветов и размеров в `styles/`
- Mobile-first подход
- Breakpoints определены в `styles/_breakpoints.scss`

## Firebase

### Сервисы
- Каждая сущность имеет свой сервис в `services/`
- Realtime подписки возвращают unsubscribe функцию
- Все операции с БД только через сервисы, не напрямую в компонентах

### Правила безопасности
- Обновляются в `firestore.rules`
- Деплой: `npm run setup:rules`

## Git

### Коммиты
- Краткое описание на английском
- Формат: `<тип>: <описание>`
- Типы: feat, fix, refactor, style, docs, chore

### Ветки
- `master` — основная ветка
- Feature branches по необходимости

## TypeScript

- Strict mode включён
- Не игнорировать ошибки типов
- Использовать типы из `shared/` для общих сущностей
- Избегать `any`, использовать `unknown` если тип неизвестен

## Линтер

> Пока не настроен, планируется добавить ESLint + Prettier в будущем

## Тестирование

> Пока нет тестов, но архитектура позволяет их добавить
