const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('--- SUPABASE DIAGNOSTIC START ---');
console.log('URL:', supabaseUrl);
console.log('KEY (first 10 chars):', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnostic() {
    console.log('\n1. Testing Connection...');
    try {
        console.log('Fetching from URL:', `${supabaseUrl}/rest/v1/settings?select=*&limit=1`);
        const { data, error } = await supabase.from('settings').select('*').limit(1);
        if (error) {
            console.error('❌ Connection Failed:', error.message);
            if (error.message.includes('fetch failed')) {
                console.log('👉 TIP: Ini biasanya masalah DNS atau Internet. Coba ganti ke Hotspot HP.');
            }
            console.error('Full Error Object:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Connection Successful!');
            console.log('Data found:', data);
        }
    } catch (err) {
        console.error('💥 Unexpected Crash:', err.message);
        console.log('Stack Trace:', err.stack);
    }

    console.log('\n2. Testing Tables...');
    const tables = ['orders', 'events', 'admins'];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ Table "${table}": NOT FOUND or ERROR (${error.message})`);
        } else {
            console.log(`✅ Table "${table}": OK`);
        }
    }
    console.log('\n--- DIAGNOSTIC END ---');
}

diagnostic();
