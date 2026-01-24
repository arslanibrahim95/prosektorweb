import { logger } from './logger';
import * as Sentry from '@sentry/nextjs';

export class ActionError extends Error {
    constructor(public code: string, message: string) {
        super(message);
        this.name = 'ActionError';
    }
}

type ActionContext = {
    requestId?: string;
    userId?: string;
    [key: string]: any;
};

export function createSafeAction<TArgs, TResult>(
    actionName: string,
    handler: (args: TArgs, context?: ActionContext) => Promise<TResult>
) {
    return async (args: TArgs): Promise<{ data?: TResult; error?: string }> => {
        const start = Date.now();
        const requestId = crypto.randomUUID();

        // Pass essential context if available (mocking context for now, ideally derived from headers/auth)
        const context: ActionContext = { requestId };

        try {
            logger.info({
                requestId,
                action: actionName,
                args: JSON.stringify(args) // Be careful with PII here in prod
            }, `Action ${actionName} started`);

            const result = await handler(args, context);

            const duration = Date.now() - start;
            logger.info({
                requestId,
                action: actionName,
                duration
            }, `Action ${actionName} completed`);

            return { data: result };

        } catch (error) {
            const duration = Date.now() - start;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            logger.error({
                requestId,
                action: actionName,
                error: errorMessage,
                duration,
                stack: error instanceof Error ? error.stack : undefined
            }, `Action ${actionName} failed`);

            // Report to Sentry
            Sentry.withScope((scope) => {
                scope.setTag('action', actionName);
                scope.setTag('requestId', requestId);
                scope.setExtra('args', args);
                Sentry.captureException(error);
            });

            if (error instanceof ActionError) {
                return { error: error.message };
            }

            return { error: 'İşlem sırasında beklenmedik bir hata oluştu.' };
        }
    };
}
