import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load .env.local first (Next.js dev), then .env
dotenv.config({ path: '.env.local' });
dotenv.config();

// MySQL connection pool configuration (TiDB Serverless)
const poolConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    // Enable named placeholders for easier query writing
    namedPlaceholders: true,
    // Timeouts for TiDB Serverless (cold starts can be slow)
    connectTimeout: 30000,
    // Recycle stale connections
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    // Required for TiDB Serverless (SSL mandatory)
    ssl: {
        rejectUnauthorized: true
    }
};

export const pool = mysql.createPool(poolConfig);

/**
 * Execute a query with parameters
 */
export const query = async (sql: string, params?: any): Promise<any> => {
    const [results] = await pool.execute(sql, params);
    return results as any;
};

/**
 * In-memory cache to reduce DB connections and improve performance
 */
const queryCache = new Map<string, { data: any; expiresAt: number }>();

/**
 * Execute a cached query - returns cached results if available and not expired.
 * Use for read-only data that doesn't change frequently (homepage, public pages).
 * @param ttlSeconds - Cache duration in seconds (default: 60s)
 */
export const cachedQuery = async (sql: string, params?: any, ttlSeconds: number = 60): Promise<any> => {
    const key = `${sql}:${JSON.stringify(params || [])}`;
    const cached = queryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }
    const results = await query(sql, params);
    queryCache.set(key, { data: results, expiresAt: Date.now() + ttlSeconds * 1000 });
    // Cleanup expired entries periodically
    if (queryCache.size > 100) {
        const now = Date.now();
        for (const [k, v] of queryCache) {
            if (v.expiresAt < now) queryCache.delete(k);
        }
    }
    return results;
};

/**
 * Invalidate cache entries matching a table name
 */
export const invalidateCache = (tableName?: string): void => {
    if (!tableName) {
        queryCache.clear();
        return;
    }
    for (const [key] of queryCache) {
        if (key.toLowerCase().includes(tableName.toLowerCase())) {
            queryCache.delete(key);
        }
    }
};

export default pool;
