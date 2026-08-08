import { signAwsV4GetRequest } from "./crypto.js";

async function xmlTagValues(xmlText, tag) {
  const re = new RegExp(`<${tag}>([^<]*)</${tag}>`, "g");
  const out = [];
  let m;
  while ((m = re.exec(xmlText))) out.push(m[1]);
  return out;
}

export async function connectAws(body) {
  const { accessKeyId, secretAccessKey, sessionToken, region } = body;
  if (!accessKeyId || !secretAccessKey || !region) {
    return { ok: false, error: "accessKeyId, secretAccessKey, and region are required" };
  }

  const resources = [];
  const errors = [];

  // ---- S3: ListBuckets ----
  try {
    const host = "s3.amazonaws.com"; // global endpoint; works for ListBuckets regardless of bucket regions
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
