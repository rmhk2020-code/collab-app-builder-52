import { useUserData } from "@/hooks/useUserData";

/**
 * Component that handles syncing user data with Supabase.
 * This must be rendered within all context providers to work correctly.
 */
export const UserDataSync = () => {
  // This hook handles loading and auto-saving user data
  useUserData();
  
  return null;
};
