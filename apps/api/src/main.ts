import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

// Разрешённые Origin для CORS. Строгий allowlist вместо отражения любого Origin.
function corsOrigins(): string[] {
  const list = (process.env.WEB_ORIGIN ?? "https://bilimjol.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (process.env.NODE_ENV !== "production") {
    list.push("http://localhost:3100", "http://localhost:3000");
  }
  return list;
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    // trustProxy — за прокси Railway читаем реальный IP из X-Forwarded-For
    // (нужно для корректного rate-limiting по клиенту, а не по одному IP прокси).
    new FastifyAdapter({ trustProxy: true }),
  );

  app.enableCors({ origin: corsOrigins(), credentials: false });

  // Security-заголовки на все ответы (без helmet-зависимости).
  const fastify = app.getHttpAdapter().getInstance();
  fastify.addHook("onSend", (_req, reply, _payload, done) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("Referrer-Policy", "no-referrer");
    reply.header(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
    reply.header("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    done();
  });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`izn.study API → http://localhost:${port}`);
}

void bootstrap();
