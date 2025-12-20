
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
    const envPath = path.join(__dirname, '../.env');
    let supabaseUrl = '';
    let supabaseAnonKey = '';

    console.log('Reading .env from:', envPath);

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const equalsIndex = line.indexOf('=');
            if (equalsIndex !== -1) {
                const key = line.substring(0, equalsIndex).trim();
                let value = line.substring(equalsIndex + 1).trim();

                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length - 1);
                }

                if (key === 'VITE_SUPABASE_URL') supabaseUrl = value;
                if (key === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value;
            }
        });
    } else {
        console.error("No .env file found");
        return;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Could not find VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
        console.log("Found URL:", supabaseUrl ? "Yes (starts with " + supabaseUrl.substring(0, 8) + ")" : "No");
        console.log("Found Key:", supabaseAnonKey ? "Yes" : "No");
        return;
    }

    console.log("Supabase URL:", supabaseUrl);
    // Do not print full key

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false
        }
    });

    console.log("Fetching books from Supabase...");
    // Add timeout logic? Supabase client fetch should be fast.

    try {
        const { data: books, error } = await supabase
            .from('books')
            .select('id, title, owner_id, owner_name, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching books:", error);
            return;
        }

        if (!books || books.length === 0) {
            console.log("No books found in the database.");
            return;
        }

        console.log(`Found ${books.length} books.`);

        // Group by Owner ID
        const booksByOwner = {};
        books.forEach(b => {
            const ownerId = b.owner_id || 'UNKNOWN_OWNER';
            if (!booksByOwner[ownerId]) {
                booksByOwner[ownerId] = { name: b.owner_name || 'No Name', count: 0, titles: [] };
            }
            booksByOwner[ownerId].count++;
            booksByOwner[ownerId].titles.push(b.title);
        });

        console.log("\n--- Books by Owner ---");
        Object.keys(booksByOwner).forEach(ownerId => {
            const owner = booksByOwner[ownerId];
            console.log(`\nOwner ID: ${ownerId}`);
            console.log(`Name: ${owner.name}`);
            console.log(`Books (${owner.count}): ${owner.titles.join(', ')}`);
        });

    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

main();
