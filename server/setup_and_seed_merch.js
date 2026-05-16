require('dotenv').config();
const supabase = require('./supabaseClient');

async function setup() {
    console.log('🚀 INITIALIZING MERCH SYSTEM AND DATA');

    // 1. Create Tables via RPC (Assuming exec_sql exists or trying anyway, or using standard insert if tables exist)
    // Actually, I'll try to insert a dummy row to check if table exists.
    const { error: checkError } = await supabase.from('merchandise').select('id').limit(1);
    
    if (checkError && checkError.code === 'PGRST116' || (checkError && checkError.message.includes('not found'))) {
         console.log('⚠️ Tables missing. You MUST run the SQL I provided in the Supabase SQL Editor first.');
         console.log('I will attempt to continue but it might fail if tables are truly missing.');
    }

    // 2. Insert Merchandise Data
    console.log('📦 Inserting 2nd Anniversary Merch...');
    const merchItems = [
        {
            nama: "Ikat Pinggang 2nd Anniversary",
            deskripsi: "Lebar 3.5cm, Varian Panjang 110cm-200cm",
            harga: 40000,
            stok: 100,
            category: "accessory",
            is_po: true,
            variants: [{name: "110cm"}, {name: "120cm"}, {name: "150cm"}, {name: "200cm"}]
        },
        {
            nama: "Slayer 2nd Anniversary",
            deskripsi: "58x58 cm, Polyester, Full Printing",
            harga: 40000,
            stok: 100,
            category: "accessory",
            is_po: true
        },
        {
            nama: "Pin 2nd Anniversary",
            deskripsi: "44mm, Doff Finish",
            harga: 5000,
            stok: 200,
            category: "accessory",
            is_po: true,
            variants: [{name: "Grey"}, {name: "Black"}]
        },
        {
            nama: "Korek Api 2nd Anniversary",
            deskripsi: "Print 1 sisi, Varian Diamond/M2000",
            harga: 15000,
            stok: 50,
            category: "accessory",
            is_po: true,
            variants: [{name: "Diamond"}, {name: "M2000"}]
        },
        {
            nama: "Gelang Akrilik 2nd Anniversary",
            deskripsi: "Tali 1mm, Akrilik Single Slide",
            harga: 15000,
            stok: 150,
            category: "accessory",
            is_po: true
        }
    ];

    const { data: insertedMerch, error: merchErr } = await supabase.from('merchandise').insert(merchItems).select();
    if (merchErr) {
        console.error('❌ Error inserting merch:', merchErr.message);
        return;
    }
    console.log('✅ Merchandise inserted.');

    // 3. Insert 20 Merch Orders
    console.log('📝 Creating 20 Test Merch Orders...');
    const statuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
    const orders = [];
    
    for (let i = 1; i <= 20; i++) {
        orders.push({
            order_number: `MNR-2ANNIV-${1000 + i}`,
            nama_lengkap: `User_Test_${i}`,
            whatsapp: `0812345678${i % 10}`,
            instagram: `@user_test_${i}`,
            total_harga: 0, // Will update after linking items
            status: statuses[i % statuses.length],
            catatan: "Test purchase for 2nd Anniversary Merch",
            created_at: new Date().toISOString()
        });
    }

    const { data: insertedOrders, error: orderErr } = await supabase.from('merch_orders').insert(orders).select();
    if (orderErr) {
        console.error('❌ Error inserting orders:', orderErr.message);
        return;
    }
    console.log('✅ 20 Orders created.');

    // 4. Link items to orders
    console.log('🔗 Linking items to orders...');
    const orderItems = [];
    insertedOrders.forEach((order, idx) => {
        const merch = insertedMerch[idx % insertedMerch.length];
        orderItems.push({
            merch_order_id: order.id,
            merchandise_id: merch.id,
            item_name: merch.nama,
            quantity: (idx % 3) + 1,
            harga: merch.harga
        });
    });

    const { error: itemErr } = await supabase.from('merch_order_items').insert(orderItems);
    if (itemErr) {
        console.error('❌ Error inserting order items:', itemErr.message);
    } else {
        console.log('✅ Items linked. Updating total prices...');
        // Update total prices for orders
        for (const order of insertedOrders) {
            const items = orderItems.filter(it => it.merch_order_id === order.id);
            const total = items.reduce((sum, it) => sum + (it.harga * it.quantity), 0);
            await supabase.from('merch_orders').update({ total_harga: total }).eq('id', order.id);
        }
    }

    console.log('✨ SETUP AND SEEDING COMPLETE');
}

setup();
