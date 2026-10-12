#!/bin/sh
set -e
git pull --ff-only
docker compose up -d --build
docker image prune -f
