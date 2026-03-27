import { UpgradeOption } from '../state/types';

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
];

export function pickUpgradeOptions(
  ownedWeaponIds: string[],
  count = 3
): UpgradeOption[] {
  const available = ALL_UPGRADES.filter(u => {
    if (u.type === 'weapon_new' && u.weaponId) {
      return !ownedWeaponIds.includes(u.weaponId);
    }
    if (u.type === 'weapon_upgrade' && u.weaponId) {
      return ownedWeaponIds.includes(u.weaponId);
    }
    return true; // passives always available
  });

  // Shuffle and pick
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
