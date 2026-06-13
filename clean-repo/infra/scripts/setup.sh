#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# MARKETER-PRO — LOCAL DEVELOPMENT SETUP SCRIPT
# Run once after cloning the repo on a new machine.
# Works on macOS, Linux, and WSL (Windows Subsystem for Linux).
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

echo ""
echo "⬡ MARKETER-PRO OFFICE EDITION — Setup"
echo "─────────────────────────────────────"
echo ""

# ── Check prerequisites ───────────────────────────────────────────────────────
command_exists() { command -v "$1" &>/dev/null; }

if ! command_exists node; then
  echo "✗ Node.js not found. Install from https://nodejs.org (v20+ required)"
  exit 1
fi

NODE_VERSION=$(node --version | cut -c2- | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "✗ Node.js v20+ required. Current: $(node --version)"
  exit 1
fi

if ! command_exists pnpm; then
  echo "→ Installing pnpm..."
  npm install -g pnpm
fi

echo "✓ Node.js $(node --version)"
echo "✓ pnpm $(pnpm --version)"

# ── Install dependencies ──────────────────────────────────────────────────────
echo ""
echo "→ Installing dependencies..."
pnpm install

# ── Copy env files ────────────────────────────────────────────────────────────
echo ""
echo "→ Setting up environment files..."

if [ ! -f "apps/backend/.env" ]; then
  cp apps/backend/env.example apps/backend/.env
  echo "  Created apps/backend/.env — fill in your credentials"
fi

if [ ! -f "apps/frontend/.env.local" ]; then
  cp apps/frontend/.env.example apps/frontend/.env.local
  echo "  Created apps/frontend/.env.local — fill in your credentials"
fi

if [ ! -f "apps/mobile-client/.env" ]; then
  if [ -f "apps/mobile-client/.env.example" ]; then
    cp apps/mobile-client/.env.example apps/mobile-client/.env
    echo "  Created apps/mobile-client/.env — fill in your credentials"
  fi
fi

# ── Prisma generate ───────────────────────────────────────────────────────────
echo ""
echo "→ Generating Prisma client..."
cd apps/backend
pnpm db:generate
cd ../..

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "─────────────────────────────────────"
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Fill in credentials in apps/backend/.env"
echo "  2. Run migrate.sql in your Supabase SQL editor"
echo "     → https://supabase.com/dashboard/project/qormgykublfsmgacbpyx/sql"
echo "  3. Start development servers:"
echo "     pnpm dev"
echo ""
echo "Dev URLs:"
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:5173"
echo ""
