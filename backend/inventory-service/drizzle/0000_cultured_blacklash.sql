CREATE TABLE "inventory_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"status" varchar(20) DEFAULT 'RESERVED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservation_quantity_positive" CHECK ("inventory_reservations"."quantity" > 0),
	CONSTRAINT "reservation_status_valid" CHECK ("inventory_reservations"."status" IN ('RESERVED', 'RELEASED', 'CONFIRMED'))
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"available_quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_product_id_unique" UNIQUE("product_id"),
	CONSTRAINT "available_quantity_non_negative" CHECK ("inventory"."available_quantity" >= 0),
	CONSTRAINT "reserved_quantity_non_negative" CHECK ("inventory"."reserved_quantity" >= 0)
);
--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_reservations_inventory_idx" ON "inventory_reservations" USING btree ("inventory_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_reservations_order_inventory_uq" ON "inventory_reservations" USING btree ("order_id","inventory_id");