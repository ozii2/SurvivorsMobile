import { GameState, UpgradeOption, WeaponInstance, WeaponId } from '../state/types';
import { GameConfig } from '../config/GameConfig';
import { pickUpgradeOptions } from '../config/UpgradeConfig';

export function generateUpgradeChoices(gs: GameState): UpgradeOption[] {
  const ownedIds = gs.player.weapons.map(w => w.id);
  return pickUpgradeOptions(ownedIds, 3);
}

export function applyUpgrade(gs: GameState, choice: UpgradeOption): void {
  const p = gs.player;

  switch (choice.type) {
    case 'weapon_new': {
      if (!choice.weaponId) break;
      const already = p.weapons.find(w => w.id === choice.weaponId);
      if (!already) {
        const newWeapon: WeaponInstance = {
          id: choice.weaponId,
          level: 1,
          cooldownTimer: 0,
          angle: 0,
        };
        p.weapons.push(newWeapon);
      }
      break;
    }
    case 'weapon_upgrade': {
      if (!choice.weaponId) break;
      const weapon = p.weapons.find(w => w.id === choice.weaponId);
      if (weapon) weapon.level = Math.min(weapon.level + 1, 8);
      break;
    }
    case 'max_hp': {
      p.maxHp += 25;
      p.hp = Math.min(p.hp + 25, p.maxHp);
      break;
    }
    case 'speed': {
      p.speed = Math.floor(p.speed * 1.15);
      break;
    }
    case 'armor': {
      p.armor += 2;
      break;
    }
    case 'magnet': {
      p.magnetRadius = Math.floor(p.magnetRadius * 1.5);
      break;
    }
  }
}
