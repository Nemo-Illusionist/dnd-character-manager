// D&D 2024 - HP Display Component (HP and Temp inputs)

import { NumberInput } from '../../../../../../components/shared';

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
        <NumberInput
          value={currentHP}
          onChange={onCurrentHPChange}
          min={0}
          max={effectiveMaxHP}
          defaultValue={0}
        />
        <span className="cs-hp-modal-max">/ {effectiveMaxHP}</span>
      </div>

      <div className="cs-hp-modal-row">
        <label>TEMP</label>
        <NumberInput
          value={tempHP}
          onChange={onTempHPChange}
          min={0}
          defaultValue={0}
        />
      </div>
    </>
  );
}
