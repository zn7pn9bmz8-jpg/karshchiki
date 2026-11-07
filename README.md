# SkyRush — Telegram Mini App prototype

A virtual-points-only arcade crash-flight demo. No deposits, wagers, cash-out,
purchasable credits, or redeemable prizes.

## Files
- `bot.py` — Telegram bot with `/start` and Mini App launch button.
- `static/` — browser game UI and client-side demo mechanics.

## Run locally
1. Python 3.10+
2. `python -m venv .venv`
3. Activate the environment.
4. `pip install -r requirements.txt`
5. Create a bot with Telegram's official BotFather and set `BOT_TOKEN`.
6. Host the `static` folder on an HTTPS web host and set `WEBAPP_URL` to its URL.
7. Run `python bot.py`.

Example environment variables:
- Linux/macOS: `export BOT_TOKEN="..."` and `export WEBAPP_URL="https://your-domain.example"`
- PowerShell: `$env:BOT_TOKEN="..."`; `$env:WEBAPP_URL="https://your-domain.example"`

## Prototype limitations
This first version stores the demo balance and history in browser memory only.
Refreshing the page resets them. The random round outcome is generated client-side
and is not suitable for competitive or prize-bearing play. A production version
would need a server-authoritative game state, Telegram initData validation,
rate limiting, persistent storage, privacy notice, and security review.
