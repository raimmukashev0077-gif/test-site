// Студия: конструктор дизайна чехла, отправка дизайна и галерея покупателей.
(function () {
  const $ = (id) => document.getElementById(id);
  const toast = (m) => (window.shopToast ? window.shopToast(m) : alert(m));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const COLORS = ["#f2f0eb", "#d8cbb5", "#c98f74", "#a9b5a0", "#9fb4c7", "#e8b9c0", "#3a3a3c", "#1d1d1f"];
  const PATTERNS = [
    { id: "none", name: "Нет" },
    { id: "dots", name: "Точки" },
    { id: "stripes", name: "Полосы" },
    { id: "grid", name: "Клетка" },
    { id: "waves", name: "Волны" },
  ];
  const FONTS = [
    { id: "sans", name: "Гротеск", css: "Helvetica, Arial, sans-serif", weight: 700 },
    { id: "serif", name: "Антиква", css: "Georgia, 'Times New Roman', serif", weight: 400 },
    { id: "mono", name: "Моно", css: "Menlo, Consolas, monospace", weight: 500 },
  ];

  const state = { color: COLORS[1], pattern: "none", image: null, imgW: 1, imgH: 1, imgScale: 100, imgY: 55, text: "", font: "sans", textY: 80 };

  function isDark(hex) {
    const n = parseInt(hex.slice(1), 16);
    return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 140;
  }

  function patternDef(id, ink) {
    const s = `stroke="${ink}" fill="none"`;
    switch (id) {
      case "dots": return `<pattern id="pt" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="3" fill="${ink}"/></pattern>`;
      case "stripes": return `<pattern id="pt" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="18" ${s} stroke-width="6"/></pattern>`;
      case "grid": return `<pattern id="pt" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" ${s} stroke-width="2"/></pattern>`;
      case "waves": return `<pattern id="pt" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q10 0 20 10 T40 10" ${s} stroke-width="2.5"/></pattern>`;
      default: return "";
    }
  }

  // Чехол в координатах 200×400
  function caseSVG(width, height) {
    const dark = isDark(state.color);
    const ink = dark ? "rgba(255,255,255,.22)" : "rgba(0,0,0,.14)";
    const font = FONTS.find((f) => f.id === state.font);
    let imageLayer = "";
    if (state.image) {
      const w = 150 * (state.imgScale / 100);
      const h = w * (state.imgH / state.imgW);
      const cy = 40 + (state.imgY / 100) * 320;
      imageLayer = `<image href="${state.image}" x="${100 - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
    }
    let textLayer = "";
    if (state.text.trim()) {
      const ty = 40 + (state.textY / 100) * 330;
      const size = Math.max(14, Math.min(34, 300 / Math.max(state.text.length, 1)));
      textLayer = `<text x="100" y="${ty}" text-anchor="middle" dominant-baseline="middle" font-family="${font.css}" font-weight="${font.weight}" font-size="${size}" fill="${dark ? "#ffffff" : "#1d1d1f"}" letter-spacing="1">${esc(state.text)}</text>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" ${width ? `width="${width}" height="${height}"` : ""}>
      <defs><clipPath id="cc"><rect x="10" y="10" width="180" height="380" rx="44"/></clipPath>${patternDef(state.pattern, ink)}</defs>
      <g clip-path="url(#cc)">
        <rect width="200" height="400" fill="${state.color}"/>
        ${state.pattern !== "none" ? `<rect width="200" height="400" fill="url(#pt)"/>` : ""}
        ${imageLayer}${textLayer}
      </g>
      <rect x="10" y="10" width="180" height="380" rx="44" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="2"/>
      <rect x="24" y="24" width="78" height="86" rx="24" fill="rgba(0,0,0,.18)"/>
      <circle cx="47" cy="48" r="15" fill="#1d1d1f"/><circle cx="78" cy="84" r="15" fill="#1d1d1f"/>
      <circle cx="47" cy="48" r="5" fill="#3d3d44"/><circle cx="78" cy="84" r="5" fill="#3d3d44"/>
      <circle cx="80" cy="44" r="5" fill="#f4e7c2"/>
    </svg>`;
  }

  function render() {
    $("dzPreview").innerHTML = caseSVG();
    $("dzColors").innerHTML = COLORS.map((c) => `<button type="button" class="swatch ${c === state.color ? "active" : ""}" style="background:${c}" data-color="${c}" aria-label="Цвет ${c}" aria-pressed="${c === state.color}"></button>`).join("") +
      `<label class="swatch swatch--custom" title="Свой цвет"><input type="color" id="dzCustomColor" value="${state.color}" aria-label="Свой цвет"/></label>`;
    $("dzPatterns").innerHTML = PATTERNS.map((p) => `<button type="button" class="seg__btn ${p.id === state.pattern ? "active" : ""}" data-pattern="${p.id}">${p.name}</button>`).join("");
    $("dzFonts").innerHTML = FONTS.map((f) => `<button type="button" class="seg__btn ${f.id === state.font ? "active" : ""}" data-font="${f.id}" style="font-family:${f.css}">${f.name}</button>`).join("");
    $("dzImageControls").hidden = !state.image;
    $("dzFileRemove").hidden = !state.image;
    $("dzTextControls").hidden = !state.text.trim();
  }
  const preview = () => { $("dzPreview").innerHTML = caseSVG(); };

  $("dzColors").addEventListener("click", (e) => {
    const b = e.target.closest("[data-color]");
    if (b) { state.color = b.dataset.color; render(); }
  });
  $("dzColors").addEventListener("input", (e) => {
    if (e.target.id === "dzCustomColor") { state.color = e.target.value; preview(); }
  });
  $("dzColors").addEventListener("change", (e) => { if (e.target.id === "dzCustomColor") render(); });
  $("dzPatterns").addEventListener("click", (e) => {
    const b = e.target.closest("[data-pattern]");
    if (b) { state.pattern = b.dataset.pattern; render(); }
  });
  $("dzFonts").addEventListener("click", (e) => {
    const b = e.target.closest("[data-font]");
    if (b) { state.font = b.dataset.font; render(); }
  });
  $("dzText").addEventListener("input", (e) => {
    const had = !!state.text.trim();
    state.text = e.target.value;
    had !== !!state.text.trim() ? render() : preview();
  });
  [["dzImgScale", "imgScale"], ["dzImgY", "imgY"], ["dzTextY", "textY"]].forEach(([id, key]) =>
    $(id).addEventListener("input", (e) => { state[key] = +e.target.value; preview(); }));

  // Загрузка картинки: уменьшаем до 900px, чтобы отправка была лёгкой
  $("dzFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return toast("Подходят PNG, JPG или WEBP");
    if (file.size > 15 * 1024 * 1024) return toast("Файл больше 15 МБ");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 900 / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      state.image = cv.toDataURL(file.type === "image/jpeg" ? "image/jpeg" : "image/png", 0.9);
      state.imgW = cv.width; state.imgH = cv.height;
      URL.revokeObjectURL(url);
      render();
    };
    img.onerror = () => toast("Не удалось открыть изображение");
    img.src = url;
  });
  $("dzFileRemove").onclick = () => { state.image = null; render(); };

  // Превращаем SVG в PNG для отправки
  function exportPNG() {
    return new Promise((resolve, reject) => {
      const blob = new Blob([caseSVG(400, 800)], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement("canvas");
        cv.width = 400; cv.height = 800;
        cv.getContext("2d").drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        try { resolve(cv.toDataURL("image/png")); } catch (e) { reject(new Error("Не удалось подготовить изображение")); }
      };
      img.onerror = () => reject(new Error("Не удалось подготовить изображение"));
      img.src = url;
    });
  }

  $("dzForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = $("dzTitle").value.trim();
    const author = $("dzAuthor").value.trim();
    const email = $("dzEmail").value.trim();
    if (!title || !author) return toast("Укажите название дизайна и ваше имя");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast("Проверьте email");

    const btn = $("dzSubmit");
    btn.disabled = true; btn.textContent = "Отправляем…";
    try {
      const image = await exportPNG();
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, author, email, image,
          config: { color: state.color, pattern: state.pattern, text: state.text, font: state.font, hasImage: !!state.image },
        }),
      });
      if (res.status === 404 || res.status === 405) throw new TypeError("no api");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Не удалось отправить дизайн");
      toast("Спасибо! Дизайн отправлен на проверку");
      $("dzTitle").value = "";
    } catch (err) {
      toast(err instanceof TypeError ? "Отправка заработает после публикации сайта и подключения Supabase" : err.message);
    } finally {
      btn.disabled = false; btn.textContent = "Отправить нам";
    }
  });

  // Галерея одобренных дизайнов
  async function loadGallery() {
    const el = $("dzGallery");
    let items = [];
    try {
      const res = await fetch("/api/designs");
      if (res.ok) items = (await res.json()).designs || [];
    } catch {}
    if (!items.length) {
      el.innerHTML = `<p class="gallery__empty">Здесь появятся дизайны покупателей. Станьте первым!</p>`;
      return;
    }
    el.innerHTML = items.map((d) => `
      <figure class="gcard">
        <div class="gcard__img"><img src="${esc(d.image_url)}" alt="${esc(d.title)}" loading="lazy"/></div>
        <figcaption><b>${esc(d.title)}</b><span>${esc(d.author)}</span></figcaption>
      </figure>`).join("");
  }

  render();
  loadGallery();
})();
