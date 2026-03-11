import { query, pool } from './lib/db';

async function testConnection() {
    console.log('🔍 Testing Hostinger connection...');
    try {
        // Test simple query
        const result = await query('SELECT 1 + 1 AS result');
        console.log('✅ Simple query works:', result);

        // Test actual table
        const tables = await query('SHOW TABLES');
        console.log('✅ Tables found:', tables.length);
        console.table(tables);

        await pool.end();
        console.log('\n🎉 All tests passed! mysql2 works perfectly!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error);
        await pool.end();
        process.exit(1);
    }
}

testConnection();
