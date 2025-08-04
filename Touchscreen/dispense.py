#!/usr/bin/env python

import shelve
import time
import warnings
import sys
import RPi.GPIO as GPIO

txpin = 11
timings = shelve.open('/home/pi/Touchscreen/timings.db')
channel = sys.argv[1]

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(txpin, GPIO.OUT, initial=GPIO.LOW)

def dispense():
	for k in range(3):
		for i, (timing, level) in enumerate(timings[channel]):
			now = time.time()
			while now + timing > time.time():
				pass
			GPIO.output(txpin, level)
	timings.close()

dispense()
