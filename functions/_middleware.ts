export const onRequest: PagesFunction<Env> = async (context) => {
  const requestUrl = new URL(context.request.url);
  if (requestUrl.hostname === "www.hxlfab.com") {
    requestUrl.hostname = "hxlfab.com";
    requestUrl.protocol = "https:";
    return Response.redirect(requestUrl.toString(), 301);
  }

  const origin = context.request.headers.get("Origin");

  if (origin && origin !== requestUrl.origin) {
    return Response.json({ error: "Cross-site requests are not allowed." }, { status: 403 });
  }

  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": requestUrl.origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, X-File-Name, X-File-Size",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  if (requestUrl.pathname.startsWith("/api/")) {
    headers.set("Cache-Control", "no-store");
  }

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};
