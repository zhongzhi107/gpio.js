/**
 * @class UnknownEdgeError
 * @extends Error
 */
export default class UnknownEdgeError extends Error {
  /**
   * @constructor
   * @param {string} edge
   */
  constructor(edge) {
    super(`Unknown edge: ${edge}`);
  }
}
