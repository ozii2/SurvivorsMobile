import { GameState, UpgradeOption, WeaponInstance, WeaponId } from '../state/types';
import { pickUpgradeOptions } from '../config/UpgradeConfig';
import { checkEvolution, EVOLUTION_RECIPES } from '../config/PassiveItemConfig';
import { GameConfig } from '../config/GameConfig';

export function generateUpgradeChoices(gs: GameState): UpgradeOption[] {
  return pickUpgradeOptions(gs.player, 3);
}

export function generateChestChoices(gs: GameState): UpgradeOption[] {
  const evolution = checkEvolution(gs);
  if (evolution) return [evolution];
  return generateUpgradeChoices(gs);
}

/**
 * Bekleyen seçim kuyruğundan sıradakini çıkarır: önce level-up'lar, sonra sandık.
 * Kuyruğun tek sahibi burası; sayaçlar başka yerde azaltılmaz.
 * @returns Gösterilecek seçenekler, kuyruk boşsa null.
 */
export function takeNextPendingChoices(gs: GameState): UpgradeOption[] | null {
  if (gs.pendingLevelUps > 0) {
    gs.pendingLevelUps--;
    return generateUpgradeChoices(gs);
  }
  if (gs.pendingChestOpen) {
    gs.pendingChestOpen = false;
    return generateChestChoices(gs);
  }
  return null;
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
      if (weapon) weapon.level = Math.min(weapon.level + 1, GameConfig.MAX_WEAPON_LEVEL);
      break;
    }
    case 'weapon_evolve': {
      if (!choice.weaponId) break;
      const recipe = EVOLUTION_RECIPES.find((r) => r.evolvedWeaponId === choice.weaponId);
      if (!recipe) break;
      const baseWeapon = p.weapons.find(w => w.id === recipe.baseWeaponId);
      if (baseWeapon) {
        // Ana silahın mermileri evrimden sonra hiçbir tick'e ait olmaz; havuzda donup kalmasınlar
        for (let i = 0; i < gs.projectiles.length; i++) {
          const proj = gs.projectiles[i];
          if (proj.active && proj.weaponId === recipe.baseWeaponId) proj.active = false;
        }
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
      p.statPicks.max_hp++;  // STAT_PICK_CAP filtresi için sayılır
      break;
    }
    case 'speed': {
      p.speed = Math.floor(p.speed * 1.15);
      p.statPicks.speed++;
      break;
    }
    case 'armor': {
      p.armor += 2;
      p.statPicks.armor++;
      break;
    }
    case 'magnet': {
      p.magnetRadius = Math.floor(p.magnetRadius * 1.5);
      p.statPicks.magnet++;
      break;
    }
    case 'crit': {
      p.critChance = Math.min(p.critChance + 0.15, GameConfig.CRIT_CAP);
      break;
    }
    case 'lifesteal': {
      p.lifesteal = Math.min(p.lifesteal + 0.25, GameConfig.LIFESTEAL_CAP);
      break;
    }
    case 'heal': {
      p.hp = Math.min(p.maxHp, p.hp + GameConfig.FALLBACK_HEAL);
      break;
    }
    case 'gold': {
      // Altın run sonunda finalizeRun'da kayda eklenir
      gs.bonusGoldThisRun += GameConfig.FALLBACK_GOLD;
      break;
    }
  }
}
