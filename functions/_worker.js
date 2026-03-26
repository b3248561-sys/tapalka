import {
  jsonResponse,
  createUser,
  normalizeUser,
  ensureDaily,
  syncSeason,
  applyTapAction,
  applyBuyAction,
  applyDailyAction,
  applyQuestClaimAction,
  applyAdminAdjustAction
} from "./_shared/utils.js";

export class UserStore {
  constructor(state) {
    this.state = state;
  }

  async loadMutableUser({ userId, name, username, avatarUrl }) {
    let user = await this.state.storage.get("user");
    if (!user) {
      user = createUser(userId, name, username, avatarUrl);
    } else {
      let changed = false;
      if (name && !user.nameCustomized && user.name !== name) {
        user.name = name;
        changed = true;
      }
      if (typeof username === "string" && user.username !== username) {
        user.username = username;
        changed = true;
      }
      if (
        typeof avatarUrl === "string" &&
        avatarUrl &&
        !user.avatarCustomized &&
        user.avatarUrl !== avatarUrl
      ) {
        user.avatarUrl = avatarUrl;
        changed = true;
      }
      if (changed) {
        // fall through to normalize + save
      }
    }
    return normalizeUser(user);
  }

  async saveMutableUser(user) {
    const normalized = normalizeUser(user);
    ensureDaily(normalized);
    syncSeason(normalized);
    if (normalized._dirty) delete normalized._dirty;
    await this.state.storage.put("user", normalized);
    return normalized;
  }

  async getUser(identity) {
    const user = await this.loadMutableUser(identity);
    return this.saveMutableUser(user);
  }

  async peekUser() {
    const user = await this.state.storage.get("user");
    if (!user) return null;
    const normalized = normalizeUser(user);
    ensureDaily(normalized);
    syncSeason(normalized);
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

  async loadExistingUser() {
    const user = await this.state.storage.get("user");
    if (!user) return null;
    return normalizeUser(user);
  }

  async applyAction(identity, handler) {
    const user = await this.loadMutableUser(identity);
    ensureDaily(user);
    const result = handler(user);
    const persisted = await this.saveMutableUser(user);
    return { result, user: persisted };
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
    if (action === "tap") {
      const { result, user } = await this.applyAction(body, (candidate) =>
        applyTapAction(candidate, { count: body.count, now: body.now })
      );
      if (!result.ok) {
        const { status = 400, ...rest } = result;
        return jsonResponse({ ok: false, status, user, ...rest }, status);
      }
      return jsonResponse({ ...result.payload, user, log: result.log });
    }
    if (action === "buy") {
      const { result, user } = await this.applyAction(body, (candidate) =>
        applyBuyAction(candidate, body.itemId, body.now)
      );
      if (!result.ok) {
        const { status = 400, ...rest } = result;
        return jsonResponse({ ok: false, status, ...rest }, status);
      }
      return jsonResponse({ ...result.payload, user, log: result.log });
    }
    if (action === "daily") {
      const { result, user } = await this.applyAction(body, (candidate) =>
        applyDailyAction(candidate, body.now)
      );
      if (!result.ok) {
        const { status = 400, ...rest } = result;
        return jsonResponse({ ok: false, status, ...rest }, status);
      }
      return jsonResponse({ ...result.payload, user, log: result.log });
    }
    if (action === "quest_claim") {
      const { result, user } = await this.applyAction(body, (candidate) =>
        applyQuestClaimAction(candidate, body.questId, body.now)
      );
      if (!result.ok) {
        const { status = 400, ...rest } = result;
        return jsonResponse({ ok: false, status, ...rest }, status);
      }
      return jsonResponse({ ...result.payload, user, log: result.log });
    }
    if (action === "admin_adjust") {
      const user = await this.loadExistingUser();
      if (!user) {
        return jsonResponse({ ok: false, status: 404, error: "not_found" }, 404);
      }
      const result = applyAdminAdjustAction(user, body, body.now);
      if (!result.ok) {
        const { status = 400, ...rest } = result;
        return jsonResponse({ ok: false, status, ...rest }, status);
      }
      const persisted = await this.saveMutableUser(user);
      return jsonResponse({ ok: true, user: persisted, changes: result.changes });
    }
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }
}
