#!/bin/bash
echo "run server"
cd /home/ubuntu/molink-hierarchy-live
pm2 startOrReload /home/ubuntu/molink-hierarchy-live/infra/configs/ecosystem.config.js
