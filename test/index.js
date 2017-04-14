import assert from 'assert';
import GPIO from '../src';

const gpio = new GPIO();
const channel = 11;

gpio.setMode(GPIO.MODE.BOARD);
gpio.setup(channel, GPIO.DIR.OUT);
setTimeout(() => {
  gpio.output(channel, GPIO.SIGNAL.HIGH).then(() => {
    console.log('ok');
  });
}, 1000);
