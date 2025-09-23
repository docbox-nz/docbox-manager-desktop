CREATE TABLE IF NOT EXISTS "servers" (
	"id"	uuid_text NOT NULL,
	"name"	varchar NOT NULL,
	"config"	jsonb_text NOT NULL,
	"order"	integer NOT NULL DEFAULT 0,
	PRIMARY KEY("id")
);