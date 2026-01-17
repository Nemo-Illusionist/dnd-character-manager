// D&D 2024 - HP Display Component (HP and Temp inputs)

interface HPDisplayProps {
  currentHP: number;
  tempHP: number;
  effectiveMaxHP: number;
  onCurrentHPChange: (value: number) => void;
  onTempHPChange: (value: number) => void;
}

export function HPDisplay({
  currentHP,
  tempHP,
  effectiveMaxHP,
  onCurrentHPChange,
  onTempHPChange,
}: HPDisplayProps) {
  return (
    <>
      <div className="cs-hp-modal-row">
        <label>HP</label>
        <input
          type="number"
          value={currentHP}
          onChange={(e) => onCurrentHPChange(parseInt(e.target.value) || 0)}
        />
        <span className="cs-hp-modal-max">/ {effectiveMaxHP}</span>
      </div>

      <div className="cs-hp-modal-row">
        <label>TEMP</label>
        <input
          type="number"
          value={tempHP}
          onChange={(e) => onTempHPChange(parseInt(e.target.value) || 0)}
        />
      </div>
    </>
  );
}
