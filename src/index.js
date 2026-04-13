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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const site = ROUTES[url.hostname];

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

    url.pathname = `/${site}${url.pathname}`;
    return env.ASSETS.fetch(new Request(url, request));
  },
};
