# Audio Assets

Bu klasöre ses dosyalarını ekle, sonra `AudioService.ts` içindeki `AUDIO_READY = true` yap.

## Gerekli Dosyalar

| Dosya | Açıklama | Önerilen Süre |
|-------|----------|---------------|
| `bgmusic.mp3` | Arka plan müziği (loop) | 1-3 dakika |
| `hit.mp3` | Oyuncu hasar aldığında | <0.5s |
| `levelup.mp3` | Level atladığında | <1s |
| `kill.mp3` | Düşman öldürüldüğünde | <0.2s |
| `gemcollect.mp3` | XP gem toplandığında | <0.2s |

## Ücretsiz Ses Kaynakları

- freesound.org (Creative Commons)
- opengameart.org (oyun sesleri)
- pixabay.com/sound-effects

## Format

- MP3, 44100 Hz, mono/stereo, 128kbps yeterli
- Dosya boyutu: hit/kill/gem için <50KB, müzik için <3MB
