import { GameState } from '../state/types';
import { GameConfig } from '../config/GameConfig';

export function spawnGem(
  gs: GameState,
  x: number,
  y: number,
  value: number
): void {
  for (let i = 0; i < gs.xpGems.length; i++) {
    const gem = gs.xpGems[i];
    if (!gem.active) {
      gem.active = true;
      gem.position.x = x;
      gem.position.y = y;
      gem.velocity.x = 0;
      gem.velocity.y = 0;
      gem.value = value;
      gem.isMagnetized = false;
      gs.idCounter++;
      gem.id = gs.idCounter;
      return;
    }
  }
}

export function tickXPGems(gs: GameState, dt: number): void {
  const px = gs.player.position.x;
  const py = gs.player.position.y;
  const magnetSpeed = GameConfig.GEM_MAGNET_SPEED;

  for (let i = 0; i < gs.xpGems.length; i++) {
    const gem = gs.xpGems[i];
    if (!gem.active) continue;
    if (!gem.isMagnetized) continue;

    const dx = px - gem.position.x;
    const dy = py - gem.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) continue;

    gem.position.x += (dx / dist) * magnetSpeed * dt;
    gem.position.y += (dy / dist) * magnetSpeed * dt;
  }
}
