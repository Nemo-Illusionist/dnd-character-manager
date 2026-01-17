# План рефакторинга Character Sheet

## Цель
Разделить монолитный `CharacterSheetPage.tsx` (1,437 строк) на чистые компоненты с поддержкой разных игровых систем.

## Новая структура папок

```
src/components/
├── shared/                              # (существующие - оставить как есть)
│
├── character-sheet/                     # Общий layout wrapper
│   ├── CharacterSheetLayout.tsx
│   ├── CharacterSheetLayout.css
│   └── index.ts
│
└── game-systems/
    ├── types.ts                         # GameSystem interface
    ├── index.ts                         # Registry & exports
    │
    └── dnd/                             # Семейство D&D систем
        ├── core/                        # ОБЩЕЕ для D&D 2014 и 2024
        │   ├── constants/
        │   │   ├── abilities.ts         # ABILITY_NAMES, ABILITY_ORDER (одинаковые)
        │   │   ├── skills.ts            # Базовый SKILL_ABILITIES (18 skills)
        │   │   └── index.ts
        │   ├── utils/
        │   │   ├── calculations.ts      # getAbilityModifier (формула одинаковая)
        │   │   └── index.ts
        │   ├── components/
        │   │   ├── AbilityBlock.tsx     # Базовый компонент ability
        │   │   ├── SkillRow.tsx         # Строка skill
        │   │   ├── DeathSaves.tsx       # Death saves (одинаковые)
        │   │   ├── StatBox.tsx          # AC, Speed box
        │   │   └── index.ts
        │   └── index.ts
        │
        ├── dnd2024/                     # D&D 2024 специфичное
        │   ├── constants/
        │   │   ├── experience.ts        # XP_THRESHOLDS (D&D 2024)
        │   │   ├── proficiencyBonus.ts  # getProficiencyBonus (может отличаться)
        │   │   └── index.ts
        │   ├── components/
        │   │   ├── header/
        │   │   │   ├── CharacterHeader.tsx
        │   │   │   ├── CharacterHeader.css
        │   │   │   └── index.ts
        │   │   ├── hp/
        │   │   │   ├── HPBoxDesktop.tsx
        │   │   │   ├── HPBoxMobile.tsx
        │   │   │   ├── HPModal.tsx
        │   │   │   ├── HP.css
        │   │   │   └── index.ts
        │   │   ├── abilities/
        │   │   │   ├── AbilitiesSection.tsx
        │   │   │   ├── CompactAbilityBlock.tsx
        │   │   │   ├── Abilities.css
        │   │   │   └── index.ts
        │   │   ├── proficiencies/
        │   │   │   ├── EquipmentProficiencies.tsx
        │   │   │   ├── Proficiencies.css
        │   │   │   └── index.ts
        │   │   ├── modals/
        │   │   │   ├── SettingsModal.tsx
        │   │   │   ├── LevelXPModal.tsx
        │   │   │   ├── Modals.css
        │   │   │   └── index.ts
        │   │   └── index.ts
        │   ├── CharacterSheet.tsx       # Главный компонент D&D 2024
        │   └── index.ts
        │
        └── dnd2014/                     # D&D 2014 (будущее)
            ├── constants/
            │   ├── experience.ts        # XP таблица 2014 (отличается)
            │   └── index.ts
            ├── components/
            │   └── ...                  # Может переиспользовать dnd/core
            ├── CharacterSheet.tsx
            └── index.ts
```

## Что общее (dnd/core)

| Элемент | Причина |
|---------|---------|
| 6 Abilities (STR, DEX, CON, INT, WIS, CHA) | Одинаковые в обеих версиях |
| 18 Skills | Одинаковые названия и привязка к abilities |
| `getAbilityModifier()` | Формула `floor((score - 10) / 2)` одинаковая |
| Death Saves (3 success / 3 failure) | Механика одинаковая |
| Базовые UI компоненты | AbilityBlock, SkillRow, StatBox |

## Что специфичное (dnd2024 / dnd2014)

| Элемент | D&D 2024 | D&D 2014 |
|---------|----------|----------|
| XP Thresholds | Новая таблица | Старая таблица |
| Proficiency Bonus | `ceil(level/4) + 1` | Может отличаться |
| Некоторые правила | Новые правила | Старые правила |
| Layout/дизайн | Текущий дизайн | Может быть другой |

## Порядок реализации

### Фаза 1: Создание структуры (не ломает код)
1. Создать папки `game-systems/dnd/core`, `game-systems/dnd/dnd2024`
2. Создать `types.ts` с интерфейсами

