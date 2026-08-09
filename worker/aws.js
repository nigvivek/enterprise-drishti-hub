import { signAwsV4GetRequest } from "./crypto.js";

async function xmlTagValues(xmlText, tag) {
  const re = new RegExp(`<${tag}>([^<]*)</${tag}>`, "g");
  const out = [];
  let m;
  while ((m = re.exec(xmlText))) out.push(m[1]);
  return out;
}

export async function browseS3Objects(body) {
  const accessKeyId = (body.accessKeyId || "").trim();
  const secretAccessKey = (body.secretAccessKey || "").trim();
  const sessionToken = (body.sessionToken || "").trim() || undefined;
  const region = (body.region || "").trim();
  const bucket = (body.bucket || "").trim();
  const prefix = body.prefix || "";

  if (!accessKeyId || !secretAccessKey || !region || !bucket) {
    return { ok: false, error: "accessKeyId, secretAccessKey, region, and bucket are required" };
  }

  const host = `${bucket}.s3.${region === "us-east-1" ? "amazonaws.com" : `${region}.amazonaws.com`}`;
  const query = { "list-type": "2", "max-keys": "200", "delimiter": "/", ...(prefix ? { prefix } : {}) };

  try {
    const { headers, canonicalQuery } = await signAwsV4GetRequest({ accessKeyId, secretAccessKey, sessionToken, region, service: "s3", host, path: "/", query });
    const resp = await fetch(`https://${host}/?${canonicalQuery}`, { headers: { ...headers, host } });
    const text = await resp.text();
    if (!resp.ok) {
      return { ok: false, error: (await xmlTagValues(text, "Message"))[0] || `HTTP ${resp.status}` };
    }
    const folders = (await xmlTagValues(text, "Prefix")).filter((p) => p !== prefix); // CommonPrefixes entries
    const files = await xmlTagValues(text, "Key");
    return {
      ok: true,
      currentPrefix: prefix,
      folders: folders.map((f) => ({ type: "folder", path: f, name: f.replace(prefix, "").replace(/\/$/, "") })),
      files: files.filter((f) => f !== prefix).map((f) => ({ type: "object", path: f, name: f.replace(prefix, "") })),
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function connectAws(body) {
  const accessKeyId = (body.accessKeyId || "").trim();
  const secretAccessKey = (body.secretAccessKey || "").trim();
  const sessionToken = (body.sessionToken || "").trim() || undefined;
  const region = (body.region || "").trim();

  if (!accessKeyId || !secretAccessKey || !region) {
    return { ok: false, error: "accessKeyId, secretAccessKey, and region are required" };
  }
  if (!/^(AKIA|ASIA)[A-Z0-9]{16}$/.test(accessKeyId)) {
    return {
      ok: false,
      error:
        "That Access Key ID doesn't look like a valid AWS key — it should start with AKIA (long-term) or ASIA " +
        "(temporary/STS) and be 20 characters total. Check for a stray space or newline from copy-pasting, or that " +
        "you didn't paste the Secret Access Key into this field by mistake.",
    };
  }
  if (accessKeyId.startsWith("ASIA") && !sessionToken) {
    return {
      ok: false,
      error:
        "This looks like a temporary (STS) access key — those require a Session Token too. If you generated " +
        "credentials with `aws sts get-session-token`, make sure you copied the SessionToken value into that field as well.",
    };
  }

  const resources = [];
  const errors = [];

  // ---- S3: ListBuckets ----
  try {
    const host = region === "us-east-1" ? "s3.amazonaws.com" : `s3.${region}.amazonaws.com`;
    const { headers } = await signAwsV4GetRequest({ accessKeyId, secretAccessKey, sessionToken, region, service: "s3", host, path: "/" });
    const resp = await fetch(`https://${host}/`, { headers: { ...headers, host } });
    const text = await resp.text();
    if (!resp.ok) {
      errors.push(`S3: ${resp.status} ${(await xmlTagValues(text, "Message"))[0] || text.slice(0, 200)}`);
    } else {
      const names = await xmlTagValues(text, "Name");
      names.forEach((n) => resources.push({ service: "S3", name: n, type: "bucket" }));
    }
  } catch (e) {
    errors.push(`S3: ${e.message}`);
  }

  // ---- Redshift: DescribeClusters ----
  try {
    const host = `redshift.${region}.amazonaws.com`;
    const query = { Action: "DescribeClusters", Version: "2012-12-01" };
    const { headers, canonicalQuery } = await signAwsV4GetRequest({ accessKeyId, secretAccessKey, sessionToken, region, service: "redshift", host, path: "/", query });
    const resp = await fetch(`https://${host}/?${canonicalQuery}`, { headers: { ...headers, host } });
    const text = await resp.text();
    if (!resp.ok) {
      errors.push(`Redshift: ${resp.status} ${(await xmlTagValues(text, "Message"))[0] || text.slice(0, 200)}`);
    } else {
      const ids = await xmlTagValues(text, "ClusterIdentifier");
      ids.forEach((n) => resources.push({ service: "Redshift", name: n, type: "cluster" }));
    }
  } catch (e) {
    errors.push(`Redshift: ${e.message}`);
  }

  return { ok: resources.length > 0 || errors.length === 0, resources, errors };
}
