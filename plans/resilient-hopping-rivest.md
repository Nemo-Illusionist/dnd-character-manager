# План рефакторинга архитектуры — ВЫПОЛНЕН ✅

## Обзор

Проект в стадии MVP (~12,400 строк, ~109 компонентов). Архитектура в целом хорошая, но накопился технический долг: дублирование кода, монолитные файлы, смешение ответственности в сервисном слое. План разбит на 7 независимых фаз — каждая является отдельным коммитом и не ломает проект.

---

## Фаза 1. Консолидация дублированных констант и функций расчёта

**Приоритет: ВЫСШИЙ | Риск: низкий**

Функции `getAbilityModifier`, `getProficiencyBonus` и константа `SKILL_ABILITIES` продублированы в 3-4 местах. При изменении правил D&D придётся править все копии.

**Что делать:**

1. **`SKILL_ABILITIES`** — оставить единственный источник в `shared/src/types.ts`. Удалить копии из:
   - `frontend/src/services/characters.service.ts` (строки 29-48)
   - `frontend/src/components/character-sheet/StatsSection.tsx` (строки 10-29)
   - В `dnd/core/constants/skills.ts` — заменить на ре-экспорт из `shared`

2. **Функции расчёта** (`getAbilityModifier`, `getProficiencyBonus`) — оставить в `shared/src/types.ts`. Удалить копии из:
   - `frontend/src/services/characters.service.ts` (строки 594-603)
   - В `dnd/core/utils/calculations.ts` — заменить `getAbilityModifier` на ре-экспорт из `shared`

3. **`getSkillModifier`, `getSavingThrowModifier`** — оставить только в `dnd/core/utils/calculations.ts` (зависят от `Character`). Удалить копии из `characters.service.ts` (строки 608-631)

4. Обновить все импорты по проекту

**Не делать:** не менять сигнатуры функций, не выносить в отдельные файлы (это фаза 2)

**Проверка:** `npm run build` проходит, character sheet отображает корректные модификаторы

---

## Фаза 2. Разделение `shared/src/types.ts` (560 строк) на модули

**Приоритет: ВЫСОКИЙ | Риск: низкий (barrel export сохраняет обратную совместимость)**

Монолитный файл типов — все домены в одном месте.

**Что делать:**

Создать файлы в `shared/src/`:
- `timestamp.ts` — интерфейс `Timestamp`
- `game-systems.ts` — `GameSystem`, `DnDSheetType`, `SheetType`, связанные константы
- `enums.ts` — `AbilityName`, `SkillName`, `ConditionName`, `ActionType` и прочие union types
- `user.ts` — `User`
- `game.ts` — `Game`
- `character.ts` — `PublicCharacter`, `PrivateCharacterSheet`, `Character`, `CharacterClass`, `CharacterItem`, `CharacterSpell` и т.д.
- `knowledge.ts` — `Spell`, `Item`, `Race`, `Class`, `Subclass`, `Feature`
- `game-items.ts` — `GameItem`
- `calculations.ts` — `getAbilityModifier`, `getProficiencyBonus`, `SKILL_ABILITIES`

Обновить `types.ts` (или `index.ts`) как barrel-файл, ре-экспортирующий всё. Существующие импорты `from 'shared'` остаются рабочими.

**Не делать:** не менять типы, не удалять deprecated-поля, не создавать вложенные папки

**Проверка:** `tsc --noEmit` проходит в `shared/` и `frontend/`

---

## Фаза 3. Разделение `characters.service.ts` (650 строк)

**Приоритет: ВЫСОКИЙ | Риск: низкий**

Самый большой сервис смешивает CRUD, подписки, дефолтные данные и бизнес-логику.

**Что делать:**

После фазы 1 (расчёты удалены) разбить на:
- `characters.service.ts` — оставить CRUD: `createCharacter`, `getCharacter`, `updateCharacter`, `deleteCharacter`, `getGameCharacters`, `getUserCharacters`, `getPublicCharacters` + вспомогательные `splitCharacterData`, `isPublicField`
- `characters-subscriptions.service.ts` — вынести все `subscribeTo*` функции: `subscribeToPublicCharacters`, `subscribeToGameCharacters`, `subscribeToCharacter`
- `characters-defaults.ts` — вынести `createDefaultCharacterData` (чистая функция)

Обновить импорты в хуках (`useCharacter.ts`, `useCharacters.ts`, `usePublicCharacters.ts`).

**Не делать:** не рефакторить логику подписок (вложенные onSnapshot), не менять API функций

**Проверка:** character CRUD + realtime обновления работают

---

## Фаза 4. Очистка console.log в сервисах

**Приоритет: ВЫСОКИЙ | Риск: минимальный**

68 вызовов `console.log/warn/info/debug` по всем сервисам — отладочные логи разработки.

**Что делать:**

Удалить все `console.log`, `console.warn`, `console.info`, `console.debug` из сервисов:
- `auth.service.ts` (18 вызовов)
- `games.service.ts` (21 вызов)
- `users.service.ts` (12 вызовов)
- `characters.service.ts` (10 вызовов)
- `firebase.ts` (6 вызовов)
- `gameItems.service.ts` (1 вызов)

