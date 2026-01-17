/**
 * Responsive Breakpoints для Character Sheet
 *
 * Эти константы определяют точки переключения интерфейса.
 * CSS media queries должны использовать эти же значения.
 */

export const BREAKPOINTS = {
  /** Mobile: < 650px */
  MOBILE: 650,
  /** Small Tablet: >= 650px */
  SMALL_TABLET: 650,
  /** Tablet: >= 750px */
  TABLET: 750,
  /** Wide Tablet: >= 850px */
  WIDE_TABLET: 850,
  /** Desktop: >= 1024px */
  DESKTOP: 1024,
} as const;

/**
 * Что видно/скрыто на каждом брейкпоинте:
 *
 * ┌─────────────┬────────────────┬───────────┬───────────────┬─────────────┐
 * │ Breakpoint  │ Abilities      │ Заголовок │ Heal/Damage   │ Right Panel │
 * │             │ Layout         │ A&S       │               │             │
 * ├─────────────┼────────────────┼───────────┼───────────────┼─────────────┤
 * │ >= 1024px   │ 2 колонки      │ скрыт     │ видны         │ 1:1         │
 * │ Desktop     │ compact        │           │               │             │
 * ├─────────────┼────────────────┼───────────┼───────────────┼─────────────┤
 * │ >= 850px    │ 1 колонка      │ скрыт     │ видны         │ 1:2         │
 * │ Wide Tablet │ compact        │           │               │             │
 * ├─────────────┼────────────────┼───────────┼───────────────┼─────────────┤
 * │ >= 750px    │ 2 колонки      │ виден     │ видны         │ нет         │
 * │ Tablet      │ compact        │           │               │             │
 * ├─────────────┼────────────────┼───────────┼───────────────┼─────────────┤
 * │ >= 650px    │ 2 колонки      │ виден     │ скрыты        │ нет         │
 * │ Small Tab   │ compact        │           │               │             │
 * ├─────────────┼────────────────┼───────────┼───────────────┼─────────────┤
 * │ < 650px     │ вертикальный   │ виден     │ (в модалке)   │ нет         │
 * │ Mobile      │ список         │           │               │             │
 * └─────────────┴────────────────┴───────────┴───────────────┴─────────────┘
 *
 * CSS классы:
 * - .cs-mobile-only       - видно только < 650px
 * - .cs-tablet-desktop-only - видно >= 650px
 * - .cs-hide-desktop      - скрыто >= 850px (для заголовка A&S)
 * - .cs-desktop-only      - видно >= 850px (для правой панели)
 */

/** Media query helpers (для использования в JS/React если нужно) */
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.MOBILE - 1}px)`,
  smallTablet: `(min-width: ${BREAKPOINTS.SMALL_TABLET}px)`,
  tablet: `(min-width: ${BREAKPOINTS.TABLET}px)`,
  wideTablet: `(min-width: ${BREAKPOINTS.WIDE_TABLET}px)`,
  desktop: `(min-width: ${BREAKPOINTS.DESKTOP}px)`,
} as const;
