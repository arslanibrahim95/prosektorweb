import { logger } from './logger';
import * as Sentry from '@sentry/nextjs';
import { ActionResponse, getErrorMessage, getZodErrorMessage, isPrismaUniqueConstraintError } from './action-types';
import { z } from 'zod';

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

/**
 * Creates a safe server action with logging, error handling, and Sentry integration.
 * @param actionName - Name of the action for logging
 * @param handler - The async function that performs the action
 */
export function createSafeAction<TArgs, TResult>(
    actionName: string,
    handler: (args: TArgs, context?: ActionContext) => Promise<TResult>
) {
    return async (args: TArgs): Promise<ActionResponse<TResult>> => {
        const start = Date.now();
        const requestId = crypto.randomUUID();

        // Pass essential context if available (mocking context for now, ideally derived from headers/auth)
        const context: ActionContext = { requestId };

        try {
            logger.info({
                requestId,
                action: actionName,
                // args: JSON.stringify(args) // Avoid logging potentially sensitive args in prod
            }, `Action ${actionName} started`);

            const result = await handler(args, context);

            const duration = Date.now() - start;
            logger.info({
                requestId,
                action: actionName,
                duration
            }, `Action ${actionName} completed`);

            return { success: true, data: result };

        } catch (error) {
            const duration = Date.now() - start;
            let errorMessage = getErrorMessage(error);

            // Handle specific error types
            if (error instanceof z.ZodError) {
                errorMessage = getZodErrorMessage(error);
            } else if (isPrismaUniqueConstraintError(error)) {
                errorMessage = 'Bu kayıt zaten mevcut (Tekrarlanan veri).';
            } else if (error instanceof ActionError) {
                errorMessage = error.message;
            } else {
                // For unknown errors, log full details but return generic message to user
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

                if (process.env.NODE_ENV === 'production') {
                    errorMessage = 'İşlem sırasında beklenmedik bir hata oluştu.';
                }
            }

            return { success: false, error: errorMessage };
        }
    };
}
