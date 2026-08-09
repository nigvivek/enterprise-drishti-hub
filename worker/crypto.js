// Minimal crypto helpers built on Workers' native Web Crypto (crypto.subtle).
// No external deps — the AWS SDK is too heavy to bundle into a Worker for
// what we need here (a handful of signed GET requests).

const enc = new TextEncoder();

export async function sha256Hex(message) {
  const data = typeof message === "string" ? enc.encode(message) : message;
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return toHex(hashBuffer);
}

async function hmacRaw(key, message) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? enc.encode(key) : key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
}

export async function hmacHex(key, message) {
  return toHex(await hmacRaw(key, message));
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * AWS Signature Version 4 for a GET request with no body.
 * Returns the headers object to attach to the fetch call.
 * https://docs.aws.amazon.com/IAM/latest/UserGuide/create-signed-request.html
 */
export async function signAwsV4GetRequest({ accessKeyId, secretAccessKey, sessionToken, region, service, host, path = "/", query = {} }) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);

  const sortedQueryKeys = Object.keys(query).sort();
  const canonicalQuery = sortedQueryKeys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
    .join("&");

  const emptyPayloadHash = await sha256Hex("");
  const headersToSign = {
    host,
    "x-amz-content-sha256": emptyPayloadHash,
    "x-amz-date": amzDate,
    ...(sessionToken ? { "x-amz-security-token": sessionToken } : {}),
  };
  const sortedHeaderKeys = Object.keys(headersToSign).sort();
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${headersToSign[k]}\n`).join("");
  const signedHeaders = sortedHeaderKeys.join(";");

  const canonicalRequest = ["GET", path, canonicalQuery, canonicalHeaders, signedHeaders, emptyPayloadHash].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(canonicalRequest)].join("\n");

  const kDate = await hmacRaw(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = await hmacRaw(kDate, region);
  const kService = await hmacRaw(kRegion, service);
  const kSigning = await hmacRaw(kService, "aws4_request");
  const signature = await hmacHex(kSigning, stringToSign);

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    headers: {
      "x-amz-date": amzDate,
      "x-amz-content-sha256": emptyPayloadHash,
      Authorization: authorization,
      ...(sessionToken ? { "x-amz-security-token": sessionToken } : {}),
    },
    canonicalQuery,
  };
}
