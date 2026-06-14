import { useEffect, useRef, useState } from 'react';
import styles from './FilterMenu.module.css';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[]; // first option is treated as the default ("All")
  value: string;
  onChange: (value: string) => void;
}

interface FilterMenuProps {
  groups: FilterGroup[];
}

export default function FilterMenu({ groups }: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Count groups whose value differs from their default (first option)
  const activeCount = groups.filter((g) => g.value !== g.options[0]?.value).length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const clearAll = () => groups.forEach((g) => g.onChange(g.options[0].value));

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={`${styles.button} ${activeCount > 0 ? styles.buttonActive : ''}`}
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>tune</span>
        Filter
        {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          {groups.map((g) => (
            <div key={g.key} className={styles.group}>
              <div className={styles.groupLabel}>{g.label}</div>
              <div className={styles.options}>
                {g.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.pill} ${g.value === opt.value ? styles.pillActive : ''}`}
                    onClick={() => g.onChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {activeCount > 0 && (
            <button type="button" className={styles.clearBtn} onClick={clearAll}>
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
