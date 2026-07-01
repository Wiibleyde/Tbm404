#!/bin/sh
set -e

# App and collector may both push the schema on first boot; retry to survive the race.
n=0
until bunx prisma db push --accept-data-loss; do
  n=$((n + 1))
  if [ "$n" -ge 5 ]; then
    echo "[entrypoint] schema push failed after $n attempts" >&2
    exit 1
  fi
  echo "[entrypoint] schema push retry $n..."
  sleep 3
done

echo "[entrypoint] starting Next.js..."
exec bun run start
