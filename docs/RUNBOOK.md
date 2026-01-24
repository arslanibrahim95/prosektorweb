# ProSektorWeb Operational Runbook

This document provides procedures for handling common operational issues and maintenance tasks.

## 🚨 Incident Response

### 1. Database Connection Failures
- **Symptom**: 500 errors in logs, `PrismaClientInitializationError`.
- **Check**: Verify MariaDB status (`docker compose ps` locally or check cloud provider).
- **Resolution**:
  - Locally: `docker compose restart db`.
  - Production: Verify `DATABASE_URL` secrets in Vercel.

### 2. Rate Limit Blocking (False Positives)
- **Symptom**: 429 errors for legitimate users.
- **Check**: check Upstash Redis dashboard.
- **Resolution**: Adjust `safeApi` limits in the relevant route config.

### 3. Authentication Issues
- **Symptom**: Users cannot login despite correct credentials.
- **Check**: Verify `NEXTAUTH_SECRET` and `DATABASE_URL`.
- **Resolution**: Ensure `ENCRYPTION_KEY` matches between environments if using encrypted storage.

## 🛠 Maintenance Tasks

### Deploying Schema Changes
1. Local: `npx prisma migrate dev`.
2. Staging/Prod: CI/CD will handle via `prisma db push` or manual migration review.

### Cleaning Environment
If dependencies or build artifacts are corrupted:
```bash
./scripts/clean.sh
./scripts/setup.sh
```

## 📈 Monitoring
- **Sentry**: [Sentry Dashboard](https://sentry.io/) (Check for `requestId` in additional data).
- **Upstash**: Monitor Redis usage for rate limiting and idempotency.
