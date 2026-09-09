-- CreateEnum
CREATE TYPE "smart_status" AS ENUM ('waiting', 'warning', 'deploying', 'transfer', 'to_qrart', 'parse_address', 'editing_content', 'success', 'error', 'prepare_metadata');

-- CreateEnum
CREATE TYPE "chains" AS ENUM ('ton', 'btc', 'stx', 'kaia', 'ancient', 'core');

-- CreateEnum
CREATE TYPE "mint_order_types" AS ENUM ('random', 'sequential', 'selective', 'simple', 'batch');

-- CreateEnum
CREATE TYPE "collection_types" AS ENUM ('sbt', 'address', 'default', 'clone');

-- CreateEnum
CREATE TYPE "storage_types" AS ENUM ('https', 'ipfs', 'arweave');

-- CreateEnum
CREATE TYPE "upload_type" AS ENUM ('manual', 'archive');

-- CreateEnum
CREATE TYPE "links_names" AS ENUM ('telegram', 'website', 'x', 'instagram', 'discord');

-- CreateEnum
CREATE TYPE "image_types" AS ENUM ('cover', 'logo', 'nft');

-- CreateEnum
CREATE TYPE "folder_types" AS ENUM ('collection', 'images', 'metadata');

-- CreateEnum
CREATE TYPE "payments" AS ENUM ('aeon', 'arcpay', 'stars', 'qrmint');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('created', 'cancelled', 'error', 'confirmed', 'paid', 'failed', 'checked');

-- CreateEnum
CREATE TYPE "tx_status" AS ENUM ('waiting', 'pending', 'confirmed', 'failed');

-- CreateEnum
CREATE TYPE "tx_types" AS ENUM ('payment', 'mint', 'edit_content');

-- CreateEnum
CREATE TYPE "exchange_status" AS ENUM ('created', 'cancelled', 'error', 'confirmed', 'failed');

-- CreateEnum
CREATE TYPE "exchange" AS ENUM ('simpleswap', 'finchpay');

