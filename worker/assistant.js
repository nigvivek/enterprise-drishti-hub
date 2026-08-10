// In-app assistant. Requires the caller's own ANTHROPIC_API_KEY set as a
// Cloudflare secret (`wrangler secret put ANTHROPIC_API_KEY`) — see
// ASSISTANT_SETUP.md. Until that's configured, this endpoint returns a
// clear "not configured" error instead of crashing.

const MODULE_IDS = [
  "overview", "impact", "predictive", "controls", "gateway",
];
const WORKSPACE_STEPS = ["workspace-step-1", "workspace-step-2", "workspace-step-3", "workspace-step-4"];
const NAV_TARGETS = [...MODULE_IDS, ...WORKSPACE_STEPS];

const SYSTEM_PROMPT = `You are the in-app assistant for Enterprise Drishti Hub (EDH), a self-hosted compliance, cyber-risk, and AI-governance platform for regulated (primarily financial-services) organizations.

EDH organizes its capabilities into two tiers:
- Modules (core functional business capabilities): Risk Analysis Dashboard ("overview"), Compliance Impact Analysis ("impact"), Predictive Regulatory Risk & Audit Evidence ("predictive" — this module now includes both predictive risk analysis and audit evidence generation, merged into one), Continuous Control Validation ("controls").
- Platform (technical infrastructure, accessible as a standalone quick-access button next to "Launch Dashboard" throughout the site, not part of the functional module flow): AI Gateway & Cost Governance ("gateway").

Your scope is strictly limited to EDH itself. You may:
- Explain what any of the above does, and explain the distinction between modules and platform infrastructure if asked.
- Explain how the workspace works (create a project, connect a data source, select modules, validate, launch).
- Help the user navigate the app using the "navigate" tool, choosing a target from exactly this list: ${NAV_TARGETS.join(", ")}.
- Explain what is real functionality versus simulated/illustrative data in the current build — be honest about this distinction whenever it's relevant; most module content is clearly marked "Simulated" and you should not contradict that. Note that the Risk Analysis Dashboard, Compliance Impact Analysis's region guideline checks, and Predictive Regulatory Risk's file-based anomaly detection all now use real data from connected sources, not simulation.

You must NOT:
- Answer questions unrelated to EDH (general knowledge, coding help, other products, personal advice, current events, etc.) — politely decline and redirect to what you can help with in EDH.
- Claim any action beyond navigation was actually performed (you cannot connect real data sources, run real compliance checks, or modify data on the user's behalf — only navigate the UI).
- Invent features that don't exist in EDH.

If a request is out of scope, say so briefly and redirect: "I can only help with things inside Enterprise Drishti Hub — I can't help with that, but I can show you around the platform if useful."

Keep replies concise — a few sentences, not an essay. Use the navigate tool only when the user's intent is clearly to go somewhere, not for every message.`;

const NAVIGATE_TOOL = {
  name: "navigate",
  description: "Switch the user's current view to a specific module or workspace step.",
  input_schema: {
    type: "object",
    properties: {
      target: { type: "string", enum: NAV_TARGETS, description: "Where to navigate the user." },
    },
    required: ["target"],
  },
};

export async function chatAssistant(body, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "The assistant isn't configured yet — see ASSISTANT_SETUP.md to add your own Anthropic API key." };
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) return { ok: false, error: "messages is required" };
  if (messages.length > 40) return { ok: false, error: "Conversation too long for this session — start a new chat." };

  // Trim any client-supplied fields down to exactly what the API accepts.
  const cleanMessages = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: cleanMessages,
        tools: [NAVIGATE_TOOL],
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return { ok: false, error: data?.error?.message || `Assistant API returned HTTP ${resp.status}` };
    }

    let reply = "";
    let action = null;
    for (const block of data.content || []) {
      if (block.type === "text") reply += block.text;
      if (block.type === "tool_use" && block.name === "navigate" && NAV_TARGETS.includes(block.input?.target)) {
        action = { type: "navigate", target: block.input.target };
      }
    }

    return { ok: true, reply: reply.trim() || (action ? "On it." : "..."), action };
  } catch (e) {
    return { ok: false, error: e.message || "Assistant request failed" };
  }
}
