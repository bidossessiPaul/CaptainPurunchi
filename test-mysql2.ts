import { pool, query } from './src/lib/db';

async function test() {
  try {
    console.log('🔍 Testing mysql2 connection...');

    // Test 1: Simple query
    const result = await query('SELECT 1 AS test');
    console.log('✅ Simple query works:', result);

    // Test 2: Count hero slides
    const slides = await query('SELECT COUNT(*) as count FROM hero_slides');
    console.log('✅ Hero slides count:', slides[0].count);

    // Test 3: Get all slides
    const allSlides = await query('SELECT * FROM hero_slides LIMIT 3');
    console.log('✅ Sample slides:', allSlides);

    await pool.end();
    console.log('\n🎉 All tests passed! mysql2 works perfectly!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Connection failed!');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    await pool.end();
    process.exit(1);
  }
}

test();
