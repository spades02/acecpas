-- Fix infinite recursion in profiles policy
-- The original policy triggered a self-referential loop when querying organization_id
-- We add a direct check for "own profile" to break the recursion loop

DROP POLICY IF EXISTS "Users can view organization profiles" ON profiles;

CREATE POLICY "Users can view organization profiles" ON profiles
    FOR SELECT USING (
        auth0_sub = (auth.jwt() ->> 'sub'::text) -- Break recursion by allowing own profile view directly
        OR
        organization_id IN (
            SELECT organization_id 
            FROM profiles 
            WHERE auth0_sub = (auth.jwt() ->> 'sub'::text)
        )
    );
