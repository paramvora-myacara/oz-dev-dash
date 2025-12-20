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

alter table "public"."campaign_recipients" drop constraint "campaign_recipients_campaign_id_fkey";

alter table "public"."campaign_recipients" drop constraint "campaign_recipients_contact_id_fkey";

alter table "public"."developer_profiles" drop constraint "developer_profiles_user_id_fkey";

alter table "public"."email_queue" drop constraint "email_queue_campaign_id_fkey";

alter table "public"."investor_profiles" drop constraint "investor_profiles_user_id_fkey";

alter table "public"."listing_versions" drop constraint "listing_versions_listing_id_fkey";

alter table "public"."listings" drop constraint "listings_current_version_fkey";

alter table "public"."payments" drop constraint "payments_user_id_fkey";

alter table "public"."subscriptions" drop constraint "subscriptions_plan_id_fkey";

alter table "public"."subscriptions" drop constraint "subscriptions_user_id_fkey";

alter table "public"."user_events" drop constraint "user_events_user_id_fkey";

alter table "public"."user_interests" drop constraint "user_interests_user_id_fkey";

alter table "public"."email_queue" alter column "id" set default nextval('public.email_queue_id_seq'::regclass);

alter table "public"."oz_projects" alter column "property_class" set data type public.property_class using "property_class"::text::public.property_class;

alter table "public"."admin_user_listings" add constraint "admin_user_listings_listing_slug_fkey" FOREIGN KEY (listing_slug) REFERENCES public.listings(slug) ON DELETE CASCADE not valid;

alter table "public"."admin_user_listings" validate constraint "admin_user_listings_listing_slug_fkey";

alter table "public"."admin_user_listings" add constraint "admin_user_listings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE not valid;

alter table "public"."admin_user_listings" validate constraint "admin_user_listings_user_id_fkey";

alter table "public"."campaign_recipients" add constraint "campaign_recipients_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."campaign_recipients" validate constraint "campaign_recipients_campaign_id_fkey";

alter table "public"."campaign_recipients" add constraint "campaign_recipients_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE not valid;

alter table "public"."campaign_recipients" validate constraint "campaign_recipients_contact_id_fkey";

alter table "public"."developer_profiles" add constraint "developer_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."developer_profiles" validate constraint "developer_profiles_user_id_fkey";

alter table "public"."email_queue" add constraint "email_queue_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) not valid;

alter table "public"."email_queue" validate constraint "email_queue_campaign_id_fkey";

alter table "public"."investor_profiles" add constraint "investor_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."investor_profiles" validate constraint "investor_profiles_user_id_fkey";

alter table "public"."listing_versions" add constraint "listing_versions_listing_id_fkey" FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE not valid;

alter table "public"."listing_versions" validate constraint "listing_versions_listing_id_fkey";

alter table "public"."listings" add constraint "listings_current_version_fkey" FOREIGN KEY (current_version_id) REFERENCES public.listing_versions(id) ON DELETE SET NULL not valid;

alter table "public"."listings" validate constraint "listings_current_version_fkey";

alter table "public"."payments" add constraint "payments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE not valid;

alter table "public"."payments" validate constraint "payments_user_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_plan_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

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

drop trigger if exists "on_auth_user_created_copy_to_public_users" on "auth"."users";

drop trigger if exists "trg_delete_placeholder" on "auth"."users";

CREATE TRIGGER on_auth_user_created_copy_to_public_users AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.copy_auth_user_to_public_users();

CREATE TRIGGER trg_delete_placeholder AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.delete_placeholder_users();


  create policy "Give full permissions to public roles 1ccryb7_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'ddv-alden-brockton-ma'::text));



  create policy "Give full permissions to public roles 1ccryb7_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'ddv-alden-brockton-ma'::text));



  create policy "Give full permissions to public roles 1ccryb7_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((bucket_id = 'ddv-alden-brockton-ma'::text));



  create policy "Give full permissions to public roles 1ccryb7_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'ddv-alden-brockton-ma'::text));



