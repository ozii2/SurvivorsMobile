import { CharacterId, PlayerEntity, WeaponId } from '../state/types';

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  description: string;
  bonusLine: string;
  startingWeaponId: WeaponId;
  color: string;
  icon: string;
  applyBonus: (player: PlayerEntity) => void;
}

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'warrior',
    name: 'Savaşçı',
    description: 'Kutsal haç ve kalın zırhla donanmış dayanıklı bir savaşçı.',
    bonusLine: '+2 Zırh',
    startingWeaponId: 'cross',
    color: '#e06040',
    icon: '⚔️',
    applyBonus: (p) => {
      p.armor += 2;
    },
  },
  {
    id: 'mage',
    name: 'Büyücü',
    description: 'Ateş toplarını ustalıkla kullanan, silahlarını hızla ateşleyen büyü ustası.',
    bonusLine: 'Tüm silahlar %10 daha hızlı',
    startingWeaponId: 'fireball',
    color: '#8844ff',
    icon: '🔮',
    applyBonus: (p) => {
      p.cooldownMultiplier *= 0.90;
    },
  },
  {
    id: 'healer',
    name: 'Şifacı',
    description: 'Sarımsak aurası ve can çalma yeteneğiyle hayatta kalma ustası.',
    bonusLine: '+25 Can, Can Çalma 0.1 ile başlar',
    startingWeaponId: 'garlic',
    color: '#44cc88',
    icon: '💚',
    applyBonus: (p) => {
      p.maxHp += 25;
      p.hp += 25;
      p.lifesteal = Math.max(p.lifesteal, 0.1);
    },
  },
  {
    id: 'hunter',
    name: 'Avcı',
    description: 'Hançer atışlarında kritik vuruş şansı yüksek hızlı bir avcı.',
    bonusLine: '+%10 Kritik Şans',
    startingWeaponId: 'dagger',
    color: '#ffaa22',
    icon: '🏹',
    applyBonus: (p) => {
      p.critChance = Math.min(p.critChance + 0.10, 0.75);
    },
  },
];

export function getCharacter(id: CharacterId): CharacterDefinition {
  return CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0];
}
