const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jfywlsvcztiblcbiurzp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeXdsc3ZjenRpYmxjYml1cnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzc3MzQsImV4cCI6MjA5Mjk1MzczNH0.Yf0Dhup8HHdyW3L5X-AYlBMwBG_YrDYOjKOP5SF1e4A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    try {
        const { data, error } = await supabase.from('post_events').select('*').limit(1);
        if (data && data.length > 0) {
            console.log('Columns in post_events:', Object.keys(data[0]));
        }
    } catch (e) {
        console.error(e);
    }
}

checkColumns();
