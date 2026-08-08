// Lightweight localStorage-backed "account" layer.
//
// IMPORTANT: this is NOT secure authentication. There is no password, no
// server-side verification, and anyone with access to this browser profile
// can read or edit this data via devtools. It exists to give the prototype
// real per-user history/projects without standing up a backend. Real auth
// belongs to the backend described in SAAS_DEPLOYMENT.md.

const NS = "edh"; // namespace prefix for all keys
const GUEST_EMAIL = "guest@local";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ---- Users ----
export function getUsers() {
  return read(`${NS}:users`, {});
}
export function upsertUser({ email, name, provider }) {
  const users = getUsers();
  const existing = users[email];
  users[email] = {
    email,
    name: name || existing?.name || email.split("@")[0],
    provider: provider || existing?.provider || "email",
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  write(`${NS}:users`, users);
  return users[email];
}
export function getUser(email) {
  return getUsers()[email] || null;
}

// ---- Current session ----
export function getCurrentUserEmail() {
  return read(`${NS}:current`, null);
}
export function setCurrentUserEmail(email) {
  write(`${NS}:current`, email);
}
export function signOut() {
  write(`${NS}:current`, null);
}
export function isGuest(email) {
  return email === GUEST_EMAIL;
}
export function guestEmail() {
  return GUEST_EMAIL;
}

// ---- Projects ----
export function getProjects(email) {
  return read(`${NS}:projects:${email}`, []);
}
export function saveProjects(email, projects) {
  write(`${NS}:projects:${email}`, projects);
}
export function createProject(email, name) {
  const projects = getProjects(email);
  const project = {
    id: `proj_${Date.now()}`,
    name: name?.trim() || `Untitled project ${projects.length + 1}`,
    createdAt: new Date().toISOString(),
    connectionIds: [],
    selectedModules: [],
  };
  projects.push(project);
  saveProjects(email, projects);
  return project;
}
export function updateProject(email, projectId, patch) {
  const projects = getProjects(email);
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...patch };
  saveProjects(email, projects);
  return projects[idx];
}

// ---- Connections ----
export function getConnections(email) {
  return read(`${NS}:connections:${email}`, []);
}
export function saveConnections(email, connections) {
  write(`${NS}:connections:${email}`, connections);
}
export function upsertConnection(email, connection) {
  const connections = getConnections(email);
  const idx = connections.findIndex((c) => c.id === connection.id);
  if (idx === -1) connections.push(connection);
  else connections[idx] = connection;
  saveConnections(email, connections);
  return connections;
}

// ---- History ----
export function getHistory(email) {
  return read(`${NS}:history:${email}`, []);
}
export function addHistoryEntry(email, entry) {
  const history = getHistory(email);
  history.unshift({ id: `hist_${Date.now()}`, timestamp: new Date().toISOString(), ...entry });
  write(`${NS}:history:${email}`, history.slice(0, 50)); // cap at 50 entries
}
