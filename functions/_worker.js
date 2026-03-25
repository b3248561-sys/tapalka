import {
  jsonResponse,
  createUser,
  normalizeUser,
  ensureDaily
} from "./_shared/utils.js";

export class UserStore {
  constructor(state) {
    this.state = state;
  }

  async getUser({ userId, name, username }) {
    let user = await this.state.storage.get("user");
    if (!user) {
      user = createUser(userId, name, username);
    } else {
      let changed = false;
      if (name && user.name !== name) {
        user.name = name;
        changed = true;
      }
      if (typeof username === "string" && user.username !== username) {
        user.username = username;
        changed = true;
      }
      if (changed) {
        // fall through to normalize + save
      }
    }
    const normalized = normalizeUser(user);
    ensureDaily(normalized);
    await this.state.storage.put("user", normalized);
    return normalized;
  }

  async peekUser() {
    const user = await this.state.storage.get("user");
    if (!user) return null;
    const normalized = normalizeUser(user);
    ensureDaily(normalized);
    if (normalized._dirty) {
      delete normalized._dirty;
      await this.state.storage.put("user", normalized);
    }
    return normalized;
  }

  async putUser(user) {
    if (!user || !user.id) {
      return null;
    }
    const normalized = normalizeUser(user);
    ensureDaily(normalized);
    await this.state.storage.put("user", normalized);
    return normalized;
  }

  async fetch(request) {
    let body = {};
    try {
      if (request.method !== "GET") {
        body = await request.json();
      }
    } catch {
      body = {};
    }
    const action = body.action || new URL(request.url).pathname.replace("/", "");

    if (action === "get") {
      const user = await this.getUser(body);
      return jsonResponse({ ok: true, user });
    }
    if (action === "peek") {
      const user = await this.peekUser();
      if (!user) return jsonResponse({ ok: false, error: "not_found" }, 404);
      return jsonResponse({ ok: true, user });
    }
    if (action === "put") {
      const user = await this.putUser(body.user);
      if (!user) return jsonResponse({ ok: false, error: "invalid_user" }, 400);
      return jsonResponse({ ok: true, user });
    }
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }
}
