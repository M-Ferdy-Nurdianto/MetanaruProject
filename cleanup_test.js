const supabase = require('./server/supabaseClient');
async function cleanup() {
  const { error } = await supabase.from('events').delete().eq('name', 'Test Event');
  if (error) console.error('Cleanup failed:', error);
  else console.log('Cleanup success');
}
cleanup();
