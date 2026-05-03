const supabase = require('./server/supabaseClient');
async function tryInsert() {
  console.log('Testing minimal insert...');
  const { data, error } = await supabase.from('events').insert({ name: 'Test Event' }).select();
  if (error) {
    console.error('Minimal insert failed:', error);
  } else {
    console.log('Minimal insert success:', data);
    console.log('Columns:', Object.keys(data[0]));
  }
}
tryInsert();
