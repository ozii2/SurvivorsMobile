import { UpgradeOption, PassiveItemId } from '../state/types';

export const ALL_UPGRADES: UpgradeOption[] = [
  // ─── New weapons ──────────────────────────────────────────────────────────
  {
    id: 'new_dagger',
    type: 'weapon_new',
    weaponId: 'dagger',
    label: 'Hançer',
    description: 'Her yöne otomatik hançer fırlatır.',
  },
  {
    id: 'new_fireball',
    type: 'weapon_new',
    weaponId: 'fireball',
    label: 'Ateş Topu',
    description: 'Etrafında dönen ateş topları.',
  },
  {
    id: 'new_whip',
    type: 'weapon_new',
    weaponId: 'whip',
    label: 'Kırbaç',
    description: 'Yatay yay hareketi yapar.',
  },

  // ─── Weapon upgrades ──────────────────────────────────────────────────────
  {
    id: 'upgrade_dagger',
    type: 'weapon_upgrade',
    weaponId: 'dagger',
    label: 'Hançer +',
    description: 'Hançer hızı ve hasarı artar.',
  },
  {
    id: 'upgrade_fireball',
    type: 'weapon_upgrade',
    weaponId: 'fireball',
    label: 'Ateş Topu +',
    description: 'Ateş topu sayısı ve hasarı artar.',
  },
  {
    id: 'upgrade_whip',
    type: 'weapon_upgrade',
    weaponId: 'whip',
    label: 'Kırbaç +',
    description: 'Kırbaç menzili ve hasarı artar.',
  },

  // ─── Garlic weapon ────────────────────────────────────────────────────────
  {
    id: 'new_garlic',
    type: 'weapon_new',
    weaponId: 'garlic',
    label: 'Sarımsak',
    description: 'Etrafında hasar veren bir alan oluşturur.',
  },
  {
    id: 'upgrade_garlic',
    type: 'weapon_upgrade',
    weaponId: 'garlic',
    label: 'Sarımsak +',
    description: 'Hasar alanı ve hasarı artar.',
  },

  // ─── Cross weapon ─────────────────────────────────────────────────────────
  {
    id: 'new_cross',
    type: 'weapon_new',
    weaponId: 'cross',
    label: 'Kutsal Haç',
    description: '4 yöne delerek geçen ışın atar.',
  },
  {
    id: 'upgrade_cross',
    type: 'weapon_upgrade',
    weaponId: 'cross',
    label: 'Kutsal Haç +',
    description: 'Hasar ve atış hızı artar.',
  },

  // ─── Lightning weapon ──────────────────────────────────────────────────────
  {
    id: 'new_lightning',
    type: 'weapon_new',
    weaponId: 'lightning',
    label: 'Şimşek',
    description: 'En yakın düşmana anında şimşek çarpar.',
  },
  {
    id: 'upgrade_lightning',
    type: 'weapon_upgrade',
    weaponId: 'lightning',
    label: 'Şimşek +',
    description: 'Şimşek hedef sayısı ve hasarı artar.',
  },

  // ─── Passives ──────────────────────────────────────────────────────────────
  {
    id: 'max_hp',
    type: 'max_hp',
    label: 'Can Artışı',
    description: 'Maksimum can +25, can da dolar.',
  },
  {
    id: 'speed',
    type: 'speed',
    label: 'Hız Artışı',
    description: 'Hareket hızı %15 artar.',
  },
  {
    id: 'armor',
    type: 'armor',
    label: 'Zırh',
    description: 'Gelen hasar 2 azalır.',
  },
  {
    id: 'magnet',
    type: 'magnet',
    label: 'Mıknatıs',
    description: 'XP taşı toplama menzili %50 artar.',
  },
  {
    id: 'crit',
    type: 'crit',
    label: 'Kritik Vuruş',
    description: '%15 şansla 2× hasar ver.',
  },
  {
    id: 'lifesteal',
    type: 'lifesteal',
    label: 'Can Çalma',
    description: 'Her öldürmede %25 ihtimalle 1 HP kazan (yığılabilir).',
  },

  // ─── Passive items (accessories — each can only be held once) ──────────────
  {
    id: 'item_blood_stone',
    type: 'passive_item',
    passiveItemId: 'blood_stone' as PassiveItemId,
    label: '🩸 Kan Taşı',
    description: '+10 Maksimum Can. Hançerin evrim malzemesi.',
  },
  {
    id: 'item_spell_book',
    type: 'passive_item',
    passiveItemId: 'spell_book' as PassiveItemId,
    label: '📖 Büyü Kitabı',
    description: 'Silah bekleme süreleri %10 azalır. Ateş Topu\'nun evrim malzemesi.',
  },
  {
    id: 'item_power_stone',
    type: 'passive_item',
    passiveItemId: 'power_stone' as PassiveItemId,
    label: '💎 Güç Taşı',
    description: 'Tüm hasar %8 artar. Kırbaç\'ın evrim malzemesi.',
  },
  {
    id: 'item_storm_crystal',
    type: 'passive_item',
    passiveItemId: 'storm_crystal' as PassiveItemId,
    label: '⚡ Fırtına Kristali',
    description: 'Şimşek +1 ek hedef kazanır. Şimşek\'in evrim malzemesi.',
  },
  {
    id: 'item_garlic_essence',
    type: 'passive_item',
    passiveItemId: 'garlic_essence' as PassiveItemId,
    label: '🧄 Sarımsak Özü',
    description: 'Sarımsak aura yarıçapı %20 büyür. Sarımsak\'ın evrim malzemesi.',
  },
  {
    id: 'item_holy_relic',
    type: 'passive_item',
    passiveItemId: 'holy_relic' as PassiveItemId,
    label: '✝️ Kutsal Emanet',
    description: 'Haç mermileri %25 daha uzun uçar. Kutsal Haç\'ın evrim malzemesi.',
  },
];

// Evolved weapon IDs — excluded from normal upgrade pool
const EVOLVED_WEAPON_IDS = new Set([
  'blood_blade', 'hellfire', 'soul_whip', 'thunder_storm', 'death_aura', 'divine_blade',
]);

export function pickUpgradeOptions(
  ownedWeaponIds: string[],
  ownedItemIds: PassiveItemId[],
  count = 3
): UpgradeOption[] {
  const available = ALL_UPGRADES.filter(u => {
    if (u.type === 'weapon_new' && u.weaponId) {
      // Don't offer evolved weapons as new pickups or already-owned weapons
      return !ownedWeaponIds.includes(u.weaponId) && !EVOLVED_WEAPON_IDS.has(u.weaponId);
    }
    if (u.type === 'weapon_upgrade' && u.weaponId) {
      // Only offer upgrade for owned non-evolved weapons
      return ownedWeaponIds.includes(u.weaponId) && !EVOLVED_WEAPON_IDS.has(u.weaponId);
    }
    if (u.type === 'passive_item' && u.passiveItemId) {
      // Don't offer already-owned items
      return !ownedItemIds.includes(u.passiveItemId);
    }
    return true;
  });

  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
