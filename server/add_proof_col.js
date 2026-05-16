const supabase = require('./supabaseClient');

async function addProofColumn() {
    console.log('--- Adding payment_proof_url to merch_orders ---');
    const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
            ALTER TABLE merch_orders 
            ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
        `
    });
    if (error) console.error('Error:', error);
    else console.log('Successfully added payment_proof_url column.');
}

addProofColumn();
