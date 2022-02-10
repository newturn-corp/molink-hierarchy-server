#!/bin/bash
echo "run server"
cd /home/ubuntu/hierarchy
pm2 startOrReload /home/ubuntu/hierarchy/infra/configs/ecosystem.config.js
