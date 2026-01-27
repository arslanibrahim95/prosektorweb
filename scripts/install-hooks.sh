#!/bin/bash
# Antigravity Git Hook Installer
# Run this to enforce the workflow: ./scripts/install-hooks.sh

echo "📦 Installing Husky..."
npm install husky --save-dev

echo "🔗 Initializing Husky..."
npx husky install

echo "🔒 Creating pre-commit hook..."
# pre-commit: Lint + Format (via lint-staged or direct)
cat <<EOT > .husky/pre-commit
#!/bin/sh
. "\$(dirname "\$0")/_/husky.sh"

echo "🛡️  Antigravity Guard: Checking Code Quality..."
# Run linting on staged files if lint-staged exists, else run full lint
if npx --no-install lint-staged --help > /dev/null 2>&1; then
  npx lint-staged
else
  npm run lint
fi
EOT
chmod +x .husky/pre-commit

echo "🔒 Creating pre-push hook..."
# pre-push: Fast Unit Tests
cat <<EOT > .husky/pre-push
#!/bin/sh
. "\$(dirname "\$0")/_/husky.sh"

echo "🛡️  Antigravity Guard: Running Unit Tests..."
npm run test:unit
EOT
chmod +x .husky/pre-push

echo "🔒 Creating commit-msg hook..."
# commit-msg: Enforce Conventional Commits
cat <<EOT > .husky/commit-msg
#!/bin/sh
. "\$(dirname "\$0")/_/husky.sh"

echo "🛡️  Antigravity Guard: Checking Commit Message..."
# Regex for Conventional Commits
# Types: feat, fix, docs, style, refactor, perf, test, chore, ci, revert
if ! grep -qE "^(feat|fix|docs|style|refactor|perf|test|chore|ci|revert)(\(.+\))?: .{1,50}" "\$1"; then
  echo "❌ Error: Invalid Commit Message Format."
  echo "Expected: <type>(<scope>): <summary>"
  echo "Example: feat(auth): add login page"
  echo "Allowed types: feat, fix, docs, style, refactor, perf, test, chore, ci, revert"
  exit 1
fi
EOT
chmod +x .husky/commit-msg

echo "✅ Git Hooks Installed Successfully!"
