import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/nir/projects/AiPK-Trainer/.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const u = { id: "u_test_99", email: "test@test.com", role: "trainee" };
  const res = await supabase.from('app_users').insert([{ id: u.id, data: u }]);
  console.log("INSERT RESULT:", res.error || "SUCCESS");
}
test();
