// OpenNext Cloudflare adapter config. Зеркалит проверенную настройку calclumen
// и costtrek. Incremental cache = Workers STATIC ASSETS: пререндеренные страницы
// уезжают ассетами (бесплатная отдача, без per-request KV), а не массово пишутся
// в KV. Сайт по сути статический — значения вшиваются на сборке, при изменениях
// передеплой, — поэтому read-only кэш (без ревалидации на лету) здесь верный.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
