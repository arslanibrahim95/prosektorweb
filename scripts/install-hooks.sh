#!/bin/bash
# Antigravity Git Hook Installer
# Run this to enforce the workflow: ./scripts/install-hooks.sh

echo "📦 Installing Husky..."
npm install husky --save-dev

echo "🔗 Initializing Husky..."
npx husky install

echo "🔒 Creating pre-commit hook (Secret Scan + Lint)..."
cat <<EOT > .husky/pre-commit
#!/bin/bash
. "\$(dirname "\$0")/_/husky.sh"

echo "🛡️  Antigravity Security: Scanning for potential secrets..."
# Simple regex scan for AWS keys, Private Keys, Slack tokens
# Only scans staged files (git diff --cached)
# Exit 1 if match found
if git diff --cached -U0 | grep -Eiq '(AKIA[0-9A-Z]{16}|aws_secret_access_key|BEGIN (RSA|EC|OPENSSH) PRIVATE KEY|xox[baprs]-[0-9A-Za-z-]{10,}|-----BEGIN PRIVATE KEY-----)'; then
  echo "❌ SECURITY ALERT: Potential secret detected in staged files!"
  echo "   Matches pattern for AWS Key, Private Key, or Auth Token."
  echo "   Action: Unstage the file, remove the secret, and retry."
  exit 1
fi

echo "🛡️  Antigravity Quality: Checking Code..."
if npx --no-install lint-staged --help > /dev/null 2>&1; then
  npx lint-staged
else
  npm run lint
fi
EOT
chmod +x .husky/pre-commit

echo "🔒 Creating pre-push hook..."
cat <<EOT > .husky/pre-push
#!/bin/sh
. "\$(dirname "\$0")/_/husky.sh"

echo "🛡️  Antigravity Guard: Running Unit Tests..."
npm run test:unit
EOT
chmod +x .husky/pre-push

echo "🔒 Creating commit-msg hook..."
cat <<EOT > .husky/commit-msg
#!/bin/sh
. "\$(dirname "\$0")/_/husky.sh"

echo "🛡️  Antigravity Guard: Checking Commit Message..."
# Regex for Conventional Commits
if ! grep -qE "^(feat|fix|docs|style|refactor|perf|test|chore|ci|revert)(\(.+\))?: .{1,50}" "\$1"; then
  echo "❌ Error: Invalid Commit Message Format."
  echo "Expected: <type>(<scope>): <summary>"
  exit 1
fi
EOT
chmod +x .husky/commit-msg

echo "✅ Git Hooks Installed & Hardened!"
