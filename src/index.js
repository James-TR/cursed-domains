const ROUTES = {
  "fornoreason.au": "fornoreason",
  "www.fornoreason.au": "fornoreason",
  "fornoreason.net.au": "fornoreason",
  "www.fornoreason.net.au": "fornoreason",
  "youhacked.me": "youhacked",
  "www.youhacked.me": "youhacked",
  "realhost.name": "realhost",
  "www.realhost.name": "realhost",
  "realhostna.me": "realhost",
  "www.realhostna.me": "realhost",
};

const SITES = new Set(Object.values(ROUTES));

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isPreview = url.hostname.endsWith('.workers.dev');
    const siteParam = isPreview && SITES.has(url.searchParams.get('site'))
      ? url.searchParams.get('site')
      : null;
    const site = siteParam ?? ROUTES[url.hostname] ?? (isPreview ? 'realhost' : null);

    if (url.pathname === '/youare') {
      const ip = request.headers.get('CF-Connecting-IP') ?? '';
      return new Response(ip);
    }

    if (url.pathname === '/whoami') {
      const cf = request.cf ?? {};
      return new Response(JSON.stringify({
        ip:            request.headers.get('CF-Connecting-IP') ?? '',
        city:          cf.city,
        country:       cf.country,
        region:        cf.region,
        regionCode:    cf.regionCode,
        timezone:      cf.timezone,
        postalCode:    cf.postalCode,
        latitude:      cf.latitude,
        longitude:     cf.longitude,
        asn:           cf.asn,
        asOrganization: cf.asOrganization,
        colo:          cf.colo,
        httpProtocol:  cf.httpProtocol,
        tlsVersion:    cf.tlsVersion,
        tlsCipher:     cf.tlsCipher,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (!site) {
      return new Response("Not found", { status: 404 });
    }

    url.searchParams.delete('site');
    url.pathname = `/${site}${url.pathname}`;
    return env.ASSETS.fetch(new Request(url, request));
  },
};
