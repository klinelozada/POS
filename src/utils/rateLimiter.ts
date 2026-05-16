const STORAGE_KEY = 'joes_order_attempts';
const BAN_KEY = 'joes_ban_until';
const MAX_ATTEMPTS = 3;
const BAN_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day

interface AttemptData {
  count: number;
  firstAttempt: number;
}

function getAttemptData(): AttemptData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, firstAttempt: Date.now() };
    return JSON.parse(raw);
  } catch {
    return { count: 0, firstAttempt: Date.now() };
  }
}

function setAttemptData(data: AttemptData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isBanned(): boolean {
  const banUntil = localStorage.getItem(BAN_KEY);
  if (!banUntil) return false;
  const until = parseInt(banUntil, 10);
  if (Date.now() >= until) {
    // Ban expired, clear it
    localStorage.removeItem(BAN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
  return true;
}

export function getBanExpiry(): Date | null {
  const banUntil = localStorage.getItem(BAN_KEY);
  if (!banUntil) return null;
  const until = parseInt(banUntil, 10);
  if (Date.now() >= until) {
    localStorage.removeItem(BAN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  return new Date(until);
}

export function getRemainingAttempts(): number {
  if (isBanned()) return 0;
  const data = getAttemptData();
  return Math.max(0, MAX_ATTEMPTS - data.count);
}

export function recordFailedAttempt(): { banned: boolean; remaining: number } {
  if (isBanned()) return { banned: true, remaining: 0 };

  const data = getAttemptData();
  data.count += 1;
  setAttemptData(data);

  if (data.count >= MAX_ATTEMPTS) {
    localStorage.setItem(BAN_KEY, String(Date.now() + BAN_DURATION_MS));
    return { banned: true, remaining: 0 };
  }

  return { banned: false, remaining: MAX_ATTEMPTS - data.count };
}

export function resetAttempts() {
  localStorage.removeItem(STORAGE_KEY);
}
