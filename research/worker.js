/* /three-depths router plus the research endpoint.

   Everything under /three-depths/ is proxied to the Pages build. One path is
   answered here: POST /three-depths/api/run stores one row per finished
   version of a study. Numbers only. No IP, no cookie, no user agent, no free
   text: the payload is validated against a fixed list of keys and anything
   else is dropped before the insert. The address a request comes from is read
   for one purpose, the rate limit below, and is never written anywhere. */

const UPSTREAM_DEFAULT = "https://three-depths.pages.dev";
const ORIGINS = ["https://www.adidizdarevic.com", "https://adidizdarevic.com"];
const MAX_BODY = 4096;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const VERSIONS = { 1: ["A", "B", "C"], 2: ["fixed", "generated", "generated-rules"] };
const NUM  = { 1: ["commitments", "blind", "backtracks", "seconds", "confidence"],
               2: ["seconds", "commitments", "corrections", "regenerations", "recovery", "reorient"] };
const STR  = { 1: ["recall"], 2: [] };
const BOOL = { 1: [], 2: ["matchedIntent"] };
const LIST = { 1: ["path"], 2: ["recoveries", "reorients", "surfaces"] };

function bad(msg) { return new Response(msg, { status: 400 }); }

export async function handleRun(req, env) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") return new Response("POST only", { status: 405, headers: { Allow: "POST" } });
  if (!env || !env.TDP_DB) return new Response("no store", { status: 503 });
  /* Only the article's own pages post here. A browser sends Origin on every
     POST and, where it supports it, Sec-Fetch-Site; either one present and
     naming another site is refused. An absent header is let through so an
     older browser is not turned away. A script can forge both, which is what
     the limit after them is for. */
  const origin = req.headers.get("origin");
  if (origin && !ORIGINS.includes(origin)) return new Response("origin", { status: 403 });
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return new Response("site", { status: 403 });
  /* A reader who finishes both studies posts five rows. Sixty a minute from one
     address leaves room for a whole room of readers behind one network and
     stops a loop. Without the binding (a local run) there is no limit. */
  if (env.TDP_LIMIT) {
    const { success } = await env.TDP_LIMIT.limit({ key: req.headers.get("cf-connecting-ip") || "unknown" });
    if (!success) return new Response("slow down", { status: 429 });
  }
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_BODY) return bad("too large");
  const text = await req.text();
  if (text.length > MAX_BODY) return bad("too large");
  let b;
  try { b = JSON.parse(text); } catch (e) { return bad("json"); }
  if (!b || typeof b !== "object") return bad("shape");
  const study = (b.study === 1 || b.study === 2) ? b.study : 0;
  if (!study) return bad("study");
  if (typeof b.run !== "string" || !UUID.test(b.run)) return bad("run");
  if (!VERSIONS[study].includes(b.version)) return bad("version");
  const seq = (Number.isInteger(b.seq) && b.seq >= 1 && b.seq <= 6) ? b.seq : null;
  const build = (typeof b.build === "string" && b.build.length <= 20) ? b.build : null;
  const embed = b.embed ? 1 : 0;
  const pointer = (b.pointer === "coarse" || b.pointer === "fine") ? b.pointer : "unknown";
  const vw = (Number.isInteger(b.vw) && b.vw >= 0 && b.vw <= 10000) ? b.vw : null;
  const again = b.repeat ? 1 : 0;
  const m = b.metrics;
  if (!m || typeof m !== "object") return bad("metrics");
  const out = {};
  for (const k of NUM[study])  { if (typeof m[k] === "number" && Number.isFinite(m[k])) out[k] = m[k]; else if (m[k] === null) out[k] = null; }
  for (const k of STR[study])  { if (typeof m[k] === "string" && m[k].length <= 80) out[k] = m[k]; else if (m[k] === null) out[k] = null; }
  for (const k of BOOL[study]) { if (typeof m[k] === "boolean") out[k] = m[k]; }
  for (const k of LIST[study]) {
    if (Array.isArray(m[k])) out[k] = m[k].slice(0, 60).filter(x =>
      (typeof x === "number" && Number.isFinite(x)) || (typeof x === "string" && x.length <= 12));
  }
  const id = crypto.randomUUID();
  await env.TDP_DB.prepare(
    "INSERT INTO runs (id, created_at, run, study, version, seq, build, embed, pointer, vw, is_repeat, metrics) " +
    "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)")
    .bind(id, new Date().toISOString(), b.run, study, b.version, seq, build, embed, pointer, vw, again, JSON.stringify(out))
    .run();
  return new Response(null, { status: 204 });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    /* The routes match any path that begins "/three-depths", so a WordPress
       page such as /three-depths-notes would land here too. It goes to the
       origin untouched, as it would without this Worker (the /nui guard). */
    if (url.pathname !== "/three-depths" && !url.pathname.startsWith("/three-depths/"))
      return fetch(req);
    /* The bare apex URL goes straight to the trailing slash: one hop, not two. */
    if (url.hostname === "adidizdarevic.com")
      return Response.redirect("https://www.adidizdarevic.com" +
        (url.pathname === "/three-depths" ? "/three-depths/" : url.pathname) + url.search, 301);
    if (url.pathname === "/three-depths/api/run")
      return handleRun(req, env);
    if (url.pathname === "/three-depths")
      return Response.redirect(url.origin + "/three-depths/" + url.search, 301);
    const base = (env && env.UPSTREAM) || UPSTREAM_DEFAULT;
    const upstream = new URL(url.pathname.replace(/^\/three-depths\//, "/"), base);
    upstream.search = url.search;
    /* Pages answers every .html path with a 308 to the same path without the
       extension, and its Location is rooted at the Pages root: demos/demo-01.html
       comes back as "/demos/demo-01". Passed through as is, that would send all
       three iframes out of /three-depths/ and into WordPress's 404. So redirects
       are not followed here, and a redirect that stays on Pages gets the prefix
       back, as /nui does. The reader's cookies for the domain are WordPress's:
       they are not sent on, and nothing Pages sets is passed back. */
    const headers = new Headers(req.headers);
    headers.delete("cookie");
    headers.delete("host");
    const res = await fetch(new Request(upstream,
      { method: req.method, headers, body: req.body, redirect: "manual" }));
    const out = new Response(res.body, res);
    out.headers.delete("set-cookie");
    /* The build's _headers keeps three-depths.pages.dev out of search with an
       X-Robots-Tag, and this Worker fetches from that same host, so the tag
       arrives here too. It is for the pages.dev copy only: the article's own
       robots meta speaks for this address. */
    out.headers.delete("x-robots-tag");
    const loc = out.headers.get("location");
    if (loc) {
      const to = new URL(loc, upstream);
      if (to.origin === upstream.origin)
        out.headers.set("location", "/three-depths" + to.pathname + to.search);
    }
    return out;
  }
}
