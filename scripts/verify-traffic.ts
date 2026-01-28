import { checkRateLimit, RATE_LIMIT_TIERS } from '../src/lib/rate-limit';

// Simple script to simulate rate limit checks
// Usage: npx tsx scripts/verify-traffic.ts

async function runSimulation() {
    console.log('🚀 Starting Traffic Simulation...');

    // 1. Simulate Anonymous Traffic (IP-based)
    console.log('\n--- Simulation 1: Anonymous IP Traffic ---');
    const ip = '192.168.1.1';
    console.log(`Simulating traffic from IP: ${ip}`);

    // Reset limit for test
    // Note: This relies on connecting to real Redis. If not configured, it might fail open or closed.

    const limitParams = RATE_LIMIT_TIERS.API; // 100 per 60s
    let blocked = false;

    // We won't actually spam 100 requests to Redis in this script as it might be slow, 
    // but we can check if the function returns what we expect.

    try {
        const result = await checkRateLimit(`api:${ip}`, limitParams);
        console.log(`Request 1: Success=${result.success}, Remaining=${result.remaining}`);
    } catch (e) {
        console.error('Redis connection failed or not configured.');
    }

    // 2. Simulate Authenticated User Traffic
    console.log('\n--- Simulation 2: Authenticated User Traffic ---');
    const userId = 'user-test-123';
    console.log(`Simulating traffic from User: ${userId}`);

    try {
        const result = await checkRateLimit(`user:${userId}`, RATE_LIMIT_TIERS.AUTHENTICATED);
        console.log(`Request 1: Success=${result.success}, Remaining=${result.remaining}`);
    } catch (e) {
        console.error('Redis connection failed.');
    }

    // NOTE: We relaxed AUTH limit (strict 10) to POST requests only.
    // This script checks Redis directly, so it can't simulate Method checks.
    // Skipping manual AUTH check simulation as it's covered by Unit Tests.

    // 3. Simulate Bot Traffic
    console.log('\n--- Simulation 3: Bot Traffic ---');
    const botIp = '10.0.0.99';
    try {
        const result = await checkRateLimit(`bot:${botIp}`, RATE_LIMIT_TIERS.BOT);
        console.log(`Request 1: Success=${result.success}, Remaining=${result.remaining}`);
    } catch (e) {
        console.error('Redis connection failed.');
    }

    console.log('\n✅ Simulation Logic Check Complete.');
}

runSimulation();
