import {
  jsonResponse,
  verifyInitData,
  extractUser,
  resolveInitDataMaxAgeSec
} from "../_shared/utils.js";

const DONATE_PACKAGES = [
  {
    id: "support_s",
    title: "Starter Support",
    stars: 50,
    bonusNF: 1800,
    description: "Thanks for supporting Tapalka"
  },
  {
    id: "support_m",
    title: "Creator Support",
    stars: 150,
    bonusNF: 6200,
    description: "Bigger support pack with small NeoFlux bonus"
  },
  {
    id: "support_l",
    title: "Legend Support",
    stars: 400,
    bonusNF: 19000,
    description: "Legendary support for project growth"
  }
];

function sanitizePackages() {
  return DONATE_PACKAGES.map((pkg) => ({
    id: pkg.id,
    title: pkg.title,
    stars: pkg.stars,
    bonusNF: pkg.bonusNF
  }));
}

function getPackageById(packageId) {
  return DONATE_PACKAGES.find((pkg) => pkg.id === packageId) || null;
}

function buildPayload(userId, packageId) {
  return `donate:${packageId}:${userId}:${Date.now()}`;
}

async function createInvoiceLink(env, userId, pack) {
  const payload = {
    title: pack.title,
    description: pack.description,
    payload: buildPayload(userId, pack.id),
    currency: "XTR",
    prices: [{ label: pack.title, amount: Number(pack.stars) }]
  };
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/createInvoiceLink`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data?.ok || !data?.result) {
    return { ok: false, error: data?.description || "invoice_create_failed" };
  }
  return { ok: true, invoiceLink: data.result };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (env.STARS_DISABLED === "1") {
    return jsonResponse({ ok: false, error: "stars_disabled" }, 400);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const initData = body.initData || request.headers.get("x-init-data");
  const maxAgeSec = resolveInitDataMaxAgeSec(env);
  if (!initData) {
    return jsonResponse({ ok: false, error: "initData missing" }, 401);
  }
  const valid = await verifyInitData(initData, env.BOT_TOKEN, maxAgeSec);
  if (!valid) {
    return jsonResponse({ ok: false, error: "initData invalid" }, 401);
  }
  const tgUser = extractUser(initData);
  if (!tgUser?.id) {
    return jsonResponse({ ok: false, error: "user missing" }, 400);
  }

  const packageId = String(body.packageId || "").trim();
  if (!packageId) {
    return jsonResponse({ ok: true, packages: sanitizePackages() });
  }

  const pack = getPackageById(packageId);
  if (!pack) {
    return jsonResponse({ ok: false, error: "package_not_found" }, 404);
  }
  const invoice = await createInvoiceLink(env, String(tgUser.id), pack);
  if (!invoice.ok) {
    return jsonResponse({ ok: false, error: invoice.error }, 400);
  }
  return jsonResponse({
    ok: true,
    packageId: pack.id,
    invoiceLink: invoice.invoiceLink
  });
}

export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
}

