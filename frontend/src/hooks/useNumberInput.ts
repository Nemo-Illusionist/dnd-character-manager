// useNumberInput Hook - Number input with local state (allows clearing)

import { useState, useEffect } from 'react';

export function useNumberInput(externalValue: number | undefined, onCommit: (value: number | undefined) => void) {
  const [localValue, setLocalValue] = useState(externalValue?.toString() ?? '');

  useEffect(() => {
    setLocalValue(externalValue?.toString() ?? '');
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*$/.test(val)) {
      setLocalValue(val);
    }
  };

  const handleBlur = () => {
    if (localValue === '') {
      onCommit(undefined);
    } else {
      const num = parseInt(localValue, 10);
      onCommit(isNaN(num) ? undefined : num);
    }
  };

  return { value: localValue, onChange: handleChange, onBlur: handleBlur };
}
