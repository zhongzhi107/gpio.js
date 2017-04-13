import assert from 'assert';
import GPIO from '../src';

const gpio = new GPIO();

describe('GPIO', () => {
  describe('#say()', () => {
    it('返回值正常', () => {
      assert.equal('abc', gpio.say('abc'));
    });
  });
});
