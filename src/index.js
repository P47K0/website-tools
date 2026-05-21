export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    // ====================== ROUTING ======================

    // Tools Index
    if (path === "/" || path === "") {
      return env.ASSETS.fetch(new URL("/index.html", request.url));
    }

    // Unit Price Calculator
    if (path === "/calculator" || path === "/calculator.html") {
      return env.ASSETS.fetch(new URL("/calculator.html", request.url));
    }

    if (path === "/api/log-calculation" && request.method === "POST") {
      const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";

      const { success } = await env.MY_RATE_LIMITER.limit({ 
        key: clientIP
      });

      if (!success) {
        return new Response("Rate limit exceeded", { status: 429 });
      }

      return await logCalculation(request, clientIP, env);
    }

    return new Response("Not Found", { status: 404 });
  }
};

async function logCalculation(request, clientIP, env) {
  try {
    const data = await request.json();    

    await env.DB.prepare(`
      INSERT INTO unit_price_calcs 
        (price, weight, discount, unit, final_price_per_unit, client_ip)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.price,
      data.weight,
      data.discount || 0,
      data.unit,
      data.final_price_per_unit,
      clientIP
    ).run();

    return Response.json({ success: true });

  } catch (err) {
    console.error("Logging error:", err);
    return Response.json({ success: false }); // Don't break the UI
  }
}
