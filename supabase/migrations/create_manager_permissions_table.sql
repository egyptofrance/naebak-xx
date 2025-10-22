-- Create manager_permissions table
CREATE TABLE IF NOT EXISTS public.manager_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_manage_users BOOLEAN DEFAULT false,
  can_manage_deputies BOOLEAN DEFAULT false,
  can_manage_content BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT false,
  can_manage_settings BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_manager_permissions_user_id ON public.manager_permissions(user_id);

-- Enable Row Level Security
ALTER TABLE public.manager_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access to manager_permissions"
  ON public.manager_permissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to read manager permissions
-- Using same approach as deputy_profiles for consistency
CREATE POLICY "Anyone can view manager permissions"
  ON public.manager_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow admins to read all permissions
CREATE POLICY "Admins can read all manager permissions"
  ON public.manager_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create policy to allow admins to update all permissions
CREATE POLICY "Admins can update all manager permissions"
  ON public.manager_permissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create policy to allow admins to insert permissions
CREATE POLICY "Admins can insert manager permissions"
  ON public.manager_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create policy to allow admins to delete permissions
CREATE POLICY "Admins can delete manager permissions"
  ON public.manager_permissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_manager_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS update_manager_permissions_updated_at_trigger ON public.manager_permissions;
CREATE TRIGGER update_manager_permissions_updated_at_trigger
  BEFORE UPDATE ON public.manager_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_manager_permissions_updated_at();

-- Add comment to table
COMMENT ON TABLE public.manager_permissions IS 'Stores permissions for users with manager role';
COMMENT ON COLUMN public.manager_permissions.user_id IS 'Reference to the user who has manager role';
COMMENT ON COLUMN public.manager_permissions.can_manage_users IS 'Permission to manage users (citizens)';
COMMENT ON COLUMN public.manager_permissions.can_manage_deputies IS 'Permission to manage deputies';
COMMENT ON COLUMN public.manager_permissions.can_manage_content IS 'Permission to manage content (blog, articles, etc.)';
COMMENT ON COLUMN public.manager_permissions.can_view_reports IS 'Permission to view reports and analytics';
COMMENT ON COLUMN public.manager_permissions.can_manage_settings IS 'Permission to manage application settings';

