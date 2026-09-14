import { ErrorCodes } from './RuntimeVersionDefinition';

/**
 * A runtime version validation failure with a machine-readable error code.
 */
export class RuntimeVersionStringException extends Error {
  constructor(
    readonly code: ErrorCodes,
    message?: string
  ) {
    super(message ? `${code}. ${message}` : code);
    this.name = 'RuntimeVersionStringException';
  }
}
