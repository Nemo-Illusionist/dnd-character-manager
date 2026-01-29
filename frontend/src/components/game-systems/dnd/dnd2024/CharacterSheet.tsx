// D&D 2024 Character Sheet - Main Component

import { CharacterHeader } from './components/header';
import { AbilitiesSection } from './components/abilities';
import { RightPanel } from './components/right-panel';
import { CombatStatsRow } from './components/shared';
import { ConditionsModal } from './components/modals';
import { useCharacterSheetLayout } from './hooks';
import type { Character } from 'shared';

interface CharacterSheetProps {
  character: Character;
  gameId: string;
}

export function CharacterSheet({ character, gameId }: CharacterSheetProps) {
  const {
    headerExpanded,
    mobileTab,
    setMobileTab,
    isMobileMode,
    isTabletMode,
    isTrueMobile,
    conditionsOpen,
    setConditionsOpen,
    moreMenuOpen,
    setMoreMenuOpen,
    moreMenuRef,
    visibleMainTabs,
    moreTabs,
    isMoreTabActive,
    handleToggleExpand,
    getRightPanelTab,
  } = useCharacterSheetLayout(character);

  return (
    <>
      <CharacterHeader
        character={character}
        gameId={gameId}
        expanded={headerExpanded}
        onToggleExpand={handleToggleExpand}
      />

      {/* Main content */}
      <div className="character-sheet-content">
        {/* Tablet stats row (650-849px only) - not on mobile, they're in header */}
        {isTabletMode && (
          <div className="cs-tablet-stats-row">
            <CombatStatsRow
              character={character}
              gameId={gameId}
              onConditionsClick={() => setConditionsOpen(true)}
            />
          </div>
        )}

        {/* Mobile/Tablet unified tab bar (< 850px) */}
        {isMobileMode && (
          <div className="cs-mobile-tab-bar">
            {/* Main tabs */}
            {visibleMainTabs.map((tab) => (
              <button
                key={tab.id}
                className={`cs-mobile-tab-btn ${mobileTab === tab.id ? 'active' : ''}`}
                onClick={() => setMobileTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}

            {/* On true mobile (< 650px): show "..." menu */}
            {isTrueMobile ? (
              <div className="cs-more-menu-wrapper" ref={moreMenuRef}>
                <button
                  className={`cs-mobile-tab-btn ${isMoreTabActive ? 'active' : ''}`}
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                >
                  •••
                </button>
                {moreMenuOpen && (
                  <div className="cs-more-menu">
                    {moreTabs.map((tab) => (
                      <button
                        key={tab.id}
                        className={`cs-more-menu-item ${mobileTab === tab.id ? 'active' : ''}`}
                        onClick={() => {
                          setMobileTab(tab.id);
                          setMoreMenuOpen(false);
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* On tablet (>= 650px): show all tabs */
              moreTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`cs-mobile-tab-btn ${mobileTab === tab.id ? 'active' : ''}`}
                  onClick={() => setMobileTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))
            )}
          </div>
        )}

        <div className="cs-main-layout">
          {/* Left panel: Abilities - show on desktop always, on mobile only when abilities tab is active */}
          <div className={`cs-main-left ${isMobileMode && mobileTab !== 'abilities' ? 'cs-hidden' : ''}`}>
            <AbilitiesSection
              character={character}
              gameId={gameId}
              hideSectionHeader={isMobileMode}
            />
          </div>

          {/* Right panel: Actions/Spells/Inventory/Bio */}
          {/* On desktop (>= 850px): always visible with internal tabs */}
          {/* On mobile/tablet (< 850px): visible when non-abilities tab selected, no internal tabs */}
          <div className={`cs-main-right ${isMobileMode ? (mobileTab === 'abilities' ? 'cs-hidden' : 'cs-mobile-right-panel') : 'cs-desktop-only'}`}>
            <RightPanel
              character={character}
              gameId={gameId}
              externalTab={isMobileMode ? getRightPanelTab() : undefined}
              hideTabHeader={isMobileMode}
            />
          </div>
        </div>
      </div>

      {/* Conditions Modal for tablet stats row */}
      {conditionsOpen && (
        <ConditionsModal
          character={character}
          gameId={gameId}
          onClose={() => setConditionsOpen(false)}
        />
      )}
    </>
  );
}
