import { query } from "../src/lib/db.js";

/**
 * Migration script to analyze and prepare Order.totalAmount conversion from STRING to INT
 *
 * This script:
 * 1. Fetches all existing orders
 * 2. Parses totalAmount string values
 * 3. Identifies any problematic values
 * 4. Shows preview of conversion
 */

async function analyzeOrders() {
  console.log("🔍 Starting Order amount analysis...\n");

  try {
    // Fetch all orders
    const orders = await query("SELECT id, totalAmount, customerName, orderDate FROM orders ORDER BY createdAt DESC") as any[];

    console.log(`📊 Total orders found: ${orders.length}\n`);

    if (orders.length === 0) {
      console.log("✅ No orders in database. Safe to migrate schema.\n");
      return;
    }

    let validCount = 0;
    let invalidCount = 0;
    const problematicOrders: any[] = [];

    console.log("🔄 Analyzing each order...\n");

    for (const order of orders) {
      // Parse string amount - remove all non-digit characters
      const cleanedAmount = order.totalAmount.replace(/\D/g, "");
      const numericAmount = parseInt(cleanedAmount, 10);

      if (isNaN(numericAmount) || cleanedAmount === "") {
        // Invalid amount
        invalidCount++;
        problematicOrders.push({
          id: order.id,
          customerName: order.customerName,
          orderDate: order.orderDate,
          originalAmount: order.totalAmount,
          parsedAmount: numericAmount,
        });

        console.log(`❌ INVALID: Order ${order.id.substring(0, 8)}`);
        console.log(`   Customer: ${order.customerName}`);
        console.log(`   Original: "${order.totalAmount}" → Parsed: ${numericAmount || 0}`);
        console.log();
      } else {
        validCount++;

        // Show first 5 valid conversions as examples
        if (validCount <= 5) {
          console.log(`✅ VALID: Order ${order.id.substring(0, 8)}`);
          console.log(`   Customer: ${order.customerName}`);
          console.log(`   Original: "${order.totalAmount}" → Parsed: ${numericAmount}`);
          console.log();
        }
      }
    }

    // Summary
    console.log("=" .repeat(60));
    console.log("📈 MIGRATION SUMMARY");
    console.log("=" .repeat(60));
    console.log(`✅ Valid orders: ${validCount}`);
    console.log(`❌ Invalid orders: ${invalidCount}`);
    console.log();

    if (problematicOrders.length > 0) {
      console.log("⚠️  PROBLEMATIC ORDERS THAT NEED ATTENTION:");
      console.log("=" .repeat(60));
      problematicOrders.forEach(order => {
        console.log(`ID: ${order.id}`);
        console.log(`Customer: ${order.customerName}`);
        console.log(`Date: ${order.orderDate}`);
        console.log(`Original Amount: "${order.originalAmount}"`);
        console.log(`Parsed Amount: ${order.parsedAmount || 0} (will be set to 0)`);
        console.log("-" .repeat(60));
      });
      console.log();
      console.log("⚠️  These orders have invalid amount formats.");
      console.log("⚠️  They will be set to 0 during migration.");
      console.log("⚠️  Please review and fix manually if needed.\n");
    } else {
      console.log("✅ All orders have valid amount formats!");
      console.log("✅ Safe to proceed with schema migration.\n");
    }

    console.log("=" .repeat(60));
    console.log("NEXT STEPS:");
    console.log("=" .repeat(60));
    console.log("1. Review the analysis above");
    console.log("2. If problematic orders exist, fix them manually in DB");
    console.log("3. Modify prisma/schema.prisma:");
    console.log("   - Change: totalAmount String @db.VarChar(100)");
    console.log("   - To:     totalAmount Int @default(0)");
    console.log("4. Run: npx prisma migrate dev --name fix_order_amount_type");
    console.log("5. Run: ts-node scripts/update-order-amounts.ts (converts data)");
    console.log("=" .repeat(60));

  } catch (error) {
    console.error("❌ Error during analysis:", error);
    throw error;
  }
}

// Run the analysis
analyzeOrders()
  .then(() => {
    console.log("\n✅ Analysis complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Analysis failed:", error);
    process.exit(1);
  });
