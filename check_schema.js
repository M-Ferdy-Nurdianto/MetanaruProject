const supabase = require('./server/supabaseClient');
async function checkSchema() {
  const { data, error } = await supabase.from('events').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    console.log('No data in events table to check columns.');
    // Try to insert and catch error to see columns? No, let's try to get schema info
    const { data: columns, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'events' });
    if (colError) {
        console.log('RPC get_table_columns failed or not exists');
    } else {
        console.log('Columns from RPC:', columns);
    }
  }
}
checkSchema();
