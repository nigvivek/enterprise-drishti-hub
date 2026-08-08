# Connecting Real Cloud & Data Platform Accounts

The Cloud, Snowflake, and Databricks connectors in the workspace make **real, live API calls** through the Worker backend (`worker/*.js`) — not simulated. MySQL, Oracle, Teradata, and Files stay simulated (see note at the bottom) since reaching a private on-prem system from a public edge function isn't possible without a customer-side agent.

**Security posture for all of these:** use a **read-only, least-privilege** credential wherever the provider supports scoping one, and prefer short-lived tokens over long-lived keys where an option exists. The credential is sent once per "Test & connect" click, used for that request, and never written to storage — only the resulting resource list and non-secret fields (region, project ID, etc.) are saved locally.

---

## AWS
Needs: **Access Key ID**, **Secret Access Key**, optional **Session Token**, and **Region**.

Fastest safe option — generate short-lived credentials via STS instead of using a long-lived IAM user key:
```bash
aws sts get-session-token --duration-seconds 3600
```
This returns an `AccessKeyId`, `SecretAccessKey`, and `SessionToken` valid for one hour — paste all three in. The IAM identity behind it needs read access to S3 (`s3:ListAllMyBuckets`) and Redshift (`redshift:DescribeClusters`) at minimum — the AWS managed policy `ReadOnlyAccess` covers both, but a narrower custom policy is better for anything beyond a quick test.

## Azure
Needs: an **access token** and your **Subscription ID**.
```bash
az login
az account get-access-token --resource https://management.azure.com --query accessToken -o tsv
```
Tokens from this command are short-lived (typically ~1 hour). Find your subscription ID with `az account show --query id -o tsv`.

## Google Cloud Platform
Needs: an **access token** and your **Project ID**.
```bash
gcloud auth login
gcloud auth print-access-token
```
Also short-lived. The identity needs `roles/storage.objectViewer` (or broader read access) and `roles/bigquery.dataViewer` to see both Cloud Storage buckets and BigQuery datasets.

## IBM Cloud
Needs: an **API key**.
1. IBM Cloud console → **Manage** → **Access (IAM)** → **API keys** → **Create an IBM Cloud API key**.
2. This one is a standing credential (IBM's IAM doesn't have a simple short-lived-token CLI equivalent to the above) — scope the identity it belongs to as narrowly as your IBM Cloud account allows, and rotate/delete it after testing if it was created just for this.

## Snowflake
Needs: your **account identifier** (e.g. `xy12345.us-east-1`, from your Snowflake URL) and a **token**.
- Easiest: an OAuth/personal access token if your account has token-based auth enabled (Snowsight → your profile → **Personal access tokens**).
- Requires the SQL API to be reachable and the token's role to have at least `USAGE` on the databases you want listed.

## Databricks
Needs: your **workspace URL** (e.g. `https://dbc-xxxxxxx.cloud.databricks.com`) and a **personal access token**.
- Workspace → user menu → **Settings** → **Developer** → **Access tokens** → **Generate new token**.
- Give it read-only scope if your workspace's token permissions support scoping.

---

## Why MySQL / Oracle / Teradata / Files are still simulated
A Cloudflare Worker runs at the edge with no route into a customer's private network — it can reach public internet APIs (which is how the connectors above work) but not an on-prem database sitting behind a corporate firewall. Making that real needs a small agent/tunnel component running inside the customer's network that the Worker can call out to — that's Integration Hub territory from `architecture.md`, not a Worker-only fix. The workspace still captures the connection configuration so the UI/UX is validated end-to-end; it just doesn't attempt a live connection for these four.
