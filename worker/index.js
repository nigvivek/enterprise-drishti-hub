import { connectAws, browseS3Objects } from "./aws.js";
import { connectAzure } from "./azure.js";
import { connectGcp } from "./gcp.js";
import { connectIbm } from "./ibm.js";
import { connectSnowflake } from "./snowflake.js";
import { connectDatabricks, browseDatabricksSchemas, browseDatabricksTables } from "./databricks.js";
import { listTestimonials, submitTestimonial } from "./testimonials.js";

const HANDLERS = {
  aws: connectAws,
  azure: connectAzure,
  gcp: connectGcp,
  ibm: connectIbm,
  snowflake: connectSnowflake,
  databricks: connectDatabricks,
};

const BROWSE_HANDLERS = {
  "s3-objects": browseS3Objects,
  "databricks-schemas": browseDatabricksSchemas,
  "databricks-tables": browseDatabricksTables,
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/testimonials") {
      if (request.method === "GET") return listTestimonials(env);
      if (request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "Invalid JSON body" }, 400);
        }
        const clientIp = request.headers.get("CF-Connecting-IP");
        return submitTestimonial(env, body, clientIp);
      }
      return json({ ok: false, error: "GET or POST required" }, 405);
    }

    if (url.pathname.startsWith("/api/browse/")) {
      if (request.method !== "POST") return json({ ok: false, error: "POST required" }, 405);
      const kind = url.pathname.split("/").pop();
      const handler = BROWSE_HANDLERS[kind];
      if (!handler) return json({ ok: false, error: `Unknown browse kind: ${kind}` }, 404);

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, error: "Invalid JSON body" }, 400);
      }

      try {
        const result = await handler(body);
        return json(result, result.ok === false ? 400 : 200);
      } catch (e) {
        return json({ ok: false, error: e.message || "Browse failed" }, 500);
      }
    }

    if (url.pathname.startsWith("/api/connect/")) {
      if (request.method !== "POST") return json({ ok: false, error: "POST required" }, 405);
      const provider = url.pathname.split("/").pop();
      const handler = HANDLERS[provider];
      if (!handler) return json({ ok: false, error: `Unknown provider: ${provider}` }, 404);

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, error: "Invalid JSON body" }, 400);
      }

      try {
        const result = await handler(body);
        return json(result, result.ok === false && !result.resources ? 400 : 200);
      } catch (e) {
        return json({ ok: false, error: e.message || "Connector failed" }, 500);
      }
    }

    // Everything else: serve the built static app.
    return env.ASSETS.fetch(request);
  },
};
