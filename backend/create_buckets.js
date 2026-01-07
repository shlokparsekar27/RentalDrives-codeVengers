
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBuckets() {
    console.log('Initializing Storage Buckets...');

    const buckets = ['host-documents', 'tourist-licenses'];

    for (const bucket of buckets) {
        console.log(`Checking bucket: ${bucket}...`);

        // Try to get the bucket
        const { data, error } = await supabase.storage.getBucket(bucket);

        if (error && error.message.includes('not found')) {
            console.log(`   - Bucket '${bucket}' not found. Creating...`);
            const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
            });

            if (createError) {
                console.error(`   - ❌ Failed to create '${bucket}':`, createError.message);
            } else {
                console.log(`   - ✅ Successfully created '${bucket}' (Public)`);
            }
        } else if (data) {
            console.log(`   - ℹ️ Bucket '${bucket}' already exists.`);

            // Update to ensure it is public
            if (!data.public) {
                console.log(`   - Updating '${bucket}' to be PUBLIC...`);
                const { error: updateError } = await supabase.storage.updateBucket(bucket, {
                    public: true
                });
                if (updateError) console.error(`   - ❌ Failed to update '${bucket}':`, updateError.message);
                else console.log(`   - ✅ Updated '${bucket}' to public.`);
            }
        } else {
            console.error(`   - ❌ Error checking bucket '${bucket}':`, error?.message);
        }
    }
}

createBuckets();
