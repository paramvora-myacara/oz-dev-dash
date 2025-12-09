

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."capgaintime" AS ENUM (
    'LAST_180_DAYS',
    'MORE_THAN_180_DAYS',
    'INCOMING'
);


ALTER TYPE "public"."capgaintime" OWNER TO "postgres";


CREATE TYPE "public"."event_type_enum" AS ENUM (
    'auth_initiated',
    'oz_check_completed',
    'developer_profile_created',
    'investor_qualification_submitted',
    'tax_calculator_used',
    'dashboard_viewed',
    'team_contact_requested',
    'community_joined',
    'listings_viewed'
);


ALTER TYPE "public"."event_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."property_class" AS ENUM (
    'class-A'
);


ALTER TYPE "public"."property_class" OWNER TO "postgres";


COMMENT ON TYPE "public"."property_class" IS 'Class of Property for listing';



CREATE TYPE "public"."role_enum" AS ENUM (
    'investor',
    'developer',
    'both'
);


ALTER TYPE "public"."role_enum" OWNER TO "postgres";


CREATE TYPE "public"."userrole" AS ENUM (
    'DEVELOPER',
    'INVESTOR'
);


ALTER TYPE "public"."userrole" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."copy_auth_user_to_public_users"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''));
  -- Also create an entry in user_interests for the new user
  INSERT INTO public.user_interests (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."copy_auth_user_to_public_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_placeholder_users"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'auth', 'public'
    AS $$
begin
  if new.email like 'test-%@example.com' then
    delete from auth.users where id = new.id;
    return null;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."delete_placeholder_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_profile_exists"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Ensure a user_interests row exists for any event
    INSERT INTO public.user_interests (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- If it's a developer-related event, ensure a developer profile exists.
    IF NEW.event_type IN ('oz_check_completed', 'developer_profile_created', 'oz_check_performed') THEN
        INSERT INTO public.developer_profiles (user_id)
        VALUES (NEW.user_id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- If it's an investor-related event, ensure an investor profile exists.
    IF NEW.event_type IN ('investor_qualification_submitted', 'tax_calculator_used') THEN
        INSERT INTO public.investor_profiles (user_id)
        VALUES (NEW.user_id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_profile_exists"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_initial_route"("route" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.users
  SET first_auth_source = 'oz-homepage/' || route
  WHERE id = auth.uid() AND first_auth_source IS NULL;
END;
$$;


ALTER FUNCTION "public"."set_initial_route"("route" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_funnel_progression"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- TODO: Add logic to track user journey milestones based on event_type.
  -- This could involve updating user_interests or another analytics table.
  RAISE NOTICE 'Placeholder: track_funnel_progression trigger called for event %', NEW.event_type;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."track_funnel_progression"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profiles_from_event"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    -- Update developer profile from OZ check events
    IF NEW.event_type = 'oz_check_completed' THEN
        UPDATE public.developer_profiles
        SET
            location_of_development = COALESCE(
                NEW.metadata->>'address', 
                NEW.metadata->'result'->>'address',
                'Coords: ' || (NEW.metadata->>'lat') || ', ' || (NEW.metadata->>'lng')
            ),
            oz_status = COALESCE(
                (NEW.metadata->'result'->>'isOZ')::boolean,
                (NEW.metadata->'result'->>'isOpportunityZone')::boolean,
                (NEW.metadata->>'isInOZ')::boolean
            ),
            geographical_zone = COALESCE(
                NEW.metadata->'result'->>'geoid',
                NEW.metadata->>'geoid'
            ),
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;

    -- Update investor profile from investor qualification events
    IF NEW.event_type = 'investor_qualification_submitted' THEN
        UPDATE public.investor_profiles
        SET
            cap_gain_or_not = (NEW.metadata->>'capGainStatus')::boolean,
            size_of_cap_gain = (NEW.metadata->>'gainAmount')::numeric,
            time_of_cap_gain = NEW.metadata->>'gainTiming',
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;

    -- Update investor profile from tax calculator events
    IF NEW.event_type = 'tax_calculator_used' THEN
        UPDATE public.investor_profiles
        SET
            cap_gain_or_not = (NEW.metadata->>'capitalGainStatus')::boolean,
            size_of_cap_gain =
                CASE 
                    WHEN (NEW.metadata->'gainAmountRange') IS NOT NULL THEN
                        int8range(
                            (NEW.metadata->'gainAmountRange'->>'min')::bigint,
                            (NEW.metadata->'gainAmountRange'->>'max')::bigint,
                            '[)'
                        )
                    ELSE NULL
                END,
            time_of_cap_gain = NEW.metadata->>'gainTiming',
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;

    -- Update invest page interest flag
    IF NEW.event_type IN ('viewed_invest_page', 'invest_page_button_clicked', 'invest_reason_clicked') THEN
        INSERT INTO public.user_interests (user_id)
        VALUES (NEW.user_id)
        ON CONFLICT (user_id) DO NOTHING;

        UPDATE public.user_interests
        SET
            invest_page_interested = true,
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;

    -- Update viewed_listings flag
    IF NEW.event_type = 'viewed_listings' THEN
        UPDATE public.user_interests
        SET
            viewed_listings = true,
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;

    -- Update community_member flag
    IF NEW.event_type = 'community_interest_expressed' THEN
        UPDATE public.user_interests
        SET
            community_member = true,
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."update_profiles_from_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- If user completes a developer action, switch role to 'developer'
  IF NEW.event_type IN ('oz_check_completed', 'developer_profile_created') THEN
    UPDATE public.users
    SET user_role = 'developer'
    WHERE id = NEW.user_id AND user_role != 'developer';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_role"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_user_listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "listing_slug" "text" NOT NULL
);


ALTER TABLE "public"."admin_user_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "password" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role" "text" DEFAULT 'customer'::"text" NOT NULL
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."developer_profiles" (
    "user_id" "uuid" NOT NULL,
    "location_of_development" "text",
    "oz_status" boolean,
    "geographical_zone" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "last_synced_at" timestamp with time zone
);


ALTER TABLE "public"."developer_profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."developer_profiles"."last_synced_at" IS 'last synced to ghl';



CREATE TABLE IF NOT EXISTS "public"."domains" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hostname" "text" NOT NULL,
    "listing_slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."domains" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."investor_profiles" (
    "user_id" "uuid" NOT NULL,
    "cap_gain_or_not" boolean,
    "time_of_cap_gain" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "last_synced_at" timestamp with time zone,
    "size_of_cap_gain" "int8range"
);


ALTER TABLE "public"."investor_profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."investor_profiles"."last_synced_at" IS 'last synced to ghl';



CREATE TABLE IF NOT EXISTS "public"."listing_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "version_number" integer NOT NULL,
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "published_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "news_links" "jsonb"[]
);


ALTER TABLE "public"."listing_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text",
    "current_version_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "has_vault" boolean DEFAULT false NOT NULL,
    "developer_entity_name" "text",
    "developer_ca_email" "text",
    "developer_ca_name" "text",
    "developer_contact_email" "text",
    "developer_website" "text"
);


ALTER TABLE "public"."listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."oz_projects" (
    "project_id" "text" NOT NULL,
    "project_name" "text",
    "project_slug" "text",
    "executive_summary" "text",
    "property_type" "text",
    "status" "text",
    "created_at" "text",
    "state" "text",
    "construction_type" "text",
    "minimum_investment" double precision,
    "projected_irr_10yr" double precision,
    "equity_multiple_10yr" double precision,
    "fund_type" "text",
    "property_class" "public"."property_class",
    CONSTRAINT "oz_projects_fund_type_check" CHECK (("fund_type" = ANY (ARRAY['Single-Asset'::"text", 'Multi-Asset'::"text"])))
);


ALTER TABLE "public"."oz_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."oz_webinars" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "webinar_slug" "text",
    "recording_link" "text",
    "webinar_name" "text",
    "end_time" timestamp with time zone,
    "start_time" timestamp with time zone,
    "banner_image_link" "text"
);


