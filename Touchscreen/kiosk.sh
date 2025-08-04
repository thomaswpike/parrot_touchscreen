#!/bin/bash
xset s noblank
xset s off
xset -dpms
node /home/pi/Touchscreen/server.js &
unclutter -idle 0 -root & 
chromium-browser --display=:0.0 --noerrordialogs --disable-infobars --kiosk --incognito --window-position=0,0 /home/pi/Touchscreen/local.html
