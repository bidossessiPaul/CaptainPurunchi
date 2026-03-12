import mysql from 'mysql2/promise';

// SOURCE: Hostinger (ancienne BD)
const SOURCE = {
  host: 'srv2120.hstgr.io',
  user: 'u942487893_captain',
  password: 'Captain@0815',
  database: 'u942487893_captain',
  port: 3306,
  ssl: { rejectUnauthorized: false },
};

// TARGET: TiDB Serverless (nouvelle BD)
const TARGET = {
  host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'n26qBekeCe793Jb.root',
  password: 'ywFMrE6atuZf42XI',
  database: 'test',
  ssl: { rejectUnauthorized: true },
};

async function migrate() {
  console.log('🔗 Connecting to SOURCE (Hostinger)...');
  const source = await mysql.createConnection(SOURCE);
  console.log('✅ SOURCE connected');

  console.log('🔗 Connecting to TARGET (TiDB)...');
  const target = await mysql.createConnection(TARGET);
  console.log('✅ TARGET connected');

  // Get all tables from source
  const [tables] = await source.execute('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  console.log(`📋 Found ${tableNames.length} tables: ${tableNames.join(', ')}`);

  // Get target tables (already created by Prisma)
  const [targetTables] = await target.execute('SHOW TABLES');
  const targetTableNames = targetTables.map(t => Object.values(t)[0]);
  console.log(`📋 Target has ${targetTableNames.length} tables`);

  // Map source table names to target table names
  // Source uses old names, target uses Prisma @@map names
  const tableMapping = {
    'hero_slides': 'hero_slides',
    'specialties': 'specialties',
    'menu_categories': 'menu_categories',
    'menu_items': 'menu_items',
    'gallery': 'gallery_images',        // renamed in Prisma
    'gallery_images': 'gallery_images',
    'rooms': 'rooms',
    'events': 'events',
    'blog_posts': 'blog_posts',
    'blog_comments': 'blog_comments',
    'contact_info': 'contact_info',
    'testimonials': 'testimonials',
    'daily_dishes': 'daily_dishes',
    'orders': 'orders',
    'table_reservations': 'table_reservations',
    'room_reservations': 'room_reservations',
    'event_reservations': 'event_reservations',
    'contact_messages': 'contact_messages',
    'users': 'users',
    'activity_logs': 'activity_logs',
    'revenues': 'revenues',
    'expenses': 'expenses',
    'cash_registers': 'cash_registers',
    'cash_operations': 'cash_operations',
    'invoices': 'invoices',
    'stock_items': 'stock_items',
    'stock_movements': 'stock_movements',
  };

  // Disable foreign key checks on TiDB
  await target.execute('SET FOREIGN_KEY_CHECKS = 0');

  for (const sourceTable of tableNames) {
    const targetTable = tableMapping[sourceTable] || sourceTable;

    // Skip if target table doesn't exist
    if (!targetTableNames.includes(targetTable)) {
      console.log(`\n⏭️  Skipping ${sourceTable} (no matching target table)`);
      continue;
    }

    console.log(`\n📦 Migrating: ${sourceTable} → ${targetTable}`);

    // Clear target table first
    await target.execute(`DELETE FROM \`${targetTable}\``);

    // Get data from source
    const [rows] = await source.execute(`SELECT * FROM \`${sourceTable}\``);
    if (rows.length === 0) {
      console.log(`  ⏭️  No data (empty table)`);
      continue;
    }

    // Get target columns to match
    const [targetCols] = await target.execute(`SHOW COLUMNS FROM \`${targetTable}\``);
    const targetColNames = targetCols.map(c => c.Field);

    // Only insert columns that exist in both source and target
    const sourceColumns = Object.keys(rows[0]);
    const commonColumns = sourceColumns.filter(c => targetColNames.includes(c));

    if (commonColumns.length === 0) {
      console.log(`  ⚠️  No matching columns`);
      continue;
    }

    const placeholders = commonColumns.map(() => '?').join(', ');
    const insertSQL = `INSERT INTO \`${targetTable}\` (${commonColumns.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`;

    let inserted = 0;
    let errors = 0;
    for (const row of rows) {
      const values = commonColumns.map(c => row[c]);
      try {
        await target.execute(insertSQL, values);
        inserted++;
      } catch (err) {
        errors++;
        if (errors <= 3) {
          console.error(`  ❌ Error:`, err.message.substring(0, 100));
        }
      }
    }
    console.log(`  ✅ ${inserted}/${rows.length} rows inserted${errors > 0 ? ` (${errors} errors)` : ''}`);
  }

  // Re-enable foreign key checks
  await target.execute('SET FOREIGN_KEY_CHECKS = 1');

  await source.end();
  await target.end();

  console.log('\n🎉 Migration Hostinger → TiDB complete!');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
