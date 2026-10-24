# Соцсети Bilimjol — модуль Content Studio

Готовый контент на каждый день: слайды в фирменном стиле (маскот-ирбис,
Comfortaa/Nunito, violet/gold), подписи RU/KY и хэштеги. Канал — **органика**
(без закупки, без маркировки erid).

**Контент-хаб (приватный артефакт):** https://claude.ai/artifact/QwGJEyVayjhTPxMx4Drc84
— заходишь, берёшь слайды и текст на сегодня, постишь.

## Что где

- `posts.js` — контент-план как данные (неделя 1, 7 постов). Один источник и для
  слайдов, и для подписей. Правишь тут — перегенерируешь.
- `scripts/social-slides.mjs` — генератор слайдов (satori → resvg, как OG-картинки).
- `scripts/build-hub.mjs` — собирает `out/hub.html` из `hub.template.html` + манифеста.
- `scripts/telegram-daily.mjs` — дневное напоминание «сегодня по плану» в Telegram.
- `fonts/` — статические TTF (Comfortaa 700, Nunito 700/800, кириллица+латиница).
- `assets/irbis.svg` — маскот (из `apps/web/src/lib/characterArt.ts`).
- `out/` — отрендеренные PNG + `manifest.json` + `hub.html`.

## Генерация слайдов

```bash
cd social
node scripts/social-slides.mjs            # все посты, RU+KY → out/*.png + manifest.json
node scripts/social-slides.mjs delenie    # один пост по id
node scripts/social-slides.mjs --lang ru  # только одна локаль
node scripts/social-slides.mjs --captions # подписи+хэштеги для вставки
```

Форматы: `square` 1080×1080 (лента/карусель), `story` 1080×1920 (сторис).
Шаблоны: `cover`, `text`, `list` (✓/✗ векторные), `cta`, `myth`, `story`.
Эмодзи в слайды НЕ запекаются (только в подписи) — satori их не рисует.

## Обновить хаб-артефакт

```bash
node scripts/social-slides.mjs            # перерисовать слайды
node scripts/build-hub.mjs                # собрать out/hub.html
```

Затем переопубликовать артефакт на тот же URL (в чате с Claude): `out/hub.html`
как страница + `out/*.png` как файлы под `img/<имя>` (capability `assets` не нужна).

## Telegram (дневная рассылка готового поста)

`telegram-daily.mjs` присылает ГОТОВЫЙ пост на сегодня: само медиа (фото /
карусель-альбом / видео) + отдельным сообщением подпись с хэштегами — бери и
постя. Пост берётся из `posts.js` по дню недели; картинки из `out/` (сгенерить
`node scripts/social-slides.mjs`), видео — поле `video` у поста (путь от `social/`).

1. @BotFather → `/newbot` → **токен**. Для рассылки в личку: напиши боту `/start`.
   (Или создай канал и добавь бота админом — тогда нужен `chat_id` канала.)
2. `chat_id`: для лички — из `getUpdates` после `/start`; для канала — @getidsbot.
3. `.telegram.json.example` → `.telegram.json`: `bot_token`, `chat_id`, `lang`
   (`ru` | `ky` | `both` — какие слайды слать; текст подписи всегда RU+KY).
   Файл в .gitignore, не коммитится.
4. Проверка: `node scripts/telegram-daily.mjs` (или `… <id>` — конкретный пост).
5. Автозапуск раз в день — launchd (macOS) или cron:
   `0 8 * * * cd …/social && node scripts/telegram-daily.mjs` (08:00).
   ⚠️ launchd/cron на локальной машине: Mac должен быть включён в это время.

## Соцсети проекта (органика)

- **Instagram** — лента (карусели/посты) + сторис, вручную из хаба. Бренд-присутствие.
- **Pinterest** — приоритет: поисковик, пины живут месяцами, карусели → вертикальные
  пины почти без правок. Лучший фит под «только органика» при сильном SEO.
- **Telegram** — ops-напоминания (выше), сетевой стандарт.
- Опции RU: **Дзен** (поиск Яндекса), Threads (кросс-пост из IG). Видео пока не берём.

## Бренд

Слайды — в потребительском бренде Bilimjol (его видят подписчики): violet `#6d5cf7`,
gold `#e6c079`, Comfortaa (заголовки) + Nunito (текст), маскот-ирбис. Хаб-страница —
в графитовом сетевом стиле (IBM Plex, акцент `#4e8a5c`/`#8fd1a0` из HUB.md), как витрина.
