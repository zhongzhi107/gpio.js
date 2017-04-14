/**
 * @class UnknownModeError
 * @extends Error
 */
export default class UnknownModeError extends Error {
  /**
   * @constructor
   * @param {string} mode
   */
  constructor(mode) {
    super(`Unknown mode: ${mode}`);
  }
}
