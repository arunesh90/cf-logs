# CF-Logs
[![pipeline status](https://gitlab.com/arunesh90/cf-logs/badges/master/pipeline.svg)](https://gitlab.com/arunesh90/cf-logs/pipelines)  
A simple worker and server script that will collect logs/metrics for Cloudflare

## Server
_WIP_

## Worker
To build the worker, do `LOG_BASE_URL="<url pointing to your log server>" AUTH_KEY="<your auth key>" npm run build` in `worker/`

Example: `LOG_BASE_URL="http://127.0.0.1" AUTH_KEY="test" npm run build`