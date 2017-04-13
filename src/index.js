import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import Debug from 'debug';

const debug = Debug('gpio.js');
const PATH = '/sys/class/gpio'; // '/sys/devices/virtual/gpio'

export default class GPIO extends EventEmitter {
  constructor() {
    super();
    // process.on('beforeExit', this.closeAll.bind(this));
  }

  static BCM = 'BCM';
  static BOARD = 'BOARD';

  static IN = 'IN';
  static OUT = 'OUT';

  static HIGH = true;
  static LOW = false;

  /**
   * @readonly
   * @type {Object.<int, Object>}
   */
  Gpio.mappings = Object.freeze({
    0: {
      3: 2,
      5: 3,
      7: 4,
      8: 14,
      10: 15,
      11: 17,
      12: 18,
      13: 27,
      15: 22,
      16: 23,
      18: 24,
      19: 10,
      21: 9,
      22: 25,
      23: 11,
      24: 8,
      26: 7,
    },
    1: {
      3: 0,
      5: 1,
      13: 21,
    },
    2: {
      3: 2,
      5: 3,
      13: 27,
    },
    3: {
      29: 5,
      31: 6,
      32: 12,
      33: 13,
      35: 19,
      36: 16,
      37: 26,
      38: 20,
      40: 21,
    },
  });

  static getMapping(revision) {
    return Object.keys(GPIO.mappings).filter((key) => {
      return key <= revision || GPIO.revision;
    }).reduce((mapping, key) => {
      return Object.assign(mapping, GPIO.mappings[key]);
    }, {});
  };

  say(a) {
    return a;
  }

  /**
   * 设置 GPIO 编号方式
   * @param mode {string} GPIO 编号方式，GPIO.BCM 或者 GPIO.BOARD
   */
  setmode(mode) {

  }

  setup(channel, direction) {}

  output(channel, value) {}

  input(channel)



  cleanup()
};
