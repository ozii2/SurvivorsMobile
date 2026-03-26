---
status: reverse-documented
source: src/game/systems/, src/game/config/
date: 2026-03-26
---

# Core Loop — Quick Reference

> Koddan reverse-engineer edilmiştir. Mevcut davranışı ve açıklanan tasarım niyetini yansıtır.

## Overview

Vampire Survivors benzeri top-down roguelite. Oyuncu joystick ile hareket eder,
silahlar otomatik ateşlenir. Düşmanları öldür → XP gem topla → level atla →
upgrade seç. 8 dakika hayatta kal (veya öl).

---

## XP & Leveling

**Formül**: `xpToNext = floor(5 × 1.3^(level−1))`

> **Tasarım niyeti**: Yavaş büyüme kasıtlı — geç oyun XP grindini zorlaştırmak için.

| Level | Bu Level İçin Gereken XP | Toplam XP |
|-------|--------------------------|-----------|
| 2     | 5                        | 5         |
| 3     | 7                        | 12        |
| 5     | 11                       | 35        |
| 10    | 41                       | 188       |
| 15    | 154                      | 728       |

Level atlayınca: oyun duraklar → 3 upgrade seçeneği gösterilir → seç → devam.

---

## Upgrade Havuzu

| Kategori        | Seçenekler                                       | Stack? |
|-----------------|--------------------------------------------------|--------|
| Yeni silah      | Dagger, Fireball, Whip                           | Hayır (1 kez) |
| Silah yükseltme | Mevcut silah +1 seviye (max 8)                   | Evet   |
| Pasif           | +25 HP (full heal), +15% hız, +2 armor, +50% magnet radius | Evet |

**Seçim mantığı**: Sahip olmadığın silahlar → yeni silah seçeneği olarak çıkar.
Sahip olduklarının upgrade'i → silah upgrade seçeneği olarak çıkar.
Her ikisi de rastgele karıştırılıp 3'e tamamlanır.

---

## Wave Progression

| Wave | Başlangıç | Basic/s | Fast/s | Tank/s | Boss/s |
|------|-----------|---------|--------|--------|--------|
| 1    | 0s        | 0.8     | —      | —      | —      |
| 2    | 60s       | 1.0     | 0.2    | —      | —      |
| 3    | 120s      | 1.3     | 0.4    | —      | —      |
| 4    | 180s      | 1.6     | 0.6    | 0.15   | —      |
| 5    | 240s      | 2.0     | 0.8    | 0.3    | —      |
| 6    | 360s      | 2.5     | 1.1    | 0.5    | 0.02   |
| 7    | 480s      | 3.0     | 1.5    | 0.8    | 0.05   |

Her wave'in aktif düşman limiti vardır (spawn rate'den bağımsız cap).
Spawn sistemi fractional accumulator kullanır — kesirleri bir sonraki frame'e taşır.

---

## Düşman İstatistikleri

| Tip   | Hız | HP  | Hasar | XP |
|-------|-----|-----|-------|----|
| Basic | 70  | 20  | 10    | 1  |
| Fast  | 130 | 10  | 8     | 2  |
| Tank  | 40  | 80  | 18    | 5  |
| Boss  | 30  | 400 | 30    | 20 |

---

## Hasar & Hayatta Kalma

- **Hasar formülü**: `alınan = max(1, enemy.damage − armor)`
- **İframe süresi**: 1.2s (hasar sonrası)
- **Screen shake**: 0.3s, magnitude 7
- **Düşman contact cooldown**: 0.5s (aynı düşmandan ard arda hasar engeli)

---

## Silahlar — Özet

| Silah    | Davranış             | Cooldown (Lv1→Lv8) | Hasar (Lv1→Lv8) |
|----------|----------------------|---------------------|------------------|
| Dagger   | N yönde projectile   | 0.50s → 0.15s       | 10 → 52          |
| Fireball | Orbit eden orb (persistent) | —          | 15 → 71          |
| Whip     | Sol+sağ anlık alan   | 1.00s → 0.40s       | 12 → 61          |

---

## Tuning Knobs

| Parametre        | Dosya              | Notlar                        |
|------------------|--------------------|-------------------------------|
| `XP_BASE = 5`    | GameConfig.ts      | Eğrinin başlangıç değeri      |
| `XP_SCALE = 1.3` | GameConfig.ts      | Eğri sertliği (kasıtlı yavaş) |
| Enemy stats      | GameConfig.ts      | ENEMY_TYPES objesi            |
| Wave zamanlaması | WaveConfig.ts      | Tüm wave tanımları            |
| Upgrade efektleri| UpgradeSystem.ts   | Çarpan ve sabit değerler      |

---

## Bilinen Sorunlar

| # | Sorun | Sistem | Durum |
|---|-------|--------|-------|
| 1 | Armor additive scaling — boss'a karşı dengesiz (30 hasar, max ~12 indirim) | CollisionSystem | Düzeltilecek |
| 2 | Enemy separation force normalleştirilmiyor — yüksek kalabalıkta fizik bozukluğu | EnemySystem | Düzeltilecek |
