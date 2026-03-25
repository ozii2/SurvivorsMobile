# AGENTS.md — MyGame Proje Sınırları ve Kuralları

Bu dosya, projeyi geliştiren her AI ajanın veya geliştiricinin ilk okuması gereken kural belgesidir.

---

## Proje Özeti

Vampire Survivors benzeri mobil oyun.
- Platform: Expo SDK 55, Expo Go uyumlu
- Dil: TypeScript (strict mode)
- Renderer: React Native Skia
- Oynanış: top-down, 2D, geometrik şekiller, otomatik saldırı, düşman sürüsü, level-up sistemi

---

## Tech Stack (KİLİTLİ — değiştirme)

| Paket | Versiyon | Not |
|---|---|---|
| expo | ~55.0.0 | Expo Go uyumlu |
| @shopify/react-native-skia | ~2.4.x | GPU renderer |
| react-native-reanimated | ~4.2.x | Worklets dahil Expo Go SDK 55'te |
| react-native-gesture-handler | ~2.30.x | Joystick için |
| matter-js | ~0.20.x | Saf JS — sadece geometri yardımcısı |
| zustand | ~5.x | Yalnızca UI state |
| expo-haptics | ~55.x | Level-up titreşimi |
| expo-keep-awake | ~55.x | Ekran kapanmasın |

**Yasak paketler (Expo Go uyumsuz, EAS build gerektirir):**
- react-native-reanimated 3.x veya altı (SDK 55'te 4.x kullan)
- Herhangi bir özel native module (podfile veya build.gradle değişikliği gerektiren)
- expo-av yerine Web Audio API kullan (audio eklenirse)

---

## Kritik Mimari Kurallar

### 1. State Yönetimi

```
DOĞRU:  gameStateRef.current.player.hp -= damage   // useRef içinde direkt mutasyon
YANLIŞ: setPlayerHp(prev => prev - damage)           // asla React state'e oyun verisi yazma
```

- Oyun entityleri (player, enemies, projectiles, gems) → **sadece `useRef<GameState>`**
- Zustand → **sadece HUD ve modal** için (hp bar, level sayacı, level-up modal görünürlüğü)
- Zustand sync → oyun döngüsünden **en fazla 10 Hz** (GameConfig.UI_SYNC_INTERVAL = 0.1s)

### 2. Oyun Döngüsü

- Döngü `useFrameCallback` içinde çalışır (`@shopify/react-native-skia`)
- Tüm sistem `tick()` fonksiyonları bu callback'ten çağrılır
- Sistemler saf fonksiyondur: `(gs: GameState, dt: number) => void` — yerinde mutasyon
- **`async/await` yasak** — hiçbir sistem tick fonksiyonu async olamaz
- **`setState` yasak** — `useFrameCallback` içinden React state güncelleme yapma
- **`console.log` yasak** — hot path'te (debug için ekran üstü sayaç kullan)

Frame başına sistem çağrı sırası:
```
tickWaves → tickPlayer → tickEnemies → tickWeapons → tickProjectiles → tickXPGems → tickCollisions
```

### 3. Render Mimarisi

- Oyun dünyası → **Skia Canvas içinde** çizilir
- React Native View → sadece joystick, modallar, menüler için
- **Düşman başına ayrı React component oluşturma** — `RenderEnemies.tsx` tüm düşmanları tek bileşende döner

### 4. Object Pooling (Zorunlu)

Pool boyutları:
```typescript
POOL_ENEMIES:     128   // EnemyEntity[]
POOL_PROJECTILES: 256   // ProjectileEntity[]
POOL_GEMS:        200   // XPGemEntity[]
```

Kurallar:
- Spawn = `active: false` olan ilk slotu bul, `active = true` yap
- Despawn = `active = false` yap (asla `splice` veya `delete` kullanma)
- Oyun sırasında **asla `push` veya `splice`** çağırma

### 5. Çarpışma Dedektifi

- Daire-daire: `dist² < (r1+r2)²` (sqrt'dan kaçın)
- Broad phase: 64px uzamsal ızgara (`GRID_CELL_SIZE = 80`)
- **`Matter.Engine.update()` hot path'te kullanılmaz** (~3ms overhead, gerekmez)
- Matter.js yalnızca geometri yardımcısı olarak kullanılabilir (ihtiyaç olursa)

---

## Performans Hedefleri

| Senaryo | Hedef |
|---|---|
| 50 aktif düşman | 60 FPS |
| 100 aktif düşman | ≥ 50 FPS |
| 256 mermi + 200 gem | bellek leak yok |

Ölçüm: `frameInfo.timeSincePreviousFrame` — `Date.now()` kullanma.
Uyarı eşiği: >20ms frame → hangi sistem yavaş, onu profile et.

---

## Dosya İsimlendirme Kuralları

| Tür | Format | Örnek |
|---|---|---|
| Sistemler | PascalCase + System.ts | `EnemySystem.ts` |
| Entityler | PascalCase | `Enemy.ts` |
| Render bileşenleri | Render + PascalCase.tsx | `RenderEnemies.tsx` |
| Hook'lar | use + PascalCase.ts | `useGameEngine.ts` |
| Config dosyaları | PascalCase + Config.ts | `GameConfig.ts` |

---

## TypeScript Kuralları

- `tsconfig.json`'da `strict: true` — değiştirme
- Tüm entity arayüzleri → `src/game/state/types.ts`
- `any` tipi yasak (oyun sistemlerinde)
- Vektör tipi: `{ x: number; y: number }` — harici vector kütüphanesi kullanma
- ID'ler: `gs.idCounter++` ile sequential integer — UUID değil

---

## Yapılmaması Gerekenler

```typescript
// ❌ Oyun döngüsünde setState
useFrameCallback(() => { setEnemyCount(n) }) // YANLIŞ

// ❌ Sistem içinde async
async function tickEnemies(gs, dt) { ... }   // YANLIŞ

// ❌ Hot path'te console.log
console.log('enemy hit', enemyId)             // YANLIŞ

// ❌ Array mutasyonu
gs.enemies.push(newEnemy)                     // YANLIŞ - pool kullan
gs.enemies.splice(i, 1)                       // YANLIŞ - active = false yap

// ❌ Matter.js render veya runner
Matter.Render.create(...)                     // YANLIŞ
Matter.Runner.run(...)                        // YANLIŞ

// ❌ Delta time için Date.now
const dt = (Date.now() - lastTime) / 1000     // YANLIŞ - frameInfo kullan

// ❌ Reanimated 3.x kurma
npm install react-native-reanimated@3         // YANLIŞ - SDK 55'te 4.x kullan
```

---

## Geliştirme İş Akışı

1. **Gerçek cihazda test et** — simülatör performans verisi güvenilmez
2. **Her sistem eklenince FPS kontrol et** — sonraki milestone'a geç ancak 60fps onaylandıktan sonra
3. **Geliştirme FPS sayacı** — sağ üstte her zaman görünmeli (debug build)
4. **Expo Go ile test et** — EAS build gerektiren paket ekleme

---

## Kritik Dosyalar (Dokunmadan Önce Dikkat)

| Dosya | Neden Kritik |
|---|---|
| `src/game/state/types.ts` | Tüm sistemlerin bağımlı olduğu entity tipleri |
| `src/game/loop/` (GameCanvas içine entegre) | Delta time doğruluğu |
| `src/hooks/useGameEngine.ts` | Tüm sistemlerin entegrasyon noktası |
| `src/rendering/GameCanvas.tsx` | Performans burada kazanılır/kaybedilir |
| `babel.config.js` | Reanimated plugin son sırada olmalı |
