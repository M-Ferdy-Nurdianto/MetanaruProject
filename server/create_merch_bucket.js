require('dotenv').config();
const supabase = require('./supabaseClient');

async function createBucket() {
    console.log('🚀 ATTEMPTING TO CREATE MERCHANDISE STORAGE BUCKET');

    const { data, error } = await supabase.storage.createBucket('merchandise', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️ Bucket "merchandise" already exists.');
        } else {
            console.error('❌ Error creating bucket:', error.message);
            console.log('⚠️ Please ensure your Service Role Key has permission to manage storage, or create the bucket "merchandise" manually in the Supabase Dashboard.');
        }
    } else {
        console.log('✅ Bucket "merchandise" created successfully!');
    }
}

createBucket();
