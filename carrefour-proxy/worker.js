const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// VTEX storefronts we're allowed to proxy. Jumbo/Disco/Vea (Cencosud) share
// the same product catalog, so only one of them needs to be queried.
const VTEX_SITES = {
  carrefour: 'www.carrefour.com.ar',
  jumbo: 'www.jumbo.com.ar',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const params = new URL(request.url).searchParams;
    const ean = params.get('ean');
    const site = params.get('site') || 'carrefour';

    if (!ean || !/^\d{8,14}$/.test(ean)) {
      return new Response(JSON.stringify({ error: 'invalid ean' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const domain = VTEX_SITES[site];
    if (!domain) {
      return new Response(JSON.stringify({ error: 'invalid site' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const target = `https://${domain}/api/catalog_system/pub/products/search?fq=alternateIds_Ean:${ean}`;
    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  },
};
