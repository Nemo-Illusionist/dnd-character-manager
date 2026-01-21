# Архитектура проекта

## Структура монорепо

```
mobile-character-sheet/
├── frontend/           # React PWA приложение
├── shared/             # Shared TypeScript типы
├── plans/              # Документация и планы
├── .ai/                # Контекст для AI
├── firebase.json       # Firebase конфигурация
├── firestore.rules     # Правила безопасности БД
└── firestore.indexes.json
```

## Технологии

### Frontend
- **React 18** + **TypeScript 5.3**
- **Vite 5** — сборка и dev server (port 5173)
- **React Router v6** — маршрутизация
- **SCSS** — стили (мигрировали с CSS)
- **vite-plugin-pwa** — PWA поддержка

### Backend
- **Firebase**:
  - **Firestore** — realtime NoSQL база данных
  - **Firebase Auth** — email/password аутентификация
  - **Hosting** — деплой статики
  - **Cloud Functions** — пока не используются, но могут понадобиться

### Shared
- Общие TypeScript типы между frontend и потенциальным backend
- Компилируется в ES modules + .d.ts

## Структура Frontend

```
frontend/src/
├── pages/              # Страницы (роуты)
├── components/
│   ├── shared/         # Переиспользуемые UI компоненты
│   ├── auth/           # Авторизация
│   ├── game-systems/   # Компоненты игровых систем
│   │   └── dnd/
│   │       ├── core/       # Общая D&D логика (abilities, skills)
│   │       └── dnd2024/    # D&D 2024 специфичные компоненты
│   ├── games/          # Список игр
│   ├── characters/     # Управление персонажами
│   ├── character-sheet/# Отображение листа персонажа
│   ├── game-manage/    # GM панель управления
│   └── gameItems/      # Shared items (карты, заметки)
├── services/           # Firebase API (auth, games, characters, etc.)
├── hooks/              # React hooks
├── context/            # AuthContext, GameContext
├── layouts/            # Layout компоненты
├── styles/             # SCSS утилиты и breakpoints
└── config/             # Firebase config
```

## Маршрутизация

```
/auth                           → Логин/Регистрация
/games                          → Список игр (главная)
/games/:gameId/
  ├── characters                → Список персонажей
  ├── characters/:characterId   → Лист персонажа
  ├── manage                    → GM панель
  └── items                     → Shared items (карты, заметки)
```

## База данных (Firestore)

### Коллекции

```
users/{uid}                                    → Профиль пользователя
games/{gameId}                                 → Игра (содержит playerIds)
  └── characters/{characterId}                 → Публичные данные персонажа
      └── private/sheet                        → Приватные данные листа (subcollection)
  └── knowledge/{type}/{itemId}                → Knowledge base (subcollection)
```

### Разделение данных персонажа

Данные персонажа разделены на **публичные** и **приватные** на уровне Firestore:

**Публичные** (`/games/{gameId}/characters/{id}`) — видны всем участникам игры:
- `id`, `gameId`, `ownerId`
- `name`, `avatar`, `sheetType`
- `publicDescription` — описание/внешность для других игроков
- `isHidden` — скрыт ли от других игроков (только owner/GM могут видеть скрытых)
- `createdAt`, `updatedAt`

**Приватные** (`/games/{gameId}/characters/{id}/private/sheet`) — только owner + GM:
- Все остальное: abilities, skills, HP, AC, spells, inventory, biography и т.д.

### Права доступа (Firestore Rules)
- **Публичные данные**: все участники игры читают, owner/GM пишут
- **Приватные данные**: только owner/GM читают и пишут

### TypeScript типы
- `PublicCharacter` — интерфейс для публичных данных
- `PrivateCharacterSheet` — интерфейс для приватных данных
- `Character = PublicCharacter & PrivateCharacterSheet` — полный тип персонажа
- `PUBLIC_CHARACTER_FIELDS` — константа для разделения полей в сервисе

### Модель данных персонажа (D&D 2024)

- **Abilities**: STR, DEX, CON, INT, WIS, CHA
- **Skills**: 18 навыков с proficiency
- **Saving Throws**: по способностям
- **HP/AC**: текущие/максимальные HP, AC, щиты
- **Combat**: initiative, speed, conditions
- **Inventory**: предметы с количеством и свойствами
- **Spells**: слоты по уровням, prepared/known spells
- **Currency**: cp, sp, ep, gp, pp
- **Biography**: traits, ideals, bonds, flaws, backstory

## Паттерны

### State Management
- **React Context** для глобального состояния (AuthContext, GameContext)
- **Custom Hooks** для Firebase запросов (useAuth, useGames, useCharacters)

### Service Layer
- Все Firebase операции изолированы в `services/`
- Realtime подписки через `onSnapshot()`

### Компонентная архитектура
- **Pages** — роутовые компоненты
- **Layouts** — обёртки (GameLayout, AuthenticatedLayout)
- **Shared** — переиспользуемые UI примитивы
- **Domain** — бизнес-логика (characters, games)
- **Game Systems** — расширяемая система для разных TTRPG

## Расширяемость игровых систем

Архитектура спроектирована для поддержки множества систем:

```
components/game-systems/
├── dnd/
│   ├── core/           # Общее для всех D&D
│   ├── dnd2024/        # D&D 2024 (SRD 5.2.1)
│   └── dnd2014/        # D&D 2014 (планируется)
├── daggerheart/        # Планируется
├── coc/                # Call of Cthulhu (планируется)
└── vtm/                # Vampire: The Masquerade (планируется)
```

Тип `GameSystem` в shared types определяет поддерживаемые системы.

## Окружения

- **demo-test** — локальная разработка с эмуляторами
- **staging** (dnd24-character-manager) — текущий prod/staging
- **production** — планируется отдельно в будущем

## Эмуляторы (локальная разработка)

```bash
npm run emulators
```

- Auth: port 9099
- Firestore: port 8080
- Hosting: port 5002
- Emulator UI: port 4000
