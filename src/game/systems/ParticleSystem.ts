import { GameState } from '../state/types';
import { GameConfig } from '../config/GameConfig';

export function spawnDeathParticles(
  gs: GameState,
  x: number,
  y: number,
  color: string
): void {
  const count = 8 + Math.floor(Math.random() * 5); // 8-12 particles

  for (let i = 0; i < count; i++) {
    // Find free pool slot
    let slot = null;
    for (let pi = 0; pi < gs.particles.length; pi++) {
      if (!gs.particles[pi].active) {
        slot = gs.particles[pi];
        break;
      }
    }
    if (!slot) return;

    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
    const speed = 80 + Math.random() * 120; // 80-200 px/s
    const lifetime = 0.4 + Math.random() * 0.4; // 0.4-0.8s

    slot.active = true;
    slot.position.x = x + (Math.random() - 0.5) * 8;
    slot.position.y = y + (Math.random() - 0.5) * 8;
    slot.velocity.x = Math.cos(angle) * speed;
    slot.velocity.y = Math.sin(angle) * speed;
    slot.radius = 2 + Math.random() * 3; // 2-5px
    slot.lifetime = lifetime;
    slot.maxLifetime = lifetime;
    slot.color = color;
    gs.idCounter++;
    slot.id = gs.idCounter;
  }
}

export function tickParticles(gs: GameState, dt: number): void {
  for (let i = 0; i < gs.particles.length; i++) {
    const p = gs.particles[i];
    if (!p.active) continue;

    p.position.x += p.velocity.x * dt;
    p.position.y += p.velocity.y * dt;

    // Slow down over time (drag)
    p.velocity.x *= 1 - 3 * dt;
    p.velocity.y *= 1 - 3 * dt;

    p.lifetime -= dt;
    if (p.lifetime <= 0) {
      p.active = false;
    }
  }
}
