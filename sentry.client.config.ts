import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
        Sentry.replayIntegration(),
    ],
    // Session Replay
    replaysSessionSampleRate: Number(process.env.SENTRY_REPLAY_RATE) || 0.0,
    replaysOnErrorSampleRate: 1.0,
});
