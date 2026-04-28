import { GameState, ChestEntity } from '../state/types';

const CHEST_LIFETIME = 30; // seconds before despawn
const CHEST_COLLECT_RADIUS = 30;

function findFreeChestSlot(chests: ChestEntity[]): ChestEntity | null {
  for (let i = 0; i < chests.length; i++) {
    if (!chests[i].active) return chests[i];
  }
  return null;
}

export function spawnChest(gs: GameState, x: number, y: number, fromBoss: boolean): void {
  const slot = findFreeChestSlot(gs.chests);
  if (!slot) return;
  slot.active = true;
  slot.position.x = x;
  slot.position.y = y;
  slot.velocity.x = 0;
  slot.velocity.y = 0;
  slot.fromBoss = fromBoss;
  slot.lifetime = CHEST_LIFETIME;
  gs.idCounter++;
  slot.id = gs.idCounter;
}

export function tickChests(gs: GameState, dt: number): void {
  for (let i = 0; i < gs.chests.length; i++) {
    const chest = gs.chests[i];
    if (!chest.active) continue;
    chest.lifetime -= dt;
    if (chest.lifetime <= 0) chest.active = false;
  }

  // Check player–chest collision
  if (gs.pendingChestOpen) return; // already waiting for modal
  const p = gs.player;
  const collectRadiusSq = (p.radius + CHEST_COLLECT_RADIUS) * (p.radius + CHEST_COLLECT_RADIUS);
  for (let i = 0; i < gs.chests.length; i++) {
    const chest = gs.chests[i];
    if (!chest.active) continue;
    const dx = p.position.x - chest.position.x;
    const dy = p.position.y - chest.position.y;
    if (dx * dx + dy * dy < collectRadiusSq) {
      chest.active = false;
      gs.pendingChestOpen = true;
      break;
    }
  }
}
