/**
 * Web Project Pipeline
 *
 * Type-safe pipeline for web project creation with:
 * - Defined input/output schemas for each stage
 * - Validation at stage boundaries
 * - Expectation/prediction for next stage
 * - Event system for progress tracking
 * - Support for "vibe coding" (manual/interactive) workflow
 */

export * from "./types";
export * from "./runner";
export * from "./validator";
export * from "./expectation";
