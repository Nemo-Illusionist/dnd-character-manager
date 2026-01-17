// D&D 2024 - Death Saves Section Component

interface DeathSavesSectionProps {
  successes: number;
  failures: number;
  onSuccessChange: (count: number) => void;
  onFailureChange: (count: number) => void;
}

export function DeathSavesSection({
  successes,
  failures,
  onSuccessChange,
  onFailureChange,
}: DeathSavesSectionProps) {
  return (
    <div className="cs-hp-modal-death-saves">
      <div className="cs-death-saves-checkboxes">
        {[0, 1, 2].map((i) => (
          <div
            key={`success-${i}`}
            className={`cs-death-save-checkbox cs-success ${i < successes ? 'checked' : ''}`}
            onClick={() => {
              const newCount = successes === i + 1 ? i : i + 1;
              onSuccessChange(newCount);
            }}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <div
            key={`failure-${i}`}
            className={`cs-death-save-checkbox cs-failure ${i < failures ? 'checked' : ''}`}
            onClick={() => {
              const newCount = failures === i + 1 ? i : i + 1;
              onFailureChange(newCount);
            }}
          />
        ))}
      </div>
    </div>
  );
}