### Фаза 2: Вынести константы
1. `dnd/core/constants/abilities.ts` - ABILITY_NAMES, ABILITY_ORDER
2. `dnd/core/constants/skills.ts` - SKILL_ABILITIES, getSkillsByAbility()
3. `dnd2024/constants/experience.ts` - XP_THRESHOLDS
4. `dnd2024/constants/proficiencyBonus.ts` - getProficiencyBonus()

### Фаза 3: Вынести утилиты
1. `dnd/core/utils/calculations.ts` - getAbilityModifier()

### Фаза 4: Вынести модальные окна
1. `dnd2024/components/modals/SettingsModal.tsx`
2. `dnd2024/components/modals/LevelXPModal.tsx`

### Фаза 5: Вынести HP компоненты
1. `dnd/core/components/DeathSaves.tsx`
2. `dnd2024/components/hp/HPBoxDesktop.tsx`
3. `dnd2024/components/hp/HPBoxMobile.tsx`
4. `dnd2024/components/hp/HPModal.tsx`

### Фаза 6: Вынести Header
1. `dnd2024/components/header/CharacterHeader.tsx`

### Фаза 7: Вынести Abilities
1. `dnd/core/components/AbilityBlock.tsx` - базовый
2. `dnd/core/components/SkillRow.tsx`
3. `dnd2024/components/abilities/AbilitiesSection.tsx`
4. `dnd2024/components/abilities/CompactAbilityBlock.tsx`

### Фаза 8: Вынести Proficiencies
1. `dnd2024/components/proficiencies/EquipmentProficiencies.tsx`

### Фаза 9: Собрать всё вместе
1. `dnd2024/CharacterSheet.tsx` - главный компонент
2. `game-systems/index.ts` - registry
3. Упростить `CharacterSheetPage.tsx` до тонкой обёртки

### Фаза 10: CSS
1. Разделить `CharacterSheetPage.css` по компонентам
2. Удалить дубликаты

## Критические файлы

- `frontend/src/pages/CharacterSheetPage.tsx` - разбить (1,437 строк)
- `frontend/src/pages/CharacterSheetPage.css` - разделить (1,521 строк)
- `frontend/src/services/characters.service.ts` - оставить как есть
- `shared/src/types.ts` - оставить как есть

## Прогресс

| Фаза | Статус |
|------|--------|
| Фаза 1: Создание структуры | ✅ Завершена |
| Фаза 2: Вынести константы | ✅ Завершена |
| Фаза 3: Вынести утилиты | ✅ Завершена |
| Фаза 4: Вынести модальные окна | ✅ Завершена |
| Фаза 5: Вынести HP компоненты | ✅ Завершена |
| Фаза 6: Вынести Header | ✅ Завершена |
| Фаза 7: Вынести Abilities | ✅ Завершена |
| Фаза 8: Вынести Proficiencies | ✅ Завершена |
| Фаза 9: Собрать всё вместе | ✅ Завершена |
| Фаза 10: CSS | ✅ Завершена |

**Результат Фазы 9:**
- `CharacterSheetPage.tsx` сокращён с 1,437 до 46 строк
- Создан `dnd2024/CharacterSheet.tsx` - главный компонент системы
- Создан `game-systems/index.ts` - registry экспортов
- TypeScript компилируется без ошибок
- Build проходит успешно

**Результат Фазы 10:**
- `CharacterSheetPage.css` сокращён с 1,521 до 79 строк (95% сокращение)
- Создано 5 специализированных CSS файлов:
  - `CharacterHeader.css` (294 строки)
  - `HP.css` (516 строк)
  - `Abilities.css` (369 строк)
  - `Modals.css` (174 строки)
  - `Proficiencies.css` (105 строк)
- Все импорты CSS обновлены в компонентах
- TypeScript и build работают без ошибок

**Дополнительно реализовано:**
- `dnd/core/components/` - базовые переиспользуемые компоненты:
  - `SkillRow.tsx` - строка навыка
  - `DeathSaves.tsx` - death saves UI (desktop/mobile/modal варианты)
  - `StatBox.tsx` - бокс для AC, Speed и других статов
- `character-sheet/` - общий layout wrapper:
  - `CharacterSheetLayout.tsx` - обёртка с loading/error states
  - `CharacterSheetLayout.css` - базовые стили layout
- `CharacterSheetPage.tsx` сокращён до **21 строки**

## Итоговая статистика

| Файл | Было | Стало |
|------|------|-------|
| CharacterSheetPage.tsx | 1,437 строк | 21 строка |
| CharacterSheetPage.css | 1,521 строка | удалён |
| Всего файлов | 2 | 41 |

## Проверка после каждой фазы

- [x] TypeScript компилируется без ошибок
- [x] Build проходит успешно
- [ ] Все функции работают (abilities, skills, HP, modals)
- [ ] Responsive работает (mobile < 650px, tablet 650-799px, desktop >= 800px)
- [ ] Firebase сохраняет изменения
