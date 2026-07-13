const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const ean = new URL(request.url).searchParams.get('ean');
    if (!ean || !/^\d{8,14}$/.test(ean)) {
      return new Response(JSON.stringify({ error: 'invalid ean' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const target = `https://www.carrefour.com.ar/api/catalog_system/pub/products/search?fq=alternateIds_Ean:${ean}`;
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
