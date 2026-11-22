// Serverless-функция Vercel: приём дизайнов чехлов от покупателей и выдача одобренных в галерею.
// Нужны переменные окружения:
//   SUPABASE_URL              — https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY — секретный ключ (Project Settings → API). Только на сервере!
// Таблица и хранилище создаются скриптом supabase/schema.sql.
const crypto = require("crypto");

const BUCKET = "designs";
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

function cfg() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}
const headers = (key, extra) => ({ apikey: key, Authorization: `Bearer ${key}`, ...extra });
const clean = (v, max) => (typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max) : "");

module.exports = async function handler(req, res) {
  const sb = cfg();
  if (!sb) return res.status(500).json({ error: "Галерея ещё не настроена: не заданы ключи Supabase" });

  if (req.method === "GET") {
    const q = "select=id,title,author,image_path,created_at&status=eq.approved&order=created_at.desc&limit=48";
    const r = await fetch(`${sb.url}/rest/v1/case_designs?${q}`, { headers: headers(sb.key) }).catch(() => null);
    if (!r || !r.ok) return res.status(502).json({ error: "Не удалось загрузить галерею" });
    const rows = await r.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({
      designs: rows.map((d) => ({
        id: d.id,
        title: d.title,
        author: d.author,
        image_url: `${sb.url}/storage/v1/object/public/${BUCKET}/${d.image_path}`,
      })),
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Метод не поддерживается" });
  }

  const body = req.body || {};
  const title = clean(body.title, 60);
  const author = clean(body.author, 60);
  const email = clean(body.email, 120);
  if (!title || !author) return res.status(400).json({ error: "Укажите название и имя" });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Некорректный email" });

  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(body.image || "");
  if (!m) return res.status(400).json({ error: "Нет изображения дизайна" });
  const png = Buffer.from(m[1], "base64");
  if (png.length > MAX_IMAGE_BYTES) return res.status(413).json({ error: "Изображение слишком большое" });
  if (png.slice(0, 8).toString("hex") !== "89504e470d0a1a0a") return res.status(400).json({ error: "Неверный формат изображения" });

  const c = body.config && typeof body.config === "object" ? body.config : {};
  const config = {
    color: /^#[0-9a-f]{6}$/i.test(c.color) ? c.color : null,
    pattern: clean(c.pattern, 20),
    font: clean(c.font, 20),
    text: clean(c.text, 24),
    hasImage: !!c.hasImage,
  };

  const id = crypto.randomUUID();
  const path = `${id}.png`;

  try {
    const up = await fetch(`${sb.url}/storage/v1/object/${BUCKET}/${path}`, {
      method: "POST",
      headers: headers(sb.key, { "Content-Type": "image/png", "x-upsert": "false" }),
      body: png,
    });
    if (!up.ok) {
      console.error("Storage error:", await up.text());
      return res.status(502).json({ error: "Не удалось сохранить изображение" });
    }

    const ins = await fetch(`${sb.url}/rest/v1/case_designs`, {
      method: "POST",
      headers: headers(sb.key, { "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify({ id, title, author, email: email || null, image_path: path, config }),
    });
    if (!ins.ok) {
      console.error("DB error:", await ins.text());
      return res.status(502).json({ error: "Не удалось сохранить дизайн" });
    }
    return res.status(201).json({ ok: true, id });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "Сервис временно недоступен" });
  }
};
