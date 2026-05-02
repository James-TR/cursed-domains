# cursed-domains

A collection of websites for domains that exist for no reason.

## Sites

| Domain | Purpose |
|--------|---------|
| [realhost.name](https://realhost.name) / [realhostna.me](https://realhostna.me) | Tells you your real hostname. It is not lying. |
| [fornoreason.au](https://fornoreason.au) / [fornoreason.net.au](https://fornoreason.net.au) | Loading a reason. Please wait. |
| [youhacked.me](https://youhacked.me) | You hacked me. Congratulations. |

## Stack

Cloudflare Worker routing static assets from `public/` to the appropriate site based on hostname. That's it. That's the stack.

## Development

```
npm install
npx wrangler dev
```

The workers.dev deployment is at [cursed-domains.jamestk-cloudflare.workers.dev](https://cursed-domains.jamestk-cloudflare.workers.dev).

Branches and commits also get preview deployments:
- Branch: `https://feature-branch-name-cursed-domains.jamestk-cloudflare.workers.dev/`
- Commit: `https://{commit-hash}-cursed-domains.jamestk-cloudflare.workers.dev/`

Preview a specific site on any workers.dev URL with `?site=fornoreason`, `?site=youhacked`, or `?site=realhost`.
