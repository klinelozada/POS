import { useNavigate } from 'react-router-dom';

export function useSoloMode() {
  return sessionStorage.getItem('soloMode') === 'true';
}

export function SoloBackButton() {
  const navigate = useNavigate();
  const isSolo = useSoloMode();

  if (!isSolo) return null;

  return (
    <button
      onClick={() => {
        sessionStorage.removeItem('soloMode');
        navigate('/pos/solo/counter');
      }}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        padding: '10px 18px',
        borderRadius: 9999,
        background: '#EDE5DA',
        border: '1px solid #D9CFC3',
        color: '#8B7355',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      <span className="material-symbols-rounded" style={{ fontSize: 16 }}>swap_horiz</span>
      Switch to POS
    </button>
  );
}
