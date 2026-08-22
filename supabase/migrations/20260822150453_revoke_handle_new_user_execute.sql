/*
# Revoke public execute on handle_new_user trigger function

The handle_new_user function is a SECURITY DEFINER trigger that fires on INSERT to auth.users.
It should not be callable directly via the REST API. Revoke EXECUTE from anon and authenticated
roles to prevent direct invocation.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
