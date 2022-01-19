#!/bin/bash
echo "install node packages"
cd /home/ubuntu/molink-hierarchy-live
# required packages
npm install dotenv aws-sdk ip moment-timezone
# production packages
npm install
