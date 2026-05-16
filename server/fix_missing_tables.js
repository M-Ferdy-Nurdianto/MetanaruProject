const supabase = require('./supabaseClient');

async function fixMissingTables() {
    console.log('--- Fixing Missing Tables ---');

    // 1. Merchandise Table
    console.log('Creating merchandise table...');
    const { error: merchError } = await supabase.rpc('exec_sql', {
        sql_query: `
            CREATE TABLE IF NOT EXISTS merchandise (
                id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                nama TEXT NOT NULL,
                deskripsi TEXT,
                harga BIGINT DEFAULT 0,
                stok INTEGER DEFAULT 0,
                category TEXT DEFAULT 'accessory',
                is_po BOOLEAN DEFAULT FALSE,
                available BOOLEAN DEFAULT TRUE,
                images TEXT[] DEFAULT '{}',
                variants JSONB DEFAULT '[]',
                sizes TEXT[] DEFAULT '{}',
                size_chart_urls TEXT[] DEFAULT '{}',
                urutan INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `
    });
    if (merchError) console.error('Error creating merchandise:', merchError);
    else console.log('Merchandise table checked/created.');

    // 2. Merch Orders Table
    console.log('Creating merch_orders table...');
    const { error: merchOrderError } = await supabase.rpc('exec_sql', {
        sql_query: `
            CREATE TABLE IF NOT EXISTS merch_orders (
                id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                order_number TEXT UNIQUE,
                nama_lengkap TEXT NOT NULL,
                whatsapp TEXT,
                instagram TEXT,
                total_harga BIGINT,
                status TEXT DEFAULT 'pending',
                catatan TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `
    });
    if (merchOrderError) console.error('Error creating merch_orders:', merchOrderError);
    else console.log('Merch Orders table checked/created.');

    // 3. Merch Order Items Table
    console.log('Creating merch_order_items table...');
    const { error: merchOrderItemError } = await supabase.rpc('exec_sql', {
        sql_query: `
            CREATE TABLE IF NOT EXISTS merch_order_items (
                id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                merch_order_id BIGINT REFERENCES merch_orders(id) ON DELETE CASCADE,
                merchandise_id BIGINT REFERENCES merchandise(id) ON DELETE SET NULL,
                item_name TEXT,
                size TEXT,
                quantity INTEGER DEFAULT 1,
                harga BIGINT
            );
        `
    });
    if (merchOrderItemError) console.error('Error creating merch_order_items:', merchOrderItemError);
    else console.log('Merch Order Items table checked/created.');

    // 4. Ensure Posts Table exists (for Otsu Post CRUD)
    console.log('Checking posts table...');
    const { error: postsError } = await supabase.rpc('exec_sql', {
        sql_query: `
            CREATE TABLE IF NOT EXISTS posts (
                id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                title TEXT NOT NULL,
                category TEXT,
                content TEXT,
                image_url TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `
    });
    if (postsError) console.error('Error creating posts:', postsError);
    else console.log('Posts table checked/created.');

    console.log('--- Finished ---');
}

fixMissingTables();
