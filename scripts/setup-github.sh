#!/usr/bin/env bash
# Run this once after authenticating with GitHub CLI (gh auth login)
# Usage: bash scripts/setup-github.sh

set -euo pipefail

REPO="MarjanMitev/PocketDiscount"

echo "==> Creating GitHub repo..."
gh repo create "$REPO" \
  --public \
  --description "PocketDiscount – Dutch supermarket price comparison app (NestJS + Expo)" \
  --source . \
  --remote origin \
  --push

echo "==> Enabling branch protection on main..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$REPO/branches/main/protection" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["test-backend", "test-frontend"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

echo ""
echo "✓ Repository created: https://github.com/$REPO"
echo "✓ Branch protection enabled on main"
echo ""
echo "Next steps:"
echo "  1. Go to https://dashboard.render.com and connect the GitHub repo"
echo "  2. Deploy using render.yaml (Render > New > Blueprint)"
echo "  3. After services are live, add deploy hooks to GitHub secrets:"
echo "     gh secret set RENDER_DEPLOY_HOOK_BACKEND --body '<hook-url>'"
echo "     gh secret set RENDER_DEPLOY_HOOK_FRONTEND --body '<hook-url>'"
echo "  4. Set EXPO_PUBLIC_API_URL in Render frontend service to:"
echo "     https://<your-pocketdiscount-api>.onrender.com/api"
