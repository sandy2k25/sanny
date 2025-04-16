#!/bin/bash
cd /home/sandy2k25/embed-player-app
git pull origin main
npm install
pm2 restart embed-player-app
