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

    if (!site) {
      return new Response("Not found", { status: 404 });
    }

    url.pathname = `/${site}${url.pathname}`;
    return env.ASSETS.fetch(new Request(url, request));
  },
};
