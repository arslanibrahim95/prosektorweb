#!/bin/bash

# Antigravity Bisect Automation Script
# Usage: git bisect run ./scripts/bisect-run.sh
# 
# Exit 0 = GOOD (Current commit works)
# Exit 1 = BAD  (Current commit is broken)
# Exit 125 = SKIP (Cannot test this commit)

echo "🤖 Bisect: Running verifications..."

# 1. Install deps if needed (optional, slows it down)
# npm ci --silent > /dev/null

# 2. Build check (if compile fails, we skip)
npm run build 2> /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️ Build failed, skipping..."
    exit 125
fi

# 3. The actual test (Change this to your specific failing test)
# Example: npm run test:unit src/lib/security.test.ts
npm run test:unit
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ Test PASSED. This commit is GOOD."
    exit 0
else
    echo "❌ Test FAILED. This commit is BAD."
    exit 1
fi
