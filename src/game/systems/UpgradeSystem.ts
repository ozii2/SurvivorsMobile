import { GameState, UpgradeOption, WeaponInstance, WeaponId } from '../state/types';
import { pickUpgradeOptions } from '../config/UpgradeConfig';
import { checkEvolution, EVOLUTION_RECIPES } from '../config/PassiveItemConfig';

export function generateUpgradeChoices(gs: GameState): UpgradeOption[] {
  const ownedWeaponIds = gs.player.weapons.map(w => w.id);
  const ownedItemIds = gs.player.ownedPassiveItems;
  return pickUpgradeOptions(ownedWeaponIds, ownedItemIds, 3);
}

export function generateChestChoices(gs: GameState): UpgradeOption[] {
  const evolution = checkEvolution(gs);
  if (evolution) return [evolution];
  return generateUpgradeChoices(gs);
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
    case 'weapon_evolve': {
      if (!choice.weaponId) break;
      const recipe = EVOLUTION_RECIPES.find((r) => r.evolvedWeaponId === choice.weaponId);
      if (!recipe) break;
      const baseWeapon = p.weapons.find(w => w.id === recipe.baseWeaponId);
      if (baseWeapon) {
        baseWeapon.id = choice.weaponId;
        baseWeapon.level = 1;
        baseWeapon.cooldownTimer = 0;
        baseWeapon.angle = baseWeapon.angle ?? 0;
      }
      break;
    }
    case 'passive_item': {
      if (!choice.passiveItemId) break;
      if (p.ownedPassiveItems.includes(choice.passiveItemId)) break;
      p.ownedPassiveItems.push(choice.passiveItemId);
      // Apply stat bonus
      switch (choice.passiveItemId) {
        case 'blood_stone':
          p.maxHp += 10;
          p.hp = Math.min(p.hp + 10, p.maxHp);
          break;
        case 'spell_book':
          p.cooldownMultiplier *= 0.90;
          break;
        case 'power_stone':
          p.mightMultiplier += 0.08;
          break;
        case 'storm_crystal':
          p.bonusLightningTargets += 1;
          break;
        case 'garlic_essence':
          p.bonusGarlicRadius += 0.20;
          break;
        case 'holy_relic':
          p.bonusPierceLifetime += 0.25;
          break;
      }
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
    case 'crit': {
      p.critChance = Math.min(p.critChance + 0.15, 0.75);
      break;
    }
    case 'lifesteal': {
      p.lifesteal = Math.min(p.lifesteal + 0.25, 1.0);
      break;
    }
  }
}
