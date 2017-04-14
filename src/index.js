import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import Debug from 'debug';
import {
  UnknownChannelError,
  UnknownDirectionError,
  UnknownEdgeError,
  UnknownModeError,
} from './errors';

const debug = Debug('gpio.js');
const PATH = '/sys/class/gpio'; // '/sys/devices/virtual/gpio'

export default class GPIO extends EventEmitter {
  // static MODE_BCM = 'BCM';
  // static MODE_BOARD = 'BOARD';
  //
  // static DIR_IN = 'IN';
  // static DIR_OUT = 'OUT';
  //
  // static HIGH = true;
  // static LOW = false;
  static PIN_MAPPING = {
    v1: {
      // 1: 3.3v
      // 2: 5v
      '3':  0,
      // 4: 5v
      '5':  1,
      // 6: ground
      '7':  4,
      '8':  14,
      // 9: ground
      '10': 15,
      '11': 17,
      '12': 18,
      '13': 21,
      // 14: ground
      '15': 22,
      '16': 23,
      // 17: 3.3v
      '18': 24,
      '19': 10,
      // 20: ground
      '21': 9,
      '22': 25,
      '23': 11,
      '24': 8,
      // 25: ground
      '26': 7
    },
    v2: {
      // 1: 3.3v
      // 2: 5v
      '3':  2,
      // 4: 5v
      '5':  3,
      // 6: ground
      '7':  4,
      '8':  14,
      // 9: ground
      '10': 15,
      '11': 17,
      '12': 18,
      '13': 27,
      // 14: ground
      '15': 22,
      '16': 23,
      // 17: 3.3v
      '18': 24,
      '19': 10,
      // 20: ground
      '21': 9,
      '22': 25,
      '23': 11,
      '24': 8,
      // 25: ground
      '26': 7,

      // Model B+ pins
      // 27: ID_SD
      // 28: ID_SC
      '29': 5,
      // 30: ground
      '31': 6,
      '32': 12,
      '33': 13,
      // 34: ground
      '35': 19,
      '36': 16,
      '37': 26,
      '38': 20,
      // 39: ground
      '40': 21
    }
  };

  /**
   * The mode
   * @readonly
   * @enum {string}
   */
  static MODE = Object.freeze({
    BCM: 'bcm',
    BOARD: 'board',
  });

  /**
   * The directions
   * @readonly
   * @enum {string}
   */
  static DIR = Object.freeze({
    IN: 'in',
    OUT: 'out',
  });

  /**
   * The edges
   * @readonly
   * @enum {string}
   */
  static EDGE = Object.freeze({
    NONE: 'none',
    RISING: 'rising',
    FALLING: 'falling',
    BOTH: 'both',
  });

  /**
   * The signals
   * @readonly
   * @enum {number}
   */
  static SIGNAL = Object.freeze({
    HIGH: 1,
    LOW: 0,
  });

  /**
   * Get a file's content accessible by it's pathname
   * @static
   * @param {string} filename
   * @return {Promise<string>} a resolved Promise containing the file's content
   */
  static readFile(filename) {
    const pathname = path.join(PATH, filename);

    return new Promise((resolve, reject) => {
      fs.readFile(pathname, 'utf8', (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * Write content into a file accessible by it's pathname
   * @param {string} filename
   * @param {string|number} data
   * @return {Promise} a resolved Promise if the content has been set
   */
  static writeFile(filename, data) {
    const pathname = path.join(PATH, filename);
    console.log('----pathname: ', pathname);

    return new Promise((resolve, reject) => {
      fs.writeFile(pathname, data, {
        encoding: 'utf8',
        flag: 'w+',
      }, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  constructor() {
    super();
    this.exportedOutputPins = {};
    this.exportedInputPins = {};
    this.mode = GPIO.MODE.BOARD;
    this.pins = this._getPinMapping();
    // process.on('beforeExit', this.closeAll.bind(this));
  }

  /*
  this.EDGE_NONE    = 'none';
  this.EDGE_RISING  = 'rising';
  this.EDGE_FALLING = 'falling';
  this.EDGE_BOTH = 'both';
  */

  /**
   * 设置 GPIO 编号方式
   * @param mode {string} GPIO 编号方式，GPIO.BCM 或者 GPIO.BOARD
   */
  setMode(mode) {
    if (Object.values(GPIO.MODE).find(item => item === mode)) {
      this.mode = mode;
      return mode;
    } else {
      throw new UnknownModeError(mode);
    }
  }

  setup(channel, direction, initial = GPIO.SIGNAL.HIGH) {
    channel = this._getBcmCode(channel);
    return GPIO.writeFile('export', channel)
      .then(() => this._direction(channel, direction))
      .then(() => this._setValue(channel, initial));
  }

  output(channel, value) {
    channel = this._getBcmCode(channel);
    return this._writeChannel(channel, 'value', value);
  }

  input(channel) {}

  cleanup() {
    this.mode = undefined;
    this.pins = {};
  }

  _getPinMapping() {
    const match = fs.readFileSync('/proc/cpuinfo').toString().match(/Revision\s*:\s*[0-9a-f]*([0-9a-f]{4})/);
    const revisionNumber = parseInt(match[1], 16);
    const pinVersion = revisionNumber < 4 ? 'v1' : 'v2';
    return GPIO.PIN_MAPPING[pinVersion];
  }

  _getBcmCode(pin) {
    if (String(pin) in this.pins) {
      if (this.mode === GPIO.MODE.BCM) {
        return pin;
      } else {
        return this.pins[pin]
      }
    } else {
      throw new UnknownChannelError(channel);
    }
  }

  _direction(channel, direction) {
    return new Promise((resolve, reject) => {
      if (Object.values(GPIO.DIR).find(item => item === direction)) {
        resolve();
      } else {
        reject(new UnknownDirectionError(direction));
      }
    }).then(() => {
      return this._writeChannel(channel, 'direction', direction);
    });
  }

  /**
   * @private
   * @param {number} channel
   * @param {string} filename
   * @return {string} the path to the channel
   */
  _getChannelPath(channel, filename) {
    return path.join(`gpio${channel}`, filename);
  }

  /**
   *
   * @param {number} channel
   * @param {number} value
   * @return {Promise} resolved Promise if the channel's value has been set
   */
  _setValue(channel, value) {
    const signal = value ? GPIO.SIGNAL.HIGH : GPIO.SIGNAL.LOW;

    return this._writeChannel(channel, 'value', signal);
  }

  /**
   * Write content into a file accessible by it's channel number and a
   * resource name
   * @param {number} channel
   * @param {string} resource
   * @param {string|number} data
   * @return {Promise} a resolved Promise if the content has been set
   */
  _writeChannel(channel, resource, data) {
    return GPIO.writeFile(this._getChannelPath(channel, resource), data);
  }
};
