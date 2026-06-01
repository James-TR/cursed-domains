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

const SITE_PATHS = {
  fornoreason: new Set(['/', '/index.html', '/style.css', '/script.js', '/favicon.svg']),
  youhacked:   new Set(['/', '/index.html', '/style.css', '/script.js', '/favicon.svg', '/hack.jpg']),
  realhost:    new Set(['/', '/index.html', '/style.css', '/script.js', '/favicon.svg']),
  preview:     new Set(['/', '/index.html', '/style.css', '/script.js', '/favicon.svg']),
};

const NOT_FOUND = () => new Response('Not found', { status: 404 });

export default {
  async fetch(request, env) {
    if ((request.cf?.threatScore ?? 0) > 25) return NOT_FOUND();

    const url = new URL(request.url);
    const isPreview = url.hostname.endsWith('.workers.dev');

    if (url.pathname === '/youare') {
      return new Response(request.headers.get('CF-Connecting-IP') ?? '');
    }

    if (url.pathname === '/whoami') {
      const cf = request.cf ?? {};
      return new Response(JSON.stringify({
        ip:             request.headers.get('CF-Connecting-IP') ?? '',
        city:           cf.city,
        country:        cf.country,
        region:         cf.region,
        regionCode:     cf.regionCode,
        timezone:       cf.timezone,
        postalCode:     cf.postalCode,
        latitude:       cf.latitude,
        longitude:      cf.longitude,
        asn:            cf.asn,
        asOrganization: cf.asOrganization,
        colo:           cf.colo,
        httpProtocol:   cf.httpProtocol,
        tlsVersion:     cf.tlsVersion,
        tlsCipher:      cf.tlsCipher,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (isPreview) {
      const siteParam = url.searchParams.get('site');
      if (siteParam && SITES.has(siteParam)) {
        return Response.redirect(`${url.origin}/${siteParam}/`, 302);
      }

      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0 && (SITES.has(segments[0]) || segments[0] === 'preview')) {
        const site = segments[0];
        const innerPath = segments.length > 1 ? '/' + segments.slice(1).join('/') : '/';
        if (!SITE_PATHS[site].has(innerPath)) return NOT_FOUND();
        url.pathname = `/${site}${innerPath}`;
        return env.ASSETS.fetch(new Request(url, request));
      }

      if (url.pathname === '/') {
        return Response.redirect(`${url.origin}/preview/`, 302);
      }

      if (!SITE_PATHS.realhost.has(url.pathname)) return NOT_FOUND();
      url.pathname = `/realhost${url.pathname}`;
      return env.ASSETS.fetch(new Request(url, request));
    }

    const site = ROUTES[url.hostname];
    if (!site) return NOT_FOUND();
    if (!SITE_PATHS[site].has(url.pathname)) return NOT_FOUND();
    url.pathname = `/${site}${url.pathname}`;
    return env.ASSETS.fetch(new Request(url, request));
  },
};