**Оставить:** `console.error` в обработчиках ошибок `onSnapshot` — они полезны в production. Привести к единому формату: `console.error('[ServiceName] Description:', error);`

**Не делать:** не добавлять logging-фреймворк или абстракцию — over-engineering для MVP

**Проверка:** приложение работает, консоль чистая при штатном использовании

---

## Фаза 5. Извлечение CombatStatsRow из 3 мест

**Приоритет: СРЕДНИЙ | Риск: низкий**

UI блок (Inspiration, Initiative, Exhaustion, Conditions) дублирован в 3 файлах:
- `CharacterSheet.tsx` (строки 56-95) — tablet
- `RightPanel.tsx` (строки 67-117) — desktop
- `CharacterHeader.tsx` (строки 86-121) — mobile

**Что делать:**

Создать `dnd2024/components/shared/CombatStatsRow.tsx`:
```typescript
interface CombatStatsRowProps {
  character: Character;
  gameId: string;
  onConditionsClick: () => void;
  variant?: 'compact' | 'expanded';
}
```

Компонент использует `useCharacterStats` внутри. Заменить дублированный JSX в трёх файлах на `<CombatStatsRow />`.

**Не делать:** не менять визуальное поведение, не трогать CombatStatsModal

**Проверка:** визуальная проверка на mobile, tablet, desktop — выглядит идентично

---

## Фаза 6. Упрощение change detection в SpellModal

**Приоритет: СРЕДНИЙ | Риск: низкий**

`SpellModal.tsx` содержит 18 ручных `if`-сравнений для определения изменённых полей (строки 70-88). Хрупкий паттерн, который ломается при добавлении новых полей.

**Что делать:**

Создать утилиту в `dnd2024/utils/diff.ts`:
```typescript
export function getChanges<T extends Record<string, unknown>>(
  original: T, updated: T
): Partial<T> {
  const changes: Partial<T> = {};
  for (const key of Object.keys(updated) as (keyof T)[]) {
    if (updated[key] !== original[key]) {
      changes[key] = updated[key];
    }
  }
  return changes;
}
```

Заменить 18 `if`-ов в `SpellModal.tsx` на вызов `getChanges()`. Применить аналогичный паттерн в `ActionModal.tsx` и `InventoryItemModal.tsx`, если там есть похожая логика.

**Не делать:** не использовать deep-equality библиотеки, не менять поведение модалей

**Проверка:** редактирование заклинания сохраняет только изменённые поля

---

## Фаза 7. Извлечение useNumberInput из BiographyTab

**Приоритет: НИЗКИЙ | Риск: минимальный**

`BiographyTab.tsx` содержит inline-хук `useNumberInput` (строки 30-54) — переиспользуемая логика для числовых полей.

**Что делать:**

Вынести `useNumberInput` в `frontend/src/hooks/useNumberInput.ts`. Импортировать в `BiographyTab.tsx`.

**Не делать:** не рефакторить BiographyTab дальше — 324 строки для формы биографии приемлемо

**Проверка:** поля age/weight в биографии работают как прежде

---

## Что НЕ входит в план и почему

| Исключено | Причина |
|-----------|---------|
| Разбиение ClassTab (474 строк) | Цельная фича (multiclass management). Логика уже частично вынесена в `useLevelXP`. Разбиение добавит indirection без явной выгоды |
| Разбиение useHPModal (252 строки) | Уже извлечён из компонента. Разделение на отдельные хуки создаст связность между ними (общее состояние) |
| Разбиение useLevelXP (243 строки) | Обработчики `handleLevelUp`, `handleXPChange`, `handleGainXP` разделяют ~80% логики. Разделение вызовет дублирование |
| Унификация StatBox (2 версии) | Разные назначения: shared — generic UI, dnd/core — character-sheet-specific. Унификация потребует рефакторинга CSS. Низкая отдача |
| Унификация create-модалей | Разные поля, сервисы и callbacks. Generic CreateModal — over-engineering |
| FormField.tsx (5 компонентов) | 5 маленьких (<20 строк) связанных компонентов в одном файле — стандартный React-паттерн |
| Тесты, линтер, миграции БД | Отдельные задачи |

---

## Порядок выполнения

```
Фаза 1 (консолидация дубликатов)
  ↓
Фаза 2 (разделение types.ts)     ← можно параллельно с Фазой 3
  ↓
Фаза 3 (разделение service)      ← зависит от Фазы 1
  ↓
Фазы 4, 5, 6, 7 — независимые, в любом порядке
```

## Верификация после каждой фазы

1. `tsc --noEmit` проходит в `shared/` и `frontend/`
2. `npm run build` успешен
3. Открыть character sheet — abilities/skills/HP отображаются корректно
4. Редактировать заклинание — изменения сохраняются
5. Level up — proficiency bonus и spell slots обновляются
