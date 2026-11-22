// Serverless-функция Vercel: создаёт сессию оплаты Stripe Checkout.
// Нужна переменная окружения STRIPE_SECRET_KEY (в Vercel: Settings → Environment Variables).
// Необязательно: SITE_URL — адрес сайта для возврата после оплаты (например https://forma.vercel.app).
const { STORE, PRODUCTS } = require("../products.js");

const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const MAX_QTY = 20;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Метод не поддерживается" });
  }

  const key = process.env.STRIPE_SECRET_KEY;

  const items = Array.isArray(req.body && req.body.items) ? req.body.items : [];
  if (!items.length || items.length > 50) return res.status(400).json({ error: "Корзина пуста" });

  // Цены и названия берём только с сервера.
  const lines = [];
  for (const it of items) {
    const p = byId[it && it.id];
    const qty = Number.parseInt(it && it.qty, 10);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return res.status(400).json({ error: "Некорректный товар в корзине" });
    }
    const color = (p.colors || []).find((c) => c.id === it.color);
    lines.push({ p, qty, colorName: color ? color.name : null });
  }

  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const shippingAmount = subtotal >= STORE.freeShippingFrom ? 0 : STORE.shippingPrice;
  // Пока ключ Stripe не задан — демо-режим: деньги не списываются, сайт показывает тестовую оплату.
  if (!key) return res.status(200).json({ demo: true, total: subtotal + shippingAmount });

  const site = (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, "");

  const form = new URLSearchParams();
  form.append("mode", "payment");
  form.append("locale", "ru");
  form.append("success_url", `${site}/?status=success&session_id={CHECKOUT_SESSION_ID}`);
  form.append("cancel_url", `${site}/?status=cancel`);
  form.append("phone_number_collection[enabled]", "true");
  form.append("shipping_address_collection[allowed_countries][0]", "KZ");

  lines.forEach((l, i) => {
    const k = `line_items[${i}]`;
    form.append(`${k}[quantity]`, String(l.qty));
    form.append(`${k}[price_data][currency]`, STORE.currency);
    form.append(`${k}[price_data][unit_amount]`, String(l.p.price * 100)); // в минимальных единицах (тиыны)
    form.append(`${k}[price_data][product_data][name]`, l.colorName ? `${l.p.name} — ${l.colorName}` : l.p.name);
    form.append(`${k}[price_data][product_data][description]`, l.p.short);
  });

  const s = "shipping_options[0][shipping_rate_data]";
  form.append(`${s}[type]`, "fixed_amount");
  form.append(`${s}[display_name]`, shippingAmount ? "Доставка 1–3 дня" : "Бесплатная доставка 1–3 дня");
  form.append(`${s}[fixed_amount][amount]`, String(shippingAmount * 100));
  form.append(`${s}[fixed_amount][currency]`, STORE.currency);

  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("Stripe error:", data.error);
      return res.status(502).json({ error: "Платёжный сервис вернул ошибку. Попробуйте позже." });
    }
    return res.status(200).json({ url: data.url });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "Не удалось связаться с платёжным сервисом" });
  }
};
