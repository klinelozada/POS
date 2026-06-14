import type { BuildDiagram, BuildDiagramStyle, BuildLayer } from '../types';
import BuildDiagram_ from './BuildDiagram';

interface Props {
  value: BuildDiagram | null;
  onChange: (next: BuildDiagram | null) => void;
}

const DEFAULT_LAYER: BuildLayer = { label: 'layer', color: '#e9dfca', size: 50 };

const btn: React.CSSProperties = {
  border: '1px solid var(--color-border)', background: 'var(--color-surface-secondary)',
  borderRadius: 6, cursor: 'pointer', fontSize: 13, padding: '4px 8px',
};

export default function BuildDiagramEditor({ value, onChange }: Props) {
  if (!value) {
    return (
      <button type="button" style={btn} onClick={() => onChange({ style: 'cup', layers: [{ ...DEFAULT_LAYER }], hot: false, notes: [] })}>
        + Add build diagram
      </button>
    );
  }

  const update = (patch: Partial<BuildDiagram>) => onChange({ ...value, ...patch });
  const setLayer = (i: number, patch: Partial<BuildLayer>) => {
    const layers = value.layers.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    update({ layers });
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.layers.length) return;
    const layers = [...value.layers];
    [layers[i], layers[j]] = [layers[j], layers[i]];
    update({ layers });
  };

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 320px', minWidth: 280 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
          <select
            value={value.style}
            onChange={(e) => update({ style: e.target.value as BuildDiagramStyle })}
            style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)' }}
          >
            <option value="cup">Cup (coffee / milk tea)</option>
            <option value="tapered">Tapered (fizz / sunset)</option>
          </select>
          {value.style === 'cup' && (
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!value.hot} onChange={(e) => update({ hot: e.target.checked })} />
              Hot (steam)
            </label>
          )}
          <button type="button" style={{ ...btn, marginLeft: 'auto', color: 'var(--color-danger, #c0392b)' }} onClick={() => onChange(null)}>
            Remove
          </button>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-foreground-secondary)', margin: '4px 0' }}>
          Layers (top → bottom)
        </div>
        {value.layers.map((layer, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <input
              value={layer.label}
              onChange={(e) => setLayer(i, { label: e.target.value })}
              placeholder="Label"
              style={{ flex: 1, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--color-border)', minWidth: 0 }}
            />
            <input type="color" value={layer.color} onChange={(e) => setLayer(i, { color: e.target.value })} style={{ width: 34, height: 30, padding: 0, border: 'none', background: 'none' }} title="Color" />
            <input
              type="number" min={1} value={layer.size ?? 1}
              onChange={(e) => setLayer(i, { size: parseFloat(e.target.value) || 1 })}
              title="Relative height"
              style={{ width: 52, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--color-border)' }}
            />
            <label title="Pearl dots" style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" checked={!!layer.dots} onChange={(e) => setLayer(i, { dots: e.target.checked })} />
            </label>
            <button type="button" style={btn} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
            <button type="button" style={btn} onClick={() => move(i, 1)} disabled={i === value.layers.length - 1}>↓</button>
            <button type="button" style={btn} onClick={() => update({ layers: value.layers.filter((_, idx) => idx !== i) })}>✕</button>
          </div>
        ))}
        <button type="button" style={btn} onClick={() => update({ layers: [...value.layers, { ...DEFAULT_LAYER }] })}>+ Add layer</button>

        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-foreground-secondary)', margin: '14px 0 4px' }}>
          Notes (optional)
        </div>
        {(value.notes ?? []).map((note, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input
              value={note}
              onChange={(e) => update({ notes: (value.notes ?? []).map((n, idx) => (idx === i ? e.target.value : n)) })}
              placeholder="e.g. Do not fully stir"
              style={{ flex: 1, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--color-border)' }}
            />
            <button type="button" style={btn} onClick={() => update({ notes: (value.notes ?? []).filter((_, idx) => idx !== i) })}>✕</button>
          </div>
        ))}
        <button type="button" style={btn} onClick={() => update({ notes: [...(value.notes ?? []), ''] })}>+ Add note</button>
      </div>

      <div style={{ flex: '0 0 220px', background: 'var(--color-warm-cream)', borderRadius: 8, padding: 12, alignSelf: 'flex-start' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-foreground-secondary)', marginBottom: 8 }}>Preview</div>
        <BuildDiagram_ diagram={value} />
      </div>
    </div>
  );
}