ALTER TABLE "public"."oz_webinars" OWNER TO "postgres";


ALTER TABLE "public"."oz_webinars" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."oz_webinars_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."ozzie_user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "role" "text",
    "cap_gain_or_not" boolean,
    "size_of_cap_gain" numeric,
    "time_of_cap_gain" "text",
    "geographical_zone_of_investment" "text",
    "need_team_contact" boolean,
    "location_of_development" "text",
    "last_synced_at" timestamp with time zone,
    "message_count" integer DEFAULT 0,
    "last_session_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "check_developer_location" CHECK ((("role" = 'Developer'::"text") OR (("role" = 'Investor'::"text") AND ("location_of_development" IS NULL)) OR (("role" IS NULL) AND ("location_of_development" IS NULL)))),
    CONSTRAINT "check_investor_cap_gain" CHECK ((("role" = 'Investor'::"text") OR (("role" = 'Developer'::"text") AND ("cap_gain_or_not" IS NULL) AND ("size_of_cap_gain" IS NULL) AND ("time_of_cap_gain" IS NULL)) OR (("role" IS NULL) AND ("cap_gain_or_not" IS NULL) AND ("size_of_cap_gain" IS NULL) AND ("time_of_cap_gain" IS NULL)))),
    CONSTRAINT "user_profiles_geographical_zone_of_investment_check" CHECK (("length"("geographical_zone_of_investment") = 2)),
    CONSTRAINT "user_profiles_role_check" CHECK (("role" = ANY (ARRAY['Developer'::"text", 'Investor'::"text"]))),
    CONSTRAINT "user_profiles_time_of_cap_gain_check" CHECK (("time_of_cap_gain" = ANY (ARRAY['Last 180 days'::"text", 'More than 180 days AGO'::"text", 'Upcoming'::"text"])))
);


