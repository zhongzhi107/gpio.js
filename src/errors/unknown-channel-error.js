/**
 * @class UnknownChannelError
 * @extends Error
 */
export default class UnknownChannelError extends Error {
  /**
   * @constructor
   * @param {string|number} channel
   */
  constructor(channel) {
    super(`Unknown channel: ${channel}`);
  }
}
