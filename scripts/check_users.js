import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/nir/projects/AiPK-Trainer/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('app_users').select('*');
  console.log("Error:", error);
  console.log("Data total len:", data?.length);
  console.log("Data sample:", JSON.stringify(data?.slice(0, 3), null, 2));
}
run();
