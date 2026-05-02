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

    if (isPreview) {
      // ?site=X redirect to path-based URL so sub-resources inherit routing
      const siteParam = url.searchParams.get('site');
      if (siteParam && SITES.has(siteParam)) {
        return Response.redirect(`${url.origin}/${siteParam}/`, 302);
      }

      // Path-prefix routing: known sites and preview index
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0 && (SITES.has(segments[0]) || segments[0] === 'preview')) {
        const site = segments[0];
        const innerPath = segments.length > 1 ? '/' + segments.slice(1).join('/') : '/';
        url.pathname = `/${site}${innerPath}`;
        return env.ASSETS.fetch(new Request(url, request));
      }

      // Root -> preview index
      if (url.pathname === '/') {
        url.pathname = '/preview/';
        return env.ASSETS.fetch(new Request(url, request));
      }

      // Fallback
      url.pathname = `/realhost${url.pathname}`;
      return env.ASSETS.fetch(new Request(url, request));
    }

    const site = ROUTES[url.hostname];
    if (!site) return new Response("Not found", { status: 404 });
    url.pathname = `/${site}${url.pathname}`;
    return env.ASSETS.fetch(new Request(url, request));
  },
};