-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "app_users" (
    "id" SERIAL NOT NULL,
    "app_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "chain" "chains" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coins" INTEGER NOT NULL DEFAULT 100,
    "telegram_id" TEXT,
    "username" TEXT,
    "referralCode" TEXT,
    "referredById" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallel_users" (
    "id" SERIAL NOT NULL,
    "wallet_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "wallel_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" SERIAL NOT NULL,
    "invitedById" INTEGER NOT NULL,
    "invitedId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfts" (
    "id" SERIAL NOT NULL,
    "url" TEXT,
    "address" TEXT,
    "status" "smart_status" NOT NULL DEFAULT 'warning',
    "image_url" TEXT,
    "attributes" JSONB,
    "network" "chains" NOT NULL DEFAULT 'ton',
    "created_id" INTEGER NOT NULL,
    "wallet_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "index" INTEGER,
    "collection_id" INTEGER NOT NULL,
    "file_id" TEXT,
    "hash" TEXT,
    "proxy_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fee_receipt" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata_id" INTEGER,

    CONSTRAINT "nfts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL NOT NULL,
    "url" TEXT,
    "address" TEXT,
    "royalty_address" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "supply" INTEGER NOT NULL DEFAULT 0,
    "index" SERIAL NOT NULL,
    "key" TEXT,
    "mint_order_type" "mint_order_types" NOT NULL DEFAULT 'sequential',
    "mint_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "royalty_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "ended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "network" "chains" NOT NULL DEFAULT 'ton',
    "storage_type" "storage_types" NOT NULL DEFAULT 'arweave',
    "category_id" INTEGER,
    "licence_id" INTEGER,
    "merch_url" TEXT,
    "created_id" INTEGER,
    "wallet_id" INTEGER,
    "upload_type" "upload_type",
    "proxy_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fee_receipt" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "type" "collection_types" NOT NULL DEFAULT 'default',

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metadatas" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "nft_id" INTEGER,
    "local_path" TEXT,
    "supply" INTEGER NOT NULL DEFAULT 1,
    "mimetype" TEXT NOT NULL DEFAULT 'image/webp',
    "extension" TEXT NOT NULL DEFAULT 'webp',
    "original_name" TEXT NOT NULL DEFAULT 'unknown',

    CONSTRAINT "metadatas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_links" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "name" "links_names" NOT NULL,

    CONSTRAINT "collection_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT,

    CONSTRAINT "collection_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_images" (
    "id" SERIAL NOT NULL,
    "image_url" TEXT NOT NULL,
    "type" "image_types" NOT NULL,
    "collection_id" INTEGER NOT NULL,

    CONSTRAINT "collection_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "folder_types" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apps" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "website" TEXT,
    "description" TEXT,
    "public_key" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "bot_token" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "email" TEXT,
    "webhook" TEXT,
    "service_fee" DOUBLE PRECISION,
    "referral_fee_percent" DOUBLE PRECISION,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_addresses" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "app_id" INTEGER NOT NULL,
    "network" "chains" NOT NULL DEFAULT 'ton',

    CONSTRAINT "app_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_collections" (
    "id" SERIAL NOT NULL,
    "app_id" INTEGER NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_licenses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "collection_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_payments" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3),
    "payment" "payments" NOT NULL,
    "keys" JSONB NOT NULL,
    "app_id" INTEGER NOT NULL,

    CONSTRAINT "app_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "order_no" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment" "payments" NOT NULL,
    "nft" BOOLEAN NOT NULL DEFAULT false,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "network" "chains" NOT NULL DEFAULT 'ton',
    "token" TEXT NOT NULL,
    "item" JSONB NOT NULL,
    "payment_order_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "app_id" INTEGER NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'created',

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "address_from" TEXT NOT NULL,
    "address_to" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "network" "chains" NOT NULL DEFAULT 'ton',
    "amount" TEXT NOT NULL,
    "platfrom_fee" TEXT NOT NULL DEFAULT '0',
    "service_fee" TEXT,
    "refferal_fee" TEXT,
    "type" "tx_types" NOT NULL DEFAULT 'payment',
    "order_id" INTEGER NOT NULL,
    "status" "tx_status" NOT NULL DEFAULT 'pending',
    "hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_nfts" (
    "id" SERIAL NOT NULL,
    "nft_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,

    CONSTRAINT "order_nfts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dynamic_links" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nft_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dynamic_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_orders" (
    "id" SERIAL NOT NULL,
    "currency_from" TEXT NOT NULL,
    "currency_to" TEXT NOT NULL,
    "amount_to" TEXT NOT NULL,
    "amount_from" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "address_to" TEXT NOT NULL,
    "exchange" "exchange" NOT NULL,
    "status" "exchange_status" NOT NULL,

    CONSTRAINT "exchange_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_profit" (
    "id" SERIAL NOT NULL,
    "profit" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,

    CONSTRAINT "exchange_profit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_tasks" (
    "id" SERIAL NOT NULL,
    "app_id" INTEGER NOT NULL,
    "webhook_url" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "status" "task_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_users_app_id_user_id_key" ON "app_users"("app_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_chain_address_key" ON "wallets"("chain", "address");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "wallel_users_wallet_id_user_id_key" ON "wallel_users"("wallet_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_invitedId_invitedById_key" ON "referrals"("invitedId", "invitedById");

-- CreateIndex
CREATE UNIQUE INDEX "nfts_address_key" ON "nfts"("address");

-- CreateIndex
CREATE UNIQUE INDEX "nfts_index_collection_id_key" ON "nfts"("index", "collection_id");

-- CreateIndex
CREATE UNIQUE INDEX "collections_address_key" ON "collections"("address");

-- CreateIndex
CREATE UNIQUE INDEX "collections_key_key" ON "collections"("key");

-- CreateIndex
CREATE UNIQUE INDEX "folders_collection_id_type_key" ON "folders"("collection_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "apps_public_key_key" ON "apps"("public_key");

-- CreateIndex
CREATE UNIQUE INDEX "apps_private_key_key" ON "apps"("private_key");

-- CreateIndex
CREATE UNIQUE INDEX "app_collections_app_id_collection_id_key" ON "app_collections"("app_id", "collection_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_payments_keys_key" ON "app_payments"("keys");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_no_key" ON "orders"("order_no");

-- CreateIndex
CREATE UNIQUE INDEX "orders_payment_order_id_key" ON "orders"("payment_order_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_hash_key" ON "transactions"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "order_nfts_nft_id_order_id_key" ON "order_nfts"("nft_id", "order_id");

-- AddForeignKey
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallel_users" ADD CONSTRAINT "wallel_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallel_users" ADD CONSTRAINT "wallel_users_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_created_id_fkey" FOREIGN KEY ("created_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_metadata_id_fkey" FOREIGN KEY ("metadata_id") REFERENCES "metadatas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "collection_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_created_id_fkey" FOREIGN KEY ("created_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_links" ADD CONSTRAINT "collection_links_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_images" ADD CONSTRAINT "collection_images_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_addresses" ADD CONSTRAINT "app_addresses_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_collections" ADD CONSTRAINT "app_collections_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_collections" ADD CONSTRAINT "app_collections_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_payments" ADD CONSTRAINT "app_payments_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_tasks" ADD CONSTRAINT "webhook_tasks_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
