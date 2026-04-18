import { PassiveItemId, WeaponId, EvolvedWeaponId, GameState, UpgradeOption } from '../state/types';

export interface PassiveItemDefinition {
  id: PassiveItemId;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface EvolutionRecipe {
  baseWeaponId: WeaponId;
  requiredItemId: PassiveItemId;
  evolvedWeaponId: EvolvedWeaponId;
  evolvedName: string;
  evolvedDescription: string;
}

export const PASSIVE_ITEMS: PassiveItemDefinition[] = [
  {
    id: 'blood_stone',
    label: 'Kan Taşı',
    description: '+10 Maksimum Can. Hançerin evrim malzemesi.',
    icon: '🩸',
    color: '#cc2244',
  },
  {
    id: 'spell_book',
    label: 'Büyü Kitabı',
    description: 'Tüm silah bekleme süreleri %10 azalır. Ateş Topu\'nun evrim malzemesi.',
    icon: '📖',
    color: '#8844ff',
  },
  {
    id: 'power_stone',
    label: 'Güç Taşı',
    description: 'Tüm silah hasarı %8 artar. Kırbaç\'ın evrim malzemesi.',
    icon: '💎',
    color: '#ff6622',
  },
  {
    id: 'storm_crystal',
    label: 'Fırtına Kristali',
    description: 'Şimşek +1 ek hedef kazanır. Şimşek\'in evrim malzemesi.',
    icon: '⚡',
    color: '#22ccff',
  },
  {
    id: 'garlic_essence',
    label: 'Sarımsak Özü',
    description: 'Sarımsak aura yarıçapı %20 büyür. Sarımsak\'ın evrim malzemesi.',
    icon: '🧄',
    color: '#aadd44',
  },
  {
    id: 'holy_relic',
    label: 'Kutsal Emanet',
    description: 'Haç mermileri %25 daha uzun uçar. Kutsal Haç\'ın evrim malzemesi.',
    icon: '✝️',
    color: '#ffe066',
  },
];

export const EVOLUTION_RECIPES: EvolutionRecipe[] = [
  {
    baseWeaponId: 'dagger',
    requiredItemId: 'blood_stone',
    evolvedWeaponId: 'blood_blade',
    evolvedName: 'Kan Kılıcı',
    evolvedDescription: '4 yöne Kan Kılıcı fırlatır. Her vuruş %50 şansla 1 HP çalar.',
  },
  {
    baseWeaponId: 'fireball',
    requiredItemId: 'spell_book',
    evolvedWeaponId: 'hellfire',
    evolvedName: 'Cehennem Alevi',
    evolvedDescription: 'Ateş topları lifetime bitince 40px AoE patlama yapar.',
  },
  {
    baseWeaponId: 'whip',
    requiredItemId: 'power_stone',
    evolvedWeaponId: 'soul_whip',
    evolvedName: 'Ruh Kırbacı',
    evolvedDescription: '270° geniş sweep, düşmanları geri iter.',
  },
  {
    baseWeaponId: 'lightning',
    requiredItemId: 'storm_crystal',
    evolvedWeaponId: 'thunder_storm',
    evolvedName: 'Kıyamet Şimşeği',
    evolvedDescription: 'Max 8 düşmana aynı anda şimşek çarpar.',
  },
  {
    baseWeaponId: 'garlic',
    requiredItemId: 'garlic_essence',
    evolvedWeaponId: 'death_aura',
    evolvedName: 'Ölüm Bulutsu',
    evolvedDescription: 'Sarımsak alanı 2× büyür. Her tick %0.8 can çalar.',
  },
  {
    baseWeaponId: 'cross',
    requiredItemId: 'holy_relic',
    evolvedWeaponId: 'divine_blade',
    evolvedName: 'İlahi Kılıç',
    evolvedDescription: 'Karakterin etrafında dönen 3 piercing kılıç.',
  },
];

export function getPassiveItem(id: PassiveItemId): PassiveItemDefinition {
  return PASSIVE_ITEMS.find(p => p.id === id) ?? PASSIVE_ITEMS[0];
}

export function checkEvolution(gs: GameState): UpgradeOption | null {
  const p = gs.player;
  for (const weapon of p.weapons) {
    if (weapon.level < 8) continue;
    const recipe = EVOLUTION_RECIPES.find(r => r.baseWeaponId === weapon.id);
    if (!recipe) continue;
    if (!p.ownedPassiveItems.includes(recipe.requiredItemId)) continue;
    return {
      id: `evolve_${recipe.baseWeaponId}`,
      type: 'weapon_evolve',
      label: recipe.evolvedName,
      description: recipe.evolvedDescription,
      weaponId: recipe.evolvedWeaponId,
    };
  }
  return null;
}
