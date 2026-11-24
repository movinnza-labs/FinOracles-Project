import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "services_related_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "products_related_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  ALTER TABLE "products" ADD COLUMN "who_should_consider" varchar;
  ALTER TABLE "products" ADD COLUMN "how_it_works" varchar;
  ALTER TABLE "home_page_what_we_do_items" ADD COLUMN "url" varchar;
  ALTER TABLE "home_page_expertise_items" ADD COLUMN "url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "address_latitude" numeric;
  ALTER TABLE "site_settings" ADD COLUMN "address_longitude" numeric;
  ALTER TABLE "services_related_links" ADD CONSTRAINT "services_related_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_related_links" ADD CONSTRAINT "products_related_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_related_links_order_idx" ON "services_related_links" USING btree ("_order");
  CREATE INDEX "services_related_links_parent_id_idx" ON "services_related_links" USING btree ("_parent_id");
  CREATE INDEX "products_related_links_order_idx" ON "products_related_links" USING btree ("_order");
  CREATE INDEX "products_related_links_parent_id_idx" ON "products_related_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "services_related_links" CASCADE;
  DROP TABLE "products_related_links" CASCADE;
  ALTER TABLE "products" DROP COLUMN "who_should_consider";
  ALTER TABLE "products" DROP COLUMN "how_it_works";
  ALTER TABLE "home_page_what_we_do_items" DROP COLUMN "url";
  ALTER TABLE "home_page_expertise_items" DROP COLUMN "url";
  ALTER TABLE "site_settings" DROP COLUMN "address_latitude";
  ALTER TABLE "site_settings" DROP COLUMN "address_longitude";`)
}
