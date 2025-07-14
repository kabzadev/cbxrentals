"CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY \"Allow auth admin access to user_roles\" ON public.user_roles
    FOR ALL TO supabase_auth_admin USING (true);

-- Insert an example admin role (replace with actual admin user_id)
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-admin-user-uuid', 'admin');
"
