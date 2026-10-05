import { UpgradeOption, PassiveItemId, PlayerEntity, UpgradeType, StatUpgradeType } from '../state/types';
import { EVOLUTION_RECIPES } from './PassiveItemConfig';
import { GameConfig } from './GameConfig';

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
// Tariflerden türetilir: yeni evrim eklenince tek yer güncellenir
const EVOLVED_WEAPON_IDS = new Set<string>(EVOLUTION_RECIPES.map(r => r.evolvedWeaponId));

// Havuz boşalınca pencere eksik kalmasın diye kullanılan yedekler; normal havuzun parçası değil
const FALLBACK_OPTIONS: UpgradeOption[] = [
  {
    id: 'fallback_heal',
    type: 'heal',
    label: 'Can Yenile',
    description: `+${GameConfig.FALLBACK_HEAL} can yeniler.`,
  },
  {
    id: 'fallback_gold',
    type: 'gold',
    label: 'Altın Kesesi',
    description: `+${GameConfig.FALLBACK_GOLD} altın (run sonunda eklenir).`,
  },
];

// statPicks'e tip güvenli erişim için daraltma
function isStatUpgrade(t: UpgradeType): t is StatUpgradeType {
  return t === 'max_hp' || t === 'speed' || t === 'armor' || t === 'magnet';
}

export function pickUpgradeOptions(
  p: PlayerEntity,
  count = 3
): UpgradeOption[] {
  // Evrimli silah ana silahının sahipliğini de sayar; yoksa ana silah tekrar teklif edilir
  const ownedWeaponRoots = new Set<string>();
  for (let i = 0; i < p.weapons.length; i++) {
    const id = p.weapons[i].id;
    ownedWeaponRoots.add(id);
    const recipe = EVOLUTION_RECIPES.find(r => r.evolvedWeaponId === id);
    if (recipe) ownedWeaponRoots.add(recipe.baseWeaponId);
  }
  const hasFreeSlot = p.weapons.length < GameConfig.MAX_WEAPON_SLOTS;

  const available = ALL_UPGRADES.filter(u => {
    if (u.type === 'weapon_new' && u.weaponId) {
      // Don't offer evolved weapons as new pickups or already-owned weapons; slot doluysa yeni silah yok
      return hasFreeSlot && !ownedWeaponRoots.has(u.weaponId) && !EVOLVED_WEAPON_IDS.has(u.weaponId);
    }
    if (u.type === 'weapon_upgrade' && u.weaponId) {
      // Yalnızca sahipli, evrimsiz ve tavana ulaşmamış silah; yoksa seçim boşa gider
      if (EVOLVED_WEAPON_IDS.has(u.weaponId)) return false;
      for (let i = 0; i < p.weapons.length; i++) {
        const w = p.weapons[i];
        if (w.id === u.weaponId) return w.level < GameConfig.MAX_WEAPON_LEVEL;
      }
      return false;
    }
    // Sınırsız statlar havuzu hiç boşaltmıyordu; run başına seçim tavanı
    if (isStatUpgrade(u.type)) return p.statPicks[u.type] < GameConfig.STAT_PICK_CAP;
    if (u.type === 'crit') return p.critChance < GameConfig.CRIT_CAP;
    if (u.type === 'lifesteal') return p.lifesteal < GameConfig.LIFESTEAL_CAP;
    if (u.type === 'passive_item' && u.passiveItemId) {
      // Don't offer already-owned items
      return !p.ownedPassiveItems.includes(u.passiveItemId);
    }
    return true;
  });

  // Fisher–Yates: sort(() => Math.random() - 0.5) eşit dağılım vermiyor
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = available[i];
    available[i] = available[j];
    available[j] = tmp;
  }
  const result = available.slice(0, count);

  // Havuz yetmezse boşlukları sırayla yedeklerle doldur
  for (let i = 0; i < FALLBACK_OPTIONS.length && result.length < count; i++) {
    const fb = FALLBACK_OPTIONS[i];
    // Can doluyken "Can Yenile" boşa gider; atla
    if (fb.type === 'heal' && p.hp >= p.maxHp) continue;
    result.push(fb);
  }
  return result;
}
