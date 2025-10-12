/**
 * Recursively retrieves the root cause of an error by traversing through its `cause` property.
 *
 * @param err - The error object to analyze. It can be of any type.
 * @returns The root cause of the error, or the original error if no further cause is found.
 */
function getRootCause(err: unknown): unknown {
  if (err && typeof err === 'object' && 'cause' in err) {
    return getRootCause((err as { cause: unknown }).cause);
  }
  return err;
}

export class ContinueError extends Error {
  reason: ContinueErrorReason;

  constructor(reason: ContinueErrorReason, message?: string) {
    super(message);
    this.reason = reason;
    this.name = "ContinueError";
  }
}

export enum ContinueErrorReason {
  // General File
  FileIsSecurityConcern = "file_is_security_concern",
}
