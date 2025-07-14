#!/bin/bash

# Complete Photo Cleanup Script
# This script removes all photos from both the database and Azure Blob Storage

echo "🧹 CBX Rentals - Complete Photo Cleanup"
echo "======================================"
echo ""
echo "⚠️  WARNING: This will permanently DELETE:"
echo "   - All photo records from the Supabase database"
echo "   - All photo files from Azure Blob Storage"
echo ""
echo "This action cannot be undone!"
echo ""

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Supabase environment variables not set."
    echo "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
    exit 1
fi

read -p "Type 'CLEANUP' to continue: " confirmation

if [ "$confirmation" != "CLEANUP" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""
echo "Step 1: Cleaning up database records"
echo "===================================="

# Create a Node.js script to delete from Supabase
cat > /tmp/cleanup-photos-db.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupPhotos() {
    try {
        // First, get count of photos
        const { count, error: countError } = await supabase
            .from('photos')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('Error counting photos:', countError);
            return;
        }

        console.log(`Found ${count || 0} photo(s) in the database.`);

        if (count > 0) {
            // Delete all photos
            const { error: deleteError } = await supabase
                .from('photos')
                .delete()
                .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (deleteError) {
                console.error('Error deleting photos:', deleteError);
                return;
            }

            console.log('✅ All photo records deleted from database.');
        } else {
            console.log('No photos to delete from database.');
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

cleanupPhotos();
EOF

# Run the Node.js script
cd "$(dirname "$0")/.." # Go to project root
node /tmp/cleanup-photos-db.js
rm /tmp/cleanup-photos-db.js

echo ""
echo "Step 2: Cleaning up Azure Blob Storage"
echo "====================================="

# Run the Azure cleanup script
./scripts/cleanup-azure-photos.sh

echo ""
echo "🎉 Photo cleanup complete!"
echo ""
echo "Summary:"
echo "- Database photo records: Deleted"
echo "- Azure blob storage: Cleaned"
echo ""
echo "The photo feature is now ready for fresh content!"