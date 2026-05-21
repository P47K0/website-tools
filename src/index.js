export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    console.log(`Request received: ${request.method} ${path}`);   // ← Add this for debugging

    // API Routes - MUST come BEFORE static assets
    if (path === "/api/log-calculation" && request.method === "POST") {
      console.log("→ Routing to logCalculation");
      return await logCalculation(request, env);
    }    

    // Static Assets
    if (path === "/" || path === "/index.html") {
      return env.ASSETS.fetch(new URL("/index.html", request.url));
    }

    if (path === "/calculator" || path === "/calculator.html") {
      return env.ASSETS.fetch(new URL("/calculator.html", request.url));
    }

    console.log("→ 404");
    return new Response("Not Found", { status: 404 });
  }
};

async function logCalculation(request, env) {
  try {
    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
    const data = await request.json();

    console.log("Logging calculation from", clientIP, data);
    
    await env.DB.prepare(`
      INSERT INTO unit_price_calcs 
        (price, weight, discount, unit, final_price_per_unit, client_ip)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.price || 0,
      data.weight || 0,
      data.discount || 0,
      data.unit || 0,
      data.final_price_per_unit || 0,
      clientIP
    ).run();

    return Response.json({ success: true });

  } catch (err) {
    console.error("Logging error:", err);
    return Response.json({ success: false });
  }
}
