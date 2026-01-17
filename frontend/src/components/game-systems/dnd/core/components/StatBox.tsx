// D&D Core - Stat Box Component
// Reusable stat display box for AC, Speed, etc.

interface StatBoxProps {
  label: string;
  value: string | number;
  bordered?: boolean;
  onClick?: () => void;
}

export function StatBox({ label, value, bordered = false, onClick }: StatBoxProps) {
  return (
    <div className="cs-stat-item" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      <div className={`cs-stat-value ${bordered ? 'cs-bordered' : ''}`}>
        {value}
      </div>
      <div className="cs-stat-label">{label}</div>
    </div>
  );
}
