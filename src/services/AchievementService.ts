import { GameState } from '../game/state/types';
import { SaveData } from './SaveService';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
}

export const ALL_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_blood',   name: 'İlk Kan',        description: 'İlk düşmanı öldür' },
  { id: 'wave3',         name: 'Dalgayı Geç',     description: 'Wave 3\'e ulaş' },
  { id: 'wave6',         name: 'Savaşçı',         description: 'Wave 6\'ya ulaş' },
  { id: 'wave9',         name: 'Efsane',          description: 'Wave 9\'a ulaş' },
  { id: 'level10',       name: 'Üstat',           description: 'Level 10\'a ulaş' },
  { id: 'combo10',       name: 'Zincirleme',      description: 'x10 combo yap' },
  { id: 'combo25',       name: 'Katliamcı',       description: 'x25 combo yap' },
  { id: 'full_arsenal',  name: 'Tam Cephane',     description: '4 farklı silah edin' },
  { id: 'survivor',      name: 'Hayatta Kalan',   description: '5 dakika hayatta kal' },
  { id: 'boss_kill',     name: 'Patron Avcısı',   description: 'Patron\'u öldür' },
  { id: 'crit_master',   name: 'Keskin Göz',      description: 'Tek runda 50 kritik vur' },
  { id: 'no_damage_w2',  name: 'Dokunulmaz',      description: 'Wave 3\'e hasarsız ulaş' },
  { id: 'play5',         name: 'Vazgeçmez',       description: '5 oyun oyna' },
  { id: 'play20',        name: 'Bağımlı',         description: '20 oyun oyna' },
  { id: 'lifesteal',     name: 'Vampir',          description: 'Lifesteal ile 100 HP topla' },
];

// Returns IDs of achievements newly unlocked in this run
export function checkAchievements(gs: GameState, save: SaveData): string[] {
  const already = new Set(save.achievements);
  const newUnlocks: string[] = [];

  function check(id: string, condition: boolean) {
    if (!already.has(id) && condition) newUnlocks.push(id);
  }

  check('first_blood',  gs.totalKillsThisRun >= 1);
  check('wave3',        gs.currentWaveIndex >= 2);
  check('wave6',        gs.currentWaveIndex >= 5);
  check('wave9',        gs.currentWaveIndex >= 9);
  check('level10',      gs.player.level >= 10);
  check('combo10',      gs.maxComboThisRun >= 10);
  check('combo25',      gs.maxComboThisRun >= 25);
  check('full_arsenal', gs.player.weapons.length >= 4);
  check('survivor',     gs.gameTime >= 300);
  check('boss_kill',    gs.bossKilledThisRun);
  check('crit_master',  gs.totalCritsThisRun >= 50);
  check('no_damage_w2', gs.reachedWave3NoDamage);
  check('play5',        save.totalGames + 1 >= 5);
  check('play20',       save.totalGames + 1 >= 20);
  check('lifesteal',    gs.lifestealHealedThisRun >= 100);

  return newUnlocks;
}
