// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://edacjnnrjmnftlhdcjab.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkYWNqbm5yam1uZnRsaGRjamFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjcxOTAsImV4cCI6MjA1OTE0MzE5MH0.2Bu7C2euTci7yigc-JDhq-QumH93oLS9g5Uk26yWQMU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);