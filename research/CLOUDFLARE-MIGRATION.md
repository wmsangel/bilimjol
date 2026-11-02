# Переезд bilimjol.com с Vercel на Cloudflare Workers

**Статус на 02.11.2026: ветка `cf-migration`, собрано и полностью проверено на
локальном workerd (`cf:preview`). Воркер НЕ задеплоен, домен НЕ тронут.**
bilimjol.com по-прежнему отдаёт Vercel.

Подход — `@opennextjs/cloudflare`, как у calclumen (`~/Sites/calc-tools`), costtrek
(`~/Sites/worldtime`) и izntools. Не статический экспорт: middleware (локаль-редирект),
заголовки, динамические OG и SSR-страницы входа работают один в один.

Монорепо: на Vercel жил только `apps/web` (Next.js). API (NestJS) остаётся на Railway —
он не переезжает. Фронт зовёт его по HTTP (`NEXT_PUBLIC_API_URL`), прямого доступа к БД
у web нет, поэтому Prisma/driver-adapter на воркере не нужны.

## Что было завязано на Vercel и чем заменено

| Было | Стало |
|---|---|
| `@vercel/analytics` (`<Analytics/>` в layout) | удалён — сеть на GA4 + Cloudflare Web Analytics |
| `headers()` из `next.config.ts` **на статику** (`public/`) | `public/_headers` — HSTS + security-заголовки |
| `NEXT_PUBLIC_API_URL` из панели Vercel | `.env.production.local` (под `.gitignore`), сборка локальная |
| build-time env вообще | прод-дефолты уже в коде (SITE=bilimjol.com, Paddle `live_`/`pri_`, GA/YM/GTM) |
| `*.vercel.app` как второй хост | `workers_dev: false` + `preview_urls: false` |

**Чего на web не оказалось вовсе** (проверено грепом): `vercel.json`, cron, `@vercel/og`
как отдельная зависимость, Vercel Blob/KV, `x-vercel-ip-country` и любая геолокация,
Image Optimization (`next/image` не используется нигде).

## Мнимый блокер, которого здесь нет: OG на WASM

Диспетчер предупреждал про satori/resvg на WASM в рантайме воркера (на этом застрял
iznkit). **Проверено на workerd — `next/og` (ImageResponse, yoga.wasm + resvg.wasm)
рендерит картинки в рантайме без единой ошибки.** `/ru/opengraph-image`, OG статьи и
теста отдают валидный PNG 1200×630. Поэтому динамические OG оставлены как были, статикой
их делать не понадобилось. (`satori`/`resvg` в `social/` — это офлайн-скрипты генерации
слайдов, в бандл воркера не входят вовсе.)

## Критичная ловушка (авария izntools): build-time env

`lib/api.ts` дефолтит `NEXT_PUBLIC_API_URL` на `http://localhost:4000`. Соберёшь без
переменной — в клиентский бандл попадёт localhost, и фронт отвалится от API (вход,
прогресс, оплата). На Vercel страховала панель; после переезда источник — машина сборки.

Закрыто: `apps/web/.env.production.local` (под `.gitignore`) с боевым Railway-URL. Next
подхватывает его на боевой сборке сам. **Сборка только локальная** (`cf:deploy` через
wrangler OAuth владельца); CI-токена нет — это решение владельца. С чужой машины без
этого файла сборка снова вшьёт localhost.

Проверка после каждого деплоя (значение публичное, видно снаружи):

```bash
curl -s https://bilimjol.com/ru | grep -oE '/_next/static/chunks/[^"]+\.js' | sort -u |
  while read -r js; do curl -s "https://bilimjol.com$js"; done |
  grep -oE "127\.0\.0\.1:[0-9]+|localhost:[0-9]+|up\.railway\.app" | sort -u
```
Должен быть только `…up.railway.app`. Любой localhost = собрали с локальным env.

## Что проверено на локальном workerd (`cf:preview`, localhost:8787)

- Ключевые адреса 200: `/ru`, `/ky`, `/ru/articles/*`, `/ru/tests/*`, `/ru/games`
  (бывший ISR `revalidate=86400` → статика), `/ru/play`, `/ru/matematika/1`, `/ru/class/5`,
  `/ru/login` (динамический SSR), `robots.txt`, `sitemap.xml`, `manifest.webmanifest`.
