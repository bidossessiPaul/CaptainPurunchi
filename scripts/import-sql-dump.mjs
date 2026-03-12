import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const TARGET = {
  host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'n26qBekeCe793Jb.root',
  password: 'ywFMrE6atuZf42XI',
  database: 'test',
  ssl: { rejectUnauthorized: true },
  multipleStatements: true,
};

async function importDump() {
  console.log('📖 Reading SQL dump...');
  const sqlPath = path.join(process.cwd(), 'scripts', 'u942487893_captain.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // Extract only INSERT statements
  const lines = sql.split('\n');
  const insertStatements = [];
  let currentInsert = '';
  let inInsert = false;

  for (const line of lines) {
    if (line.startsWith('INSERT INTO')) {
      inInsert = true;
      currentInsert = line;
    } else if (inInsert) {
      currentInsert += '\n' + line;
    }

    if (inInsert && line.trim().endsWith(';')) {
      insertStatements.push(currentInsert);
      currentInsert = '';
      inInsert = false;
    }
  }

  console.log(`📋 Found ${insertStatements.length} INSERT statements`);

  console.log('🔗 Connecting to TiDB...');
  const conn = await mysql.createConnection(TARGET);
  console.log('✅ Connected');

  // Disable foreign key checks
  await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

  // Clear all tables first
  const [tables] = await conn.execute('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  for (const table of tableNames) {
    await conn.execute(`DELETE FROM \`${table}\``);
  }
  console.log(`🧹 Cleared ${tableNames.length} tables`);

  // Execute each INSERT
  let success = 0;
  let errors = 0;
  for (const stmt of insertStatements) {
    // Extract table name for logging
    const tableMatch = stmt.match(/INSERT INTO `(\w+)`/);
    const tableName = tableMatch ? tableMatch[1] : 'unknown';

    try {
      await conn.execute(stmt);
      // Count approximate rows
      const rowCount = (stmt.match(/\),\s*\(/g) || []).length + 1;
      console.log(`  ✅ ${tableName}: ~${rowCount} rows inserted`);
      success++;
    } catch (err) {
      console.error(`  ❌ ${tableName}: ${err.message.substring(0, 120)}`);
      errors++;
    }
  }

  // Re-enable foreign key checks
  await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

  await conn.end();

  console.log(`\n🎉 Import complete! ${success} successful, ${errors} errors`);
}

importDump().catch(err => {
  console.error('❌ Import failed:', err.message);
  process.exit(1);
});