ALTER TABLE "public"."ozzie_user_profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."ozzie_user_profiles"."last_synced_at" IS 'last synced to ghl';



CREATE TABLE IF NOT EXISTS "public"."user_attribution" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "utm_source" "text",
    "utm_medium" "text",
    "utm_campaign" "text",
    "utm_term" "text",
    "utm_content" "text",
    "initial_utm_source" "text",
    "initial_utm_medium" "text",
    "initial_utm_campaign" "text",
    "initial_utm_term" "text",
    "initial_utm_content" "text",
    "initial_referrer" "text",
    "last_referrer" "text",
    "initial_landing_page_url" "text",
    "visits" integer,
    "additional_params" "jsonb",
    "last_synced_at" timestamp with time zone
);


ALTER TABLE "public"."user_attribution" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_attribution" IS 'Stores marketing attribution and tracking data for users.';



COMMENT ON COLUMN "public"."user_attribution"."user_id" IS 'Foreign key to the authenticated user.';



COMMENT ON COLUMN "public"."user_attribution"."last_synced_at" IS 'last synced to ghl';



CREATE TABLE IF NOT EXISTS "public"."user_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_type" "text",
    "endpoint" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "synced" "text"
);


ALTER TABLE "public"."user_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "user_role" "text" DEFAULT 'investor'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "last_synced_at" timestamp with time zone,
    "full_name" "text",
    "phone_number" "text",
    "ghl_id" "text",
    "ghi_deals_id" "text",
    CONSTRAINT "users_user_role_check" CHECK (("user_role" = ANY (ARRAY['investor'::"text", 'developer'::"text", 'both'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_events_with_email" WITH ("security_invoker"='on') AS
 SELECT "ue"."id",
    "ue"."user_id",
    "u"."email",
    "ue"."event_type",
    "ue"."endpoint",
    "ue"."metadata",
    "ue"."created_at",
    "ue"."synced"
   FROM ("public"."user_events" "ue"
     LEFT JOIN "public"."users" "u" ON (("ue"."user_id" = "u"."id")));


ALTER VIEW "public"."user_events_with_email" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_interests" (
    "user_id" "uuid" NOT NULL,
    "needs_team_contact" boolean DEFAULT false,
    "community_member" boolean DEFAULT false,
    "viewed_listings" boolean DEFAULT false,
    "dashboard_accessed" boolean DEFAULT false,
    "last_team_contact_request" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "last_synced_at" timestamp with time zone,
    "invest_page_interested" boolean DEFAULT false
);


ALTER TABLE "public"."user_interests" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_interests"."last_synced_at" IS 'last synced to ghl';



CREATE TABLE IF NOT EXISTS "public"."webinar_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" "text",
    "first_name" "text",
    "last_name" "text",
    "email" "text"
);


ALTER TABLE "public"."webinar_users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_user_listings"
    ADD CONSTRAINT "admin_user_listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_user_listings"
    ADD CONSTRAINT "admin_user_listings_user_id_listing_slug_key" UNIQUE ("user_id", "listing_slug");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."developer_profiles"
    ADD CONSTRAINT "developer_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."domains"
    ADD CONSTRAINT "domains_hostname_key" UNIQUE ("hostname");



ALTER TABLE ONLY "public"."domains"
    ADD CONSTRAINT "domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investor_profiles"
    ADD CONSTRAINT "investor_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."listing_versions"
    ADD CONSTRAINT "listing_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."oz_projects"
    ADD CONSTRAINT "oz_projects_pkey" PRIMARY KEY ("project_id");



ALTER TABLE ONLY "public"."oz_webinars"
    ADD CONSTRAINT "oz_webinars_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_attribution"
    ADD CONSTRAINT "user_attribution_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_attribution"
    ADD CONSTRAINT "user_attribution_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_events"
    ADD CONSTRAINT "user_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."ozzie_user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ozzie_user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webinar_users"
    ADD CONSTRAINT "webinar_users_pkey" PRIMARY KEY ("id");



CREATE INDEX "admin_users_role_idx" ON "public"."admin_users" USING "btree" ("role");



CREATE INDEX "idx_user_profiles_geo_zone" ON "public"."ozzie_user_profiles" USING "btree" ("geographical_zone_of_investment");



CREATE INDEX "idx_user_profiles_role" ON "public"."ozzie_user_profiles" USING "btree" ("role");



CREATE INDEX "idx_user_profiles_user_id" ON "public"."ozzie_user_profiles" USING "btree" ("user_id");



CREATE INDEX "listing_versions_listing_id_idx" ON "public"."listing_versions" USING "btree" ("listing_id");



CREATE UNIQUE INDEX "listing_versions_unique_version" ON "public"."listing_versions" USING "btree" ("listing_id", "version_number");



CREATE OR REPLACE TRIGGER "on_developer_profiles_updated" BEFORE UPDATE ON "public"."developer_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_investor_profiles_updated" BEFORE UPDATE ON "public"."investor_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_user_attribution_updated" BEFORE UPDATE ON "public"."user_attribution" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_user_event_insert_ensure_profile" AFTER INSERT ON "public"."user_events" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_profile_exists"();



CREATE OR REPLACE TRIGGER "on_user_event_insert_track_funnel" AFTER INSERT ON "public"."user_events" FOR EACH ROW EXECUTE FUNCTION "public"."track_funnel_progression"();



CREATE OR REPLACE TRIGGER "on_user_event_insert_update_profiles" AFTER INSERT ON "public"."user_events" FOR EACH ROW EXECUTE FUNCTION "public"."update_profiles_from_event"();



CREATE OR REPLACE TRIGGER "on_user_event_insert_update_role" AFTER INSERT ON "public"."user_events" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_role"();



CREATE OR REPLACE TRIGGER "on_user_interests_updated" BEFORE UPDATE ON "public"."user_interests" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_users_updated" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."ozzie_user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_user_listings"
    ADD CONSTRAINT "admin_user_listings_listing_slug_fkey" FOREIGN KEY ("listing_slug") REFERENCES "public"."listings"("slug") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_user_listings"
    ADD CONSTRAINT "admin_user_listings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."developer_profiles"
    ADD CONSTRAINT "developer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investor_profiles"
    ADD CONSTRAINT "investor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_versions"
    ADD CONSTRAINT "listing_versions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_current_version_fkey" FOREIGN KEY ("current_version_id") REFERENCES "public"."listing_versions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_attribution"
    ADD CONSTRAINT "user_attribution_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_events"
    ADD CONSTRAINT "user_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ozzie_user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow individual read and write access" ON "public"."user_attribution" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."ozzie_user_profiles" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") OR ("auth"."role"() = 'authenticated'::"text")));



CREATE POLICY "Enable select for own profile" ON "public"."ozzie_user_profiles" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "Enable update for authenticated users" ON "public"."ozzie_user_profiles" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR ("auth"."role"() = 'authenticated'::"text"))) WITH CHECK ((("auth"."uid"() = "user_id") OR ("auth"."role"() = 'authenticated'::"text")));



