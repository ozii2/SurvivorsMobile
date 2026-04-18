import { GameState, DamageNumber } from '../state/types';

export function spawnDamageNumber(
  gs: GameState,
  x: number,
  y: number,
  value: number,
  isCrit: boolean,
): void {
  const pool = gs.damageNumbers;
  for (let i = 0; i < pool.length; i++) {
    const dn = pool[i];
    if (!dn.active) {
      dn.x = x;
      dn.y = y + (Math.random() - 0.5) * 12; // slight vertical jitter
      dn.value = value;
      dn.isCrit = isCrit;
      dn.maxLifetime = isCrit ? 1.1 : 0.85;
      dn.lifetime = dn.maxLifetime;
      dn.active = true;
      return;
    }
  }
}

export function tickDamageNumbers(gs: GameState, dt: number): void {
  const pool = gs.damageNumbers;
  for (let i = 0; i < pool.length; i++) {
    const dn = pool[i];
    if (!dn.active) continue;
    dn.lifetime -= dt;
    if (dn.lifetime <= 0) dn.active = false;
  }
}
