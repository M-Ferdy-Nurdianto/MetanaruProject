require('dotenv').config();
const supabase = require('./supabaseClient');

async function seedOrders() {
    console.log('🚀 SEEDING TEST ORDERS');

    // 1. Get an active event
    const { data: events, error: eventErr } = await supabase.from('events').select('id, name').limit(1);
    if (eventErr || !events || events.length === 0) {
        console.error('❌ No events found. Please create an event first.');
        return;
    }
    const eventId = events[0].id;
    console.log(`📍 Using Event: ${events[0].name} (ID: ${eventId})`);

    // 2. Create 10 OTS Orders
    console.log('📝 Creating 10 OTS Orders...');
    const otsOrders = [];
    for (let i = 1; i <= 10; i++) {
        otsOrders.push({
            nickname: `OTS_Test_Fan_${i}`,
            contact: '08123456789',
            event_id: eventId,
            member_id: 'Test Member x1',
            items: [{ member_id: 'Test Member', qty: 1, cheki_type: 'solo' }],
            cheki_type: 'solo',
            qty: 1,
            total_price: 30000,
            mode: 'ots',
            status: 'paid',
            payment_method: 'cash'
        });
    }
    const { error: otsErr } = await supabase.from('orders').insert(otsOrders);
    if (otsErr) console.error('❌ OTS Insert Error:', otsErr.message);
    else console.log('✅ 10 OTS Orders created.');

    // 3. Create 10 PO Orders
    console.log('📝 Creating 10 PO Orders...');
    const poOrders = [];
    for (let i = 1; i <= 10; i++) {
        poOrders.push({
            nickname: `PO_Test_Fan_${i}`,
            contact: '08123456789',
            event_id: eventId,
            member_id: 'Test Member x2',
            items: [{ member_id: 'Test Member', qty: 2, cheki_type: 'solo' }],
            cheki_type: 'solo',
            qty: 2,
            total_price: 60000,
            mode: 'po',
            status: 'pending',
            payment_method: 'transfer',
            note: 'Test PO Note ' + i
        });
    }
    const { error: poErr } = await supabase.from('orders').insert(poOrders);
    if (poErr) console.error('❌ PO Insert Error:', poErr.message);
    else console.log('✅ 10 PO Orders created.');

    // 4. Try Merch Orders (Checking if table exists first)
    console.log('🔍 Checking for merchandise tables...');
    const { error: merchCheck } = await supabase.from('merchandise').select('id').limit(1);
    if (merchCheck) {
        console.log('⚠️ Merchandise table does not exist or is inaccessible. Skipping merch orders.');
    } else {
        console.log('📝 Creating 5 Merch Orders...');
        // First get a merch item
        const { data: merchItems } = await supabase.from('merchandise').select('id, nama, harga').limit(1);
        if (merchItems && merchItems.length > 0) {
            const merch = merchItems[0];
            const merchOrders = [];
            for (let i = 1; i <= 5; i++) {
                merchOrders.push({
                    order_number: `MNR-MRCH-TEST-${i}-${Date.now().toString().slice(-4)}`,
                    nama_lengkap: `Merch_Test_Fan_${i}`,
                    whatsapp: '08123456789',
                    total_harga: merch.harga,
                    status: 'pending',
                    catatan: 'Seed test'
                });
            }
            const { data: insertedMerch, error: mErr } = await supabase.from('merch_orders').insert(merchOrders).select();
            if (mErr) console.error('❌ Merch Order Insert Error:', mErr.message);
            else {
                console.log('✅ 5 Merch Orders created.');
                const items = insertedMerch.map(o => ({
                    merch_order_id: o.id,
                    merchandise_id: merch.id,
                    item_name: merch.nama,
                    quantity: 1,
                    harga: merch.harga
                }));
                await supabase.from('merch_order_items').insert(items);
                console.log('✅ Merch Items linked.');
            }
        }
    }

    console.log('✨ SEEDING COMPLETE');
}

seedOrders();
