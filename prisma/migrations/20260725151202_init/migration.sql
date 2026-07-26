-- Апгрейд с Drizzle: если база уже была создана старой миграцией
-- drizzle/0000_same_chronomancer.sql (snake_case, timestamp без таймзоны),
-- приводим существующие таблицы к текущей схеме вместо создания заново —
-- данные (пользователи, сессии) при этом сохраняются.
-- Наивные timestamp трактуем как UTC: точнее для записей с Vercel; локальные
-- dev-записи могут сместиться на смещение локальной таймзоны — цена известного
-- бага старой схемы, ради которого и введён timestamptz.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'user' AND column_name = 'email_verified'
  ) THEN
    -- user
    ALTER TABLE "user" RENAME COLUMN "email_verified" TO "emailVerified";
    ALTER TABLE "user" RENAME COLUMN "created_at" TO "createdAt";
    ALTER TABLE "user" RENAME COLUMN "updated_at" TO "updatedAt";
    ALTER TABLE "user"
      ALTER COLUMN "emailVerified" SET DEFAULT false,
      ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
      ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
      ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';
    ALTER TABLE "user" RENAME CONSTRAINT "user_email_unique" TO "user_email_key";

    -- session
    ALTER TABLE "session" RENAME COLUMN "expires_at" TO "expiresAt";
    ALTER TABLE "session" RENAME COLUMN "created_at" TO "createdAt";
    ALTER TABLE "session" RENAME COLUMN "updated_at" TO "updatedAt";
    ALTER TABLE "session" RENAME COLUMN "ip_address" TO "ipAddress";
    ALTER TABLE "session" RENAME COLUMN "user_agent" TO "userAgent";
    ALTER TABLE "session" RENAME COLUMN "user_id" TO "userId";
    ALTER TABLE "session"
      ALTER COLUMN "expiresAt" TYPE TIMESTAMPTZ(3) USING "expiresAt" AT TIME ZONE 'UTC',
      ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
      ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
      ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';
    ALTER TABLE "session" RENAME CONSTRAINT "session_token_unique" TO "session_token_key";
    -- FK пересоздаётся ниже с именем и правилами из схемы Prisma
    ALTER TABLE "session" DROP CONSTRAINT "session_user_id_user_id_fk";

    -- account
    ALTER TABLE "account" RENAME COLUMN "account_id" TO "accountId";
    ALTER TABLE "account" RENAME COLUMN "provider_id" TO "providerId";
    ALTER TABLE "account" RENAME COLUMN "user_id" TO "userId";
    ALTER TABLE "account" RENAME COLUMN "access_token" TO "accessToken";
    ALTER TABLE "account" RENAME COLUMN "refresh_token" TO "refreshToken";
    ALTER TABLE "account" RENAME COLUMN "id_token" TO "idToken";
    ALTER TABLE "account" RENAME COLUMN "access_token_expires_at" TO "accessTokenExpiresAt";
    ALTER TABLE "account" RENAME COLUMN "refresh_token_expires_at" TO "refreshTokenExpiresAt";
    ALTER TABLE "account" RENAME COLUMN "created_at" TO "createdAt";
    ALTER TABLE "account" RENAME COLUMN "updated_at" TO "updatedAt";
    ALTER TABLE "account"
      ALTER COLUMN "accessTokenExpiresAt" TYPE TIMESTAMPTZ(3) USING "accessTokenExpiresAt" AT TIME ZONE 'UTC',
      ALTER COLUMN "refreshTokenExpiresAt" TYPE TIMESTAMPTZ(3) USING "refreshTokenExpiresAt" AT TIME ZONE 'UTC',
      ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
      ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
      ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';
    ALTER TABLE "account" DROP CONSTRAINT "account_user_id_user_id_fk";

    -- verification
    ALTER TABLE "verification" RENAME COLUMN "expires_at" TO "expiresAt";
    ALTER TABLE "verification" RENAME COLUMN "created_at" TO "createdAt";
    ALTER TABLE "verification" RENAME COLUMN "updated_at" TO "updatedAt";
    ALTER TABLE "verification"
      ALTER COLUMN "expiresAt" TYPE TIMESTAMPTZ(3) USING "expiresAt" AT TIME ZONE 'UTC',
      ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
      ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
      ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

    -- Служебная таблица drizzle-kit больше не нужна
    DROP SCHEMA IF EXISTS "drizzle" CASCADE;
  END IF;
END $$;

-- CreateTable (IF NOT EXISTS: на базе после апгрейда с Drizzle таблицы уже есть)
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ(3),
    "refreshTokenExpiresAt" TIMESTAMPTZ(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (уникальные "индексы" после апгрейда — переименованные
-- constraint'ы Drizzle; для Prisma это эквивалентно)
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "account_userId_providerId_idx" ON "account"("userId", "providerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey (условно: единый путь и для чистой базы, и после апгрейда)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'session_userId_fkey' AND conrelid = '"session"'::regclass
  ) THEN
    ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'account_userId_fkey' AND conrelid = '"account"'::regclass
  ) THEN
    ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;