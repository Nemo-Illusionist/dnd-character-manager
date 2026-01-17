// D&D Core - Death Saves Component
// Death saving throws UI - same mechanic in D&D 2014 and 2024

interface DeathSavesProps {
  successes: number;
  failures: number;
  onSuccessClick?: (index: number) => void;
  onFailureClick?: (index: number) => void;
  variant?: 'desktop' | 'mobile' | 'modal';
}

export function DeathSaves({
  successes,
  failures,
  onSuccessClick,
  onFailureClick,
  variant = 'desktop',
}: DeathSavesProps) {
  if (variant === 'mobile') {
    return (
      <div className="cs-death-saves-mobile">
        <div className="cs-death-saves-mobile-row">
          <div className="cs-death-saves-circles-mobile">
            {[0, 1, 2].map((i) => (
              <div
                key={`success-${i}`}
                className={`cs-death-save-circle-mobile cs-success ${i < successes ? 'filled' : ''}`}
                onClick={() => onSuccessClick?.(i)}
              />
            ))}
          </div>
        </div>
        <div className="cs-death-saves-mobile-row">
          <div className="cs-death-saves-circles-mobile">
            {[0, 1, 2].map((i) => (
              <div
                key={`failure-${i}`}
                className={`cs-death-save-circle-mobile cs-failure ${i < failures ? 'filled' : ''}`}
                onClick={() => onFailureClick?.(i)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="cs-hp-modal-death-saves">
        <div className="cs-death-saves-checkboxes">
          {[0, 1, 2].map((i) => (
            <div
              key={`success-${i}`}
              className={`cs-death-save-checkbox cs-success ${i < successes ? 'checked' : ''}`}
              onClick={() => onSuccessClick?.(i)}
            />
          ))}
          {[0, 1, 2].map((i) => (
            <div
              key={`failure-${i}`}
              className={`cs-death-save-checkbox cs-failure ${i < failures ? 'checked' : ''}`}
              onClick={() => onFailureClick?.(i)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="cs-death-saves-both-rows">
      <div className="cs-death-saves-circles-horizontal">
        {[0, 1, 2].map((i) => (
          <div
            key={`success-${i}`}
            className={`cs-death-save-circle cs-success ${i < successes ? 'filled' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSuccessClick?.(i);
            }}
          />
        ))}
      </div>
      <div className="cs-death-saves-circles-horizontal">
        {[0, 1, 2].map((i) => (
          <div
            key={`failure-${i}`}
            className={`cs-death-save-circle cs-failure ${i < failures ? 'filled' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onFailureClick?.(i);
            }}
          />
        ))}
      </div>
    </div>
  );
}