- `/` → **307** на `/ru` (middleware локали работает на воркере).
- **OG-картинки — валидный PNG 1200×630** в рантайме (`/ru/opengraph-image`, OG статьи и
  теста). WASM-рендер на workerd работает.
- **Каноникалы и sitemap — `https://bilimjol.com/...`** (SITE_URL вшит верно). Sitemap:
  266 URL — ровно как на проде. Title `/ru` и `/ky` совпадают с продом.
- **API в бандле — только `izn-studyapi-production.up.railway.app` (31×), 0 localhost.**
- **Security-заголовки на HTML** (из воркера): HSTS, CSP, X-Frame-Options: DENY,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **HSTS на статике** (`public/_headers`): есть — иначе на CF он бы молча пропал.
- **Гейт аналитики сохранён**: инлайн-скрипт `analytics-init` с `host!=='bilimjol.com'`
  и `send_page_view:false` на месте; на не-боевом хосте аналитика не стартует.

Размер бандла: **2.94 МБ gzip** (15.3 МБ raw). Free-лимит 3 МБ (впритык), Paid — 10 МБ.
Workers Paid уже оплачен на аккаунте (покрывает costtrek/calclumen/izntools), новых трат нет.

## Что нужно от владельца

### 1. Разрешить первый деплой воркера

`wrangler deploy` автомод режет как Production Deploy. Как с izntools — разреши его в
`apps/web/.claude/settings.local.json` (или подтверди запрос), тогда:

```bash
cd ~/Sites/izn.study/apps/web && nvm use 22
pnpm cf:deploy
```
Воркер зальётся с именем `bilimjol`, `workers_dev:false` → **ни один адрес на него не
смотрит**, зеркала нет. bilimjol.com остаётся на Vercel. Ветка намеренно НЕ пушится:
push поднял бы preview-сборку на Vercel, ради ухода от чьих счетов и переезжаем.

### 2. Переключение DNS (только после деплоя и проверки воркера)

Дашборд, не wrangler (привязка атомарно заменяет apex-запись Vercel; wrangler её удалить
не может — ошибка 100117):

1. Cloudflare → DNS, зона bilimjol.com → удалить записи Vercel на apex `bilimjol.com` и
   `www` (обе смотрят на `*.vercel-dns-*`). **MX, SPF, DKIM, TXT-верификации не трогать.**
2. Workers → `bilimjol` → Domains & Routes → Add → Custom Domain → `bilimjol.com`.
3. Вернуть `www`: проксированный `CNAME www → bilimjol.com` + Redirect Rule
   `https://www.*` → `https://${1}`, **301**, с сохранением пути и query.

### 3. Always Use HTTPS (настройка зоны)

Vercel редиректил http→https сам; на CF — SSL/TLS → Edge Certificates → **Always Use
HTTPS**. Включает диспетчер/владелец. В коде не чинится.

### 4. Сразу после переключения

- Проверить прод: `/ru` и `/ky` 200, каноникалы, sitemap, аналитика (на боевом хосте
  GA4+GTM+Метрика должны стартовать, consent-дефолты в dataLayer), вход/оплата.
- Прогнать izntools-проверку бандла на localhost (выше).
- Search Console не трогать: адрес тот же, свойство не меняется.

### 5. Через неделю стабильной работы

`vercel git disconnect` — чтобы push перестал собирать на Vercel. Удаление проекта —
только владелец, после недели.

## Откат

До шага 2 отката не требуется: домен на Vercel, воркер живёт отдельно и никуда не смотрит.
После — вернуть записи Vercel в CF DNS; проект на Vercel остаётся нетронутым.

## Оговорка

Middleware (`proxy.ts`, локаль-редирект) работает как Node.js middleware, адаптер держит
его **экспериментально** («not officially maintained» — предупреждение на каждой сборке).
На полной локальной проверке 307 отдаётся верно; costtrek/calclumen/izntools живут с этим
же. Запасной путь при поломке — унести редирект в маршрут воркера или в `_headers`.
