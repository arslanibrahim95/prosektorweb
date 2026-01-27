# Antigravity Security Baseline 🛡️

**Golden Rule:** Secret != Code. If it looks like a key, it must NEVER enter the repo.

## 1. Prevention (The Wall)

### A. Hardened `.gitignore`
We explicitly ignore credential files and IDE configs.
See `.gitignore` for the live list (`*.pem`, `*.key`, `.env`, etc.).

### B. Pre-Commit Secret Scanner
We use a `pre-commit` hook that scans staged files for regex patterns like:
- AWS Keys (`AKIA...`)
- Private Keys (`-----BEGIN RSA PRIVATE KEY-----`)
- Slack Tokens (`xoxb-...`)

**Action:** If the hook blocks you, **DO NOT bypass it.** Check your code.

## 2. Incident Response (Panic Button)

If a secret is committed and pushed (even for 1 second), assume it is compromised.

### Step A: Revoke Immediately (Seconds matter)
1.  **AWS:** Deactivate and Delete the Access Key. Generate new one.
2.  **DB/API:** Rotate the password/token immediately.
3.  **Impact:** Only *after* rotating, worry about code cleanup.

### Step B: Clean History (The Surgery)
Creating a revert commit is INSUFFICIENT (the key remains in history).

**Option 1: git filter-repo (Recommended)**
```bash
# 1. Clone fresh mirror
git clone --mirror <REPO_URL> repo-cleanup.git
cd repo-cleanup.git

# 2. Nuke the file from history
git filter-repo --path .env --invert-paths

# 3. Force push (Rewrite History)
git push --force --mirror
```

**Option 2: BFG Repo-Cleaner**
```bash
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force --mirror
```

### Step C: Team Reset
Tell everyone: *"History mismatch. Delete your local repo and re-clone."*

## 3. Environment Hygiene
-   **Local:** Use `.env.local` (ignored).
-   **Example:** Maintain `.env.example` with blank keys so devs know what they need.
-   **CI/CD:** Use GitHub Secrets / Vercel Env Vars. Never commit config files.

## 4. Manual Verification
Run this to see if you have any lingering ignored files tracked by mistake:
```bash
git ls-files -i --exclude-standard
```
(Should return nothing)
