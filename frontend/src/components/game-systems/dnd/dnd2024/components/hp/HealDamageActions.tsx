// D&D 2024 - Heal/Damage Actions Component

interface HealDamageActionsProps {
  amount: string;
  onAmountChange: (value: string) => void;
  onHeal: () => void;
  onDamage: () => void;
}

export function HealDamageActions({
  amount,
  onAmountChange,
  onHeal,
  onDamage,
}: HealDamageActionsProps) {
  return (
    <div className="cs-hp-modal-actions">
      <button className="cs-hp-btn-heal" onClick={onHeal}>
        Heal
      </button>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
      />
      <button className="cs-hp-btn-damage" onClick={onDamage}>
        Damage
      </button>
    </div>
  );
}
