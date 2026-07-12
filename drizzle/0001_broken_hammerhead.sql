CREATE TYPE "public"."driver_status" AS ENUM('Available', 'OnTrip', 'OffDuty', 'Suspended');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('toll', 'other');--> statement-breakpoint
CREATE TYPE "public"."inventory_status" AS ENUM('InStock', 'LowStock');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('Open', 'Completed');--> statement-breakpoint
CREATE TYPE "public"."permission_action" AS ENUM('view', 'create', 'edit', 'delete');--> statement-breakpoint
CREATE TYPE "public"."permission_module" AS ENUM('fleet', 'drivers', 'trips', 'maintenance', 'fuel', 'analytics', 'settings');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('Draft', 'Dispatched', 'InTransit', 'Completed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('Available', 'OnTrip', 'InShop', 'Retired');--> statement-breakpoint
CREATE TABLE "driver" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"license_number" text NOT NULL,
	"license_category" text NOT NULL,
	"license_expiry_date" timestamp NOT NULL,
	"contact_number" text NOT NULL,
	"safety_score" integer DEFAULT 100 NOT NULL,
	"status" "driver_status" DEFAULT 'Available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "driver_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "expense" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"trip_id" text,
	"category" "expense_category" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_log" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"trip_id" text,
	"liters" numeric(10, 2) NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_item" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reorder_level" integer DEFAULT 0 NOT NULL,
	"status" "inventory_status" DEFAULT 'InStock' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_record" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"service_type" text NOT NULL,
	"date" timestamp NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"notes" text,
	"status" "maintenance_status" DEFAULT 'Open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"source" text NOT NULL,
	"destination" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"driver_id" text NOT NULL,
	"cargo_weight_kg" integer NOT NULL,
	"planned_distance_km" integer NOT NULL,
	"actual_odometer_km" integer,
	"fuel_consumed_liters" numeric(10, 2),
	"revenue" numeric(12, 2),
	"status" "trip_status" DEFAULT 'Draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle" (
	"id" text PRIMARY KEY NOT NULL,
	"registration_number" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"max_load_capacity_kg" integer NOT NULL,
	"odometer_km" integer DEFAULT 0 NOT NULL,
	"acquisition_cost" numeric(12, 2) NOT NULL,
	"region" text NOT NULL,
	"status" "vehicle_status" DEFAULT 'Available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
CREATE TABLE "permission" (
	"id" text PRIMARY KEY NOT NULL,
	"module" "permission_module" NOT NULL,
	"action" "permission_action" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "role_permission" (
	"role_id" text NOT NULL,
	"permission_id" text NOT NULL,
	"granted" boolean DEFAULT true NOT NULL,
	CONSTRAINT "role_permission_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role_id" text;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_log" ADD CONSTRAINT "fuel_log_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_log" ADD CONSTRAINT "fuel_log_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_record" ADD CONSTRAINT "maintenance_record_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_driver_id_driver_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."driver"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "driver_status_idx" ON "driver" USING btree ("status");--> statement-breakpoint
CREATE INDEX "expense_vehicleId_idx" ON "expense" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "fuel_log_vehicleId_idx" ON "fuel_log" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "maintenance_record_vehicleId_idx" ON "maintenance_record" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "trip_status_idx" ON "trip" USING btree ("status");--> statement-breakpoint
CREATE INDEX "trip_vehicleId_idx" ON "trip" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "trip_driverId_idx" ON "trip" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "vehicle_status_idx" ON "vehicle" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vehicle_region_idx" ON "vehicle" USING btree ("region");--> statement-breakpoint
CREATE UNIQUE INDEX "permission_module_action_unique" ON "permission" USING btree ("module","action");--> statement-breakpoint
CREATE INDEX "permission_module_action_idx" ON "permission" USING btree ("module","action");--> statement-breakpoint
CREATE INDEX "role_permission_roleId_idx" ON "role_permission" USING btree ("role_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE set null ON UPDATE no action;