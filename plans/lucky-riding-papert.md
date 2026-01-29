# План: Отображение и выбор аватарок персонажа

## Обзор

Добавить аватарки персонажей в три места: список персонажей, хедер листа (desktop/wide-tablet), секцию Bio (mobile/small-tablet). Аватарка на листе кликабельна — выпадающее меню с выбором дефолтной или по URL.

---

## Новые файлы (6)

### 1. `frontend/src/components/game-systems/dnd/dnd2024/utils/avatar.ts`
Утилита для определения URL аватарки:
- `getAvatarUrl(avatar?: string, className?: string): string` — если есть avatar, вернуть его; иначе по классу (`/class-avatars/{class}.webp`); иначе `/class-avatars/default.webp`
- `DEFAULT_AVATARS` — массив из 13 объектов `{ name, url }` для модалки выбора

### 2. `frontend/src/components/game-systems/dnd/dnd2024/components/header/AvatarPicker.tsx`
Кликабельная аватарка с dropdown и модалками:
- Props: `character: Character`, `gameId: string`, `size?: number` (default 64)
- Рендерит круглое изображение (getAvatarUrl)
- По клику — `DropdownMenu` с двумя пунктами:
  - «Выбрать стандартный портрет» → `DefaultAvatarModal`
  - «Ссылка на изображение» → `ExternalUrlAvatarModal`
- Сохраняет через `updateCharacter(gameId, character.id, { avatar: url })`

### 3. `frontend/src/components/game-systems/dnd/dnd2024/components/header/AvatarPicker.scss`
- `.cs-avatar-picker` — relative контейнер
- `.cs-avatar-picker-btn` — круглая кнопка с изображением, cursor pointer, hover overlay
- Переопределение позиции `.dropdown-content` для корректного расположения

### 4. `frontend/src/components/game-systems/dnd/dnd2024/components/modals/DefaultAvatarModal.tsx`
Модалка выбора дефолтного портрета:
- Props: `currentAvatar?: string`, `onSelect: (url) => void`, `onClose: () => void`
- Паттерн `.cs-modal-*` (bottom-sheet на mobile)
- Сетка 4 колонки (3 на mobile) из 13 аватарок
- Клик выбирает и закрывает
- Текущий аватар подсвечен border

### 5. `frontend/src/components/game-systems/dnd/dnd2024/components/modals/ExternalUrlAvatarModal.tsx`
Модалка ввода URL:
- Props: `currentAvatar?: string`, `onSave: (url) => void`, `onClose: () => void`
- Паттерн `.cs-modal-*`
- Input для URL
- Превью изображения (onLoad/onError обработка)
- Предупреждение о CORS: «Изображения с внешних ресурсов могут не отображаться из-за ограничений CORS. Рекомендуем использовать сервисы вроде Imgur (i.imgur.com), которые разрешают кросс-доменный доступ.»
- Кнопки Cancel / Save

### 6. `frontend/src/components/game-systems/dnd/dnd2024/components/modals/AvatarModals.scss`
- `.cs-avatar-grid` — CSS grid 4 колонки (3 на mobile)
- `.cs-avatar-grid-item` — кликабельный элемент с hover, `.selected` — accent border
- `.cs-avatar-grid-image` — 80px круг, object-fit cover
- `.cs-avatar-grid-label` — подпись класса
- `.cs-avatar-preview` — превью 120px в модалке URL
- `.cs-avatar-warning` — стилизация предупреждения о CORS

---

## Изменения в существующих файлах (6)

### 1. `frontend/src/components/characters/CharacterCard.tsx`
**Что:** Аватарка показывается ВСЕГДА (сейчас условно).

Заменить:
```tsx
{character.avatar && (
  <div className="character-avatar">
    <img src={character.avatar} alt={character.name} />
  </div>
)}
```
На:
```tsx
<div className="character-avatar">
  <img src={getAvatarUrl(character.avatar)} alt={character.name} />
</div>
```
Добавить импорт `getAvatarUrl` из utils/avatar.

### 2. `frontend/src/components/game-systems/dnd/dnd2024/components/header/CharacterHeader.tsx`
**Что:** Добавить AvatarPicker в desktop-лейаут (`.cs-header-left`).

Обернуть текстовые элементы в `.cs-header-left-info`, добавить `<AvatarPicker>` перед ним:
```tsx
<div className="cs-header-left">
  <AvatarPicker character={character} gameId={gameId} size={64} />
  <div className="cs-header-left-info">
    <div className="cs-name-block">...</div>
    <p className="cs-subtitle">...</p>
    ...
  </div>
</div>
```

### 3. `frontend/src/components/game-systems/dnd/dnd2024/components/header/CharacterHeader.scss`
**Что:** Изменить `.cs-header-left` на row-лейаут.

```scss
.cs-header-left {
  flex-direction: row;    // было column
  align-items: center;    // было flex-start
  gap: 0.75rem;
}

.cs-header-left-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}
```

### 4. `frontend/src/components/game-systems/dnd/dnd2024/components/right-panel/BiographyTab.tsx`
**Что:** Добавить AvatarPicker в начало Bio-таба (для mobile/small-tablet).

В начало JSX (перед Identity):
```tsx
<div className="cs-bio-avatar-section">
  <AvatarPicker character={character} gameId={gameId} size={96} />
</div>
```

### 5. SCSS для bio-avatar-section (в BiographyTab или RightPanel стили)
```scss
.cs-bio-avatar-section {
  display: flex;
  justify-content: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
}

@include wide-tablet-up {
  .cs-bio-avatar-section {
    display: none;  // скрыт на desktop/wide-tablet — аватар в хедере
  }
}
```

### 6. Barrel exports
- `header/index.ts` — добавить `export { AvatarPicker }`
- `modals/index.ts` — добавить `export { DefaultAvatarModal }` и `export { ExternalUrlAvatarModal }`

---

## Порядок реализации

1. `avatar.ts` — утилита (без зависимостей)
2. `DefaultAvatarModal` + `ExternalUrlAvatarModal` + `AvatarModals.scss` — модалки
3. `AvatarPicker` + `AvatarPicker.scss` — композитный компонент
4. `CharacterCard.tsx` — показывать аватар всегда
5. `CharacterHeader.tsx` + `.scss` — аватар в desktop хедере
6. `BiographyTab.tsx` + стили — аватар в bio на mobile
7. Barrel exports

---

## Верификация

1. Открыть список персонажей — у всех видны аватарки (дефолтная если нет кастомной)
2. Открыть лист персонажа на desktop (>= 850px) — аватарка слева от имени в хедере
3. Открыть лист на mobile (< 850px) — аватарка в Bio-табе, НЕ в хедере
4. Кликнуть аватарку → выпадающее меню с 2 пунктами
5. Выбрать «Стандартный портрет» → модалка с сеткой 13 аватарок → клик сохраняет
6. Выбрать «Ссылка» → модалка с URL-инпутом, превью, предупреждение CORS → Save сохраняет
7. Проверить что аватар обновляется в реальном времени (Firestore subscription)
