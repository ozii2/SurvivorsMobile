import { GameState, Vec2 } from '../state/types';
import { GameConfig } from '../config/GameConfig';

export function tickPlayer(gs: GameState, dt: number, joystick: Vec2): void {
  const p = gs.player;
  if (!p.active) return;

  // Apply joystick movement
  const speed = p.speed * dt;
  p.position.x += joystick.x * speed;
  p.position.y += joystick.y * speed;

  // Clamp to world bounds
  p.position.x = Math.max(p.radius, Math.min(GameConfig.WORLD_WIDTH - p.radius, p.position.x));
  p.position.y = Math.max(p.radius, Math.min(GameConfig.WORLD_HEIGHT - p.radius, p.position.y));

  // Tick iframes
  if (p.invincibleTimer > 0) {
    p.invincibleTimer -= dt;
  }
}

/** Kameranın tek güncellendiği yer; GameCanvas her sabit adımda gerçek ekran merkeziyle çağırır. */
export function updateCameraCenter(
  gs: GameState,
  halfW: number,
  halfH: number
): void {
  const p = gs.player;
  const targetX = p.position.x - halfW;
  const targetY = p.position.y - halfH;
  const lag = GameConfig.CAMERA_LAG;
  gs.worldOffset.x += (targetX - gs.worldOffset.x) * (1 - lag);
  gs.worldOffset.y += (targetY - gs.worldOffset.y) * (1 - lag);
}