ALTER TABLE "public"."ozzie_user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_attribution" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webinar_users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."user_events";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "authenticator";

























































































































































GRANT ALL ON FUNCTION "public"."copy_auth_user_to_public_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."copy_auth_user_to_public_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."copy_auth_user_to_public_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_placeholder_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_placeholder_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_placeholder_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_profile_exists"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_profile_exists"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_profile_exists"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_initial_route"("route" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_initial_route"("route" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_initial_route"("route" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."track_funnel_progression"() TO "anon";
GRANT ALL ON FUNCTION "public"."track_funnel_progression"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_funnel_progression"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profiles_from_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profiles_from_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profiles_from_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_role"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_user_listings" TO "anon";
GRANT ALL ON TABLE "public"."admin_user_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_user_listings" TO "service_role";



GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."developer_profiles" TO "anon";
GRANT ALL ON TABLE "public"."developer_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."developer_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."domains" TO "anon";
GRANT ALL ON TABLE "public"."domains" TO "authenticated";
GRANT ALL ON TABLE "public"."domains" TO "service_role";



GRANT ALL ON TABLE "public"."investor_profiles" TO "anon";
GRANT ALL ON TABLE "public"."investor_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."investor_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."listing_versions" TO "anon";
GRANT ALL ON TABLE "public"."listing_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_versions" TO "service_role";



GRANT ALL ON TABLE "public"."listings" TO "anon";
GRANT ALL ON TABLE "public"."listings" TO "authenticated";
GRANT ALL ON TABLE "public"."listings" TO "service_role";



GRANT ALL ON TABLE "public"."oz_projects" TO "anon";
GRANT ALL ON TABLE "public"."oz_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."oz_projects" TO "service_role";



GRANT ALL ON TABLE "public"."oz_webinars" TO "anon";
GRANT ALL ON TABLE "public"."oz_webinars" TO "authenticated";
GRANT ALL ON TABLE "public"."oz_webinars" TO "service_role";



GRANT ALL ON SEQUENCE "public"."oz_webinars_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."oz_webinars_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."oz_webinars_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."ozzie_user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."ozzie_user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."ozzie_user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_attribution" TO "anon";
GRANT ALL ON TABLE "public"."user_attribution" TO "authenticated";
GRANT ALL ON TABLE "public"."user_attribution" TO "service_role";



GRANT ALL ON TABLE "public"."user_events" TO "anon";
GRANT ALL ON TABLE "public"."user_events" TO "authenticated";
GRANT ALL ON TABLE "public"."user_events" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";
GRANT INSERT ON TABLE "public"."users" TO "authenticator";



GRANT ALL ON TABLE "public"."user_events_with_email" TO "anon";
GRANT ALL ON TABLE "public"."user_events_with_email" TO "authenticated";
GRANT ALL ON TABLE "public"."user_events_with_email" TO "service_role";



GRANT ALL ON TABLE "public"."user_interests" TO "anon";
GRANT ALL ON TABLE "public"."user_interests" TO "authenticated";
GRANT ALL ON TABLE "public"."user_interests" TO "service_role";



GRANT ALL ON TABLE "public"."webinar_users" TO "anon";
GRANT ALL ON TABLE "public"."webinar_users" TO "authenticated";
GRANT ALL ON TABLE "public"."webinar_users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























drop extension if exists "pg_net";

drop trigger if exists "on_developer_profiles_updated" on "public"."developer_profiles";

drop trigger if exists "on_investor_profiles_updated" on "public"."investor_profiles";

drop trigger if exists "update_user_profiles_updated_at" on "public"."ozzie_user_profiles";

drop trigger if exists "on_user_attribution_updated" on "public"."user_attribution";

drop trigger if exists "on_user_event_insert_ensure_profile" on "public"."user_events";

drop trigger if exists "on_user_event_insert_track_funnel" on "public"."user_events";

drop trigger if exists "on_user_event_insert_update_profiles" on "public"."user_events";

drop trigger if exists "on_user_event_insert_update_role" on "public"."user_events";

drop trigger if exists "on_user_interests_updated" on "public"."user_interests";

drop trigger if exists "on_users_updated" on "public"."users";

alter table "public"."admin_user_listings" drop constraint "admin_user_listings_listing_slug_fkey";

alter table "public"."admin_user_listings" drop constraint "admin_user_listings_user_id_fkey";

alter table "public"."developer_profiles" drop constraint "developer_profiles_user_id_fkey";

alter table "public"."investor_profiles" drop constraint "investor_profiles_user_id_fkey";

alter table "public"."listing_versions" drop constraint "listing_versions_listing_id_fkey";

alter table "public"."listings" drop constraint "listings_current_version_fkey";

alter table "public"."user_events" drop constraint "user_events_user_id_fkey";

alter table "public"."user_interests" drop constraint "user_interests_user_id_fkey";

alter table "public"."oz_projects" alter column "property_class" set data type public.property_class using "property_class"::text::public.property_class;

alter table "public"."admin_user_listings" add constraint "admin_user_listings_listing_slug_fkey" FOREIGN KEY (listing_slug) REFERENCES public.listings(slug) ON DELETE CASCADE not valid;

alter table "public"."admin_user_listings" validate constraint "admin_user_listings_listing_slug_fkey";

alter table "public"."admin_user_listings" add constraint "admin_user_listings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE not valid;

alter table "public"."admin_user_listings" validate constraint "admin_user_listings_user_id_fkey";

alter table "public"."developer_profiles" add constraint "developer_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."developer_profiles" validate constraint "developer_profiles_user_id_fkey";

alter table "public"."investor_profiles" add constraint "investor_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."investor_profiles" validate constraint "investor_profiles_user_id_fkey";

alter table "public"."listing_versions" add constraint "listing_versions_listing_id_fkey" FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE not valid;

alter table "public"."listing_versions" validate constraint "listing_versions_listing_id_fkey";

alter table "public"."listings" add constraint "listings_current_version_fkey" FOREIGN KEY (current_version_id) REFERENCES public.listing_versions(id) ON DELETE SET NULL not valid;

alter table "public"."listings" validate constraint "listings_current_version_fkey";

alter table "public"."user_events" add constraint "user_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_events" validate constraint "user_events_user_id_fkey";

alter table "public"."user_interests" add constraint "user_interests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_interests" validate constraint "user_interests_user_id_fkey";

create or replace view "public"."user_events_with_email" as  SELECT ue.id,
    ue.user_id,
    u.email,
    ue.event_type,
    ue.endpoint,
    ue.metadata,
    ue.created_at,
    ue.synced
   FROM (public.user_events ue
     LEFT JOIN public.users u ON ((ue.user_id = u.id)));


CREATE TRIGGER on_developer_profiles_updated BEFORE UPDATE ON public.developer_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_investor_profiles_updated BEFORE UPDATE ON public.investor_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.ozzie_user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_user_attribution_updated BEFORE UPDATE ON public.user_attribution FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_user_event_insert_ensure_profile AFTER INSERT ON public.user_events FOR EACH ROW EXECUTE FUNCTION public.ensure_profile_exists();

CREATE TRIGGER on_user_event_insert_track_funnel AFTER INSERT ON public.user_events FOR EACH ROW EXECUTE FUNCTION public.track_funnel_progression();

CREATE TRIGGER on_user_event_insert_update_profiles AFTER INSERT ON public.user_events FOR EACH ROW EXECUTE FUNCTION public.update_profiles_from_event();

CREATE TRIGGER on_user_event_insert_update_role AFTER INSERT ON public.user_events FOR EACH ROW EXECUTE FUNCTION public.update_user_role();

CREATE TRIGGER on_user_interests_updated BEFORE UPDATE ON public.user_interests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_users_updated BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_auth_user_created_copy_to_public_users AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.copy_auth_user_to_public_users();

CREATE TRIGGER trg_delete_placeholder AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.delete_placeholder_users();


  create policy "Allow admins to upload and delete images- anon key 1s9ae6h_0"
  on "storage"."objects"
  as permissive
  for insert
  to anon
with check ((bucket_id = 'oz-projects-images'::text));



  create policy "Allow admins to upload and delete images- anon key 1s9ae6h_1"
  on "storage"."objects"
  as permissive
  for delete
  to anon
using ((bucket_id = 'oz-projects-images'::text));



  create policy "Allow admins to upload and delete images- anon key 1s9ae6h_2"
  on "storage"."objects"
  as permissive
  for select
  to anon
using ((bucket_id = 'oz-projects-images'::text));



  create policy "Allow anon key full access to bucket 1b7d2p3_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'ddv-up-campus-reno'::text));



  create policy "Allow anon key full access to bucket 1b7d2p3_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'ddv-up-campus-reno'::text));



  create policy "Allow anon key full access to bucket 1b7d2p3_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((bucket_id = 'ddv-up-campus-reno'::text));



  create policy "Allow anon key full access to bucket 1b7d2p3_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'ddv-up-campus-reno'::text));



  create policy "Allow authenticated users to view ddv-the-edge-on-main"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'ddv-the-edge-on-main'::text));



  create policy "Give anon users access to JPG images in folder 1s9ae6h_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'oz-projects-images'::text) AND (storage.extension(name) = 'jpg'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));



  create policy "Give full permissions to anon key i0ljmm_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'ddv-oz-recap-fund'::text));



  create policy "Give full permissions to anon key i0ljmm_1"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'ddv-oz-recap-fund'::text));



  create policy "Give full permissions to anon key i0ljmm_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((bucket_id = 'ddv-oz-recap-fund'::text));



  create policy "Give full permissions to anon key i0ljmm_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'ddv-oz-recap-fund'::text));



  create policy "Reading from bucket open to anyone on internet 1s9ae6h_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'oz-projects-images'::text));



  create policy "give public users access to book sample eagxuw_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'homepage-book'::text));



  create policy "give service role all permissions k97out_0"
  on "storage"."objects"
  as permissive
  for select
  to service_role
using ((bucket_id = 'oz-dev-docs'::text));



  create policy "give service role all permissions k97out_1"
  on "storage"."objects"
  as permissive
  for insert
  to service_role
with check ((bucket_id = 'oz-dev-docs'::text));



  create policy "give service role all permissions k97out_2"
  on "storage"."objects"
  as permissive
  for update
  to service_role
using ((bucket_id = 'oz-dev-docs'::text));



  create policy "give service role all permissions k97out_3"
  on "storage"."objects"
  as permissive
  for delete
  to service_role
using ((bucket_id = 'oz-dev-docs'::text));



