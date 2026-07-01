#!/bin/sh
set -e

# Apply pending migrations. Safe if app + collector run it concurrently (Prisma
# takes an advisory lock); retry only guards against the DB not being ready yet.
n=0
until bunx prisma migrate deploy; do
  n=$((n + 1))
  if [ "$n" -ge 5 ]; then
    echo "[entrypoint] migrate deploy failed after $n attempts" >&2
    exit 1
  fi
  echo "[entrypoint] migrate deploy retry $n..."
  sleep 3
done

echo "[entrypoint] starting Next.js..."
exec bun run start
