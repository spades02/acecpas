-- ROBUST FIX for Infinite Recursion (42P17)
-- We use a SECURITY DEFINER function to fetch the current user's organization_id.
-- This function runs with elevated privileges, bypassing RLS on the 'profiles' table ensuring no recursion loops.

-- 1. Create the helper function
CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
    SELECT organization_id 
    FROM profiles 
    WHERE auth0_sub = (auth.jwt() ->> 'sub'::text)
    LIMIT 1;
$$;

-- 2. Drop the faulty/recursive policy
DROP POLICY IF EXISTS "Users can view organization profiles" ON profiles;

-- 3. Create the new safe policy
CREATE POLICY "Users can view organization profiles" ON profiles
    FOR SELECT USING (
        organization_id = get_my_org_id()
    );

-- 4. Grant execute permission just in case
GRANT EXECUTE ON FUNCTION get_my_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_org_id() TO service_role;
