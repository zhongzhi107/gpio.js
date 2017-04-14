/**
 * @class UnknownDirectionError
 * @extends Error
 */
export default class UnknownDirectionError extends Error {
  /**
   * @constructor
   * @param {string} direction
   */
  constructor(direction) {
    super(`Unknown direction: ${direction}`);
  }
}
