(function () {
  const { STORE, CATEGORIES, PRODUCTS } = window.SHOP;
  const $ = (id) => document.getElementById(id);
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const CART_KEY = "forma-cart-v1";
  const MAX_QTY = 20;

  const money = (n) => n.toLocaleString("ru-RU").replace(/,/g, " ") + " " + STORE.currencySymbol;
  const catName = (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || "";
  const colorOf = (p, colorId) => (p.colors || []).find((c) => c.id === colorId);

  // ---------- Корзина ----------
  let cart = load();
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return raw.filter((l) => byId[l.id]);
    } catch { return []; }
  }
  function save() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
    renderCart();
  }
  function addToCart(id, color, qty) {
    const line = cart.find((l) => l.id === id && l.color === color);
    if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
    else cart.push({ id, color, qty });
    save();
    const btn = $("cartOpen");
    btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
    toast(`✓ «${byId[id].name}» в корзине`, { label: "Открыть корзину", run: () => open("cartOverlay") });
  }
  const subtotal = () => cart.reduce((s, l) => s + byId[l.id].price * l.qty, 0);
  const shipping = (sub) => (sub === 0 || sub >= STORE.freeShippingFrom ? 0 : STORE.shippingPrice);

  // ---------- Витрина ----------
  let activeCat = "all";
  function renderFilters() {
    $("filters").innerHTML = CATEGORIES.map(
      (c) => `<button class="chip ${c.id === activeCat ? "active" : ""}" role="tab" aria-selected="${c.id === activeCat}" data-cat="${c.id}">${c.name}</button>`
    ).join("");
  }
  function renderGrid() {
    const list = PRODUCTS.filter((p) => activeCat === "all" || p.category === activeCat);
    $("grid").innerHTML = list.map((p, i) => `
      <article class="card" data-id="${p.id}" style="animation-delay:${i * 40}ms" tabindex="0" aria-label="${p.name}, ${money(p.price)}">
        <div class="card__art">
          ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ""}
          ${window.productArt(p)}
        </div>
        <div class="card__info">
          <h3 class="card__name">${p.name}</h3>
          <p class="card__short">${p.short}</p>
          ${p.colors && p.colors.length > 1 ? `<div class="dots" aria-label="Цвета: ${p.colors.map((c) => c.name).join(", ")}">${p.colors.map((c) => `<span class="dot" style="background:${c.hex}" title="${c.name}"></span>`).join("")}<span class="dots__note">${p.colors.length} цвета</span></div>` : ""}
          <div class="card__price">${money(p.price)}</div>
          <div class="card__actions">
            <button class="btn btn--primary btn--full" data-quick="${p.id}">В корзину</button>
            <button class="btn btn--ghost btn--full" data-more="${p.id}">Подробнее</button>
          </div>
        </div>
      </article>`).join("");
  }
  function renderHero() {
    const picks = ["case-matte", "earbuds", "powerbank", "charger-30"].map((id) => byId[id]);
    $("heroVisual").innerHTML = picks.map((p) => window.productArt(p)).join("");
  }

  $("filters").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    activeCat = b.dataset.cat;
    renderFilters(); renderGrid();
  });
  $("grid").addEventListener("click", (e) => {
    const quick = e.target.closest("[data-quick]");
    if (quick) {
      e.stopPropagation();
      const p = byId[quick.dataset.quick];
      addToCart(p.id, p.colors ? p.colors[0].id : null, 1);
      return;
    }
    const card = e.target.closest(".card");
    if (card) openProduct(card.dataset.id);
  });
  $("grid").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.classList.contains("card")) openProduct(e.target.dataset.id);
  });

  // ---------- Карточка товара ----------
  let pm = { p: null, color: null, qty: 1 };
  function openProduct(id) {
    const p = byId[id];
    pm = { p, color: p.colors ? p.colors[0].id : null, qty: 1 };
    $("pmCat").textContent = catName(p.category);
    $("pmName").textContent = p.name;
    $("pmPrice").textContent = money(p.price);
    $("pmDesc").textContent = p.description;
    $("pmColorsWrap").hidden = !p.colors || p.colors.length < 2;
    renderPm();
    open("productOverlay");
  }
  function renderPm() {
    const { p, color, qty } = pm;
    const c = colorOf(p, color);
    $("pmArt").innerHTML = window.productArt(p, c && c.hex);
    $("pmQty").textContent = qty;
    if (p.colors) {
      $("pmColorName").textContent = c.name;
      $("pmColors").innerHTML = p.colors.map((x) =>
        `<button class="swatch ${x.id === color ? "active" : ""}" style="background:${x.hex}" data-color="${x.id}" aria-label="${x.name}" aria-pressed="${x.id === color}"></button>`
      ).join("");
    }
  }
  $("pmColors").addEventListener("click", (e) => {
    const s = e.target.closest("[data-color]");
    if (s) { pm.color = s.dataset.color; renderPm(); }
  });
  $("pmMinus").onclick = () => { pm.qty = Math.max(1, pm.qty - 1); renderPm(); };
  $("pmPlus").onclick = () => { pm.qty = Math.min(MAX_QTY, pm.qty + 1); renderPm(); };
  $("pmAdd").onclick = () => { addToCart(pm.p.id, pm.color, pm.qty); close("productOverlay"); };

  // ---------- Отрисовка корзины ----------
  function renderCart() {
    const count = cart.reduce((s, l) => s + l.qty, 0);
    $("cartCount").textContent = count;
    $("cartCount").hidden = count === 0;

    if (!cart.length) {
      $("cartItems").innerHTML = `<div class="empty"><div class="empty__icon">🛍</div><p>В корзине пока ничего нет.<br/>Выберите товар и нажмите «В корзину».</p><a href="#catalog" class="btn btn--primary" data-close>Выбрать товар</a></div>`;
      $("cartFoot").hidden = true;
      return;
    }
    $("cartFoot").hidden = false;
    $("cartItems").innerHTML = cart.map((l, i) => {
      const p = byId[l.id], c = colorOf(p, l.color);
      return `<div class="line">
        <div class="line__art">${window.productArt(p, c && c.hex)}</div>
        <div>
          <div class="line__name">${p.name}</div>
          <div class="line__meta">${c ? c.name + " · " : ""}${money(p.price)}</div>
          <div class="qty qty--sm">
            <button class="qty__btn" data-dec="${i}" aria-label="Меньше">−</button>
            <span class="qty__val">${l.qty}</span>
            <button class="qty__btn" data-inc="${i}" aria-label="Больше">+</button>
          </div>
        </div>
        <div class="line__right">
          <span class="line__price">${money(p.price * l.qty)}</span>
          <button class="btn btn--ghost btn--xs" data-rm="${i}">✕ Убрать</button>
        </div>
      </div>`;
    }).join("");

    const sub = subtotal(), ship = shipping(sub);
    $("sumItems").textContent = money(sub);
    $("sumShip").textContent = ship ? money(ship) : "Бесплатно";
    $("sumTotal").textContent = money(sub + ship);
    $("checkoutLabel").textContent = `Оплатить картой ${money(sub + ship)}`;
    const left = STORE.freeShippingFrom - sub;
    $("shipFill").style.width = Math.min(100, (sub / STORE.freeShippingFrom) * 100) + "%";
    $("shipNote").textContent = left > 0 ? `Добавьте ещё ${money(left)} до бесплатной доставки` : "Доставка бесплатная 🎉";
  }
  $("cartItems").addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.inc) cart[+t.dataset.inc].qty = Math.min(MAX_QTY, cart[+t.dataset.inc].qty + 1);
    else if (t.dataset.dec) {
      const l = cart[+t.dataset.dec];
      l.qty > 1 ? l.qty-- : cart.splice(+t.dataset.dec, 1);
    } else if (t.dataset.rm) cart.splice(+t.dataset.rm, 1);
    else return;
    save();
  });

  // ---------- Оплата картой (Stripe Checkout) ----------
  $("checkoutBtn").onclick = async () => {
    const btn = $("checkoutBtn");
    const label = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = "Переходим к оплате…";
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      if (res.status === 404 || res.status === 405) throw new TypeError("no api");
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.demo) {
        $("demoTotal").textContent = money(data.total);
        close("cartOverlay"); open("demoPayOverlay");
        btn.disabled = false; btn.innerHTML = label;
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.error || "Не удалось начать оплату");
      window.location.href = data.url;
    } catch (err) {
      const offline = location.protocol === "file:" || err instanceof TypeError;
      toast(offline ? "Оплата заработает после публикации сайта на Vercel" : err.message);
      btn.disabled = false;
      btn.innerHTML = label;
    }
  };

  $("demoPayBtn").onclick = () => {
    const b = $("demoPayBtn");
    b.disabled = true; b.textContent = "Проводим оплату…";
    setTimeout(() => {
      b.disabled = false; b.textContent = "Оплатить";
      close("demoPayOverlay");
      cart = []; save(); open("successOverlay");
    }, 1500);
  };

  // ---------- Окна ----------
  function open(id) { $(id).hidden = false; document.body.classList.add("locked"); }
  function close(id) {
    $(id).hidden = true;
    if (![...document.querySelectorAll(".overlay")].some((o) => !o.hidden)) document.body.classList.remove("locked");
  }
  document.querySelectorAll(".overlay").forEach((o) => {
    o.addEventListener("click", (e) => {
      if (e.target === o || e.target.closest("[data-close]")) close(o.id);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".overlay:not([hidden])").forEach((o) => close(o.id));
  });
  $("cartOpen").onclick = () => open("cartOverlay");

  let toastTimer;
  window.shopToast = toast;
  function toast(msg, action) {
    const t = $("toast");
    t.textContent = msg;
    if (action) {
      const b = document.createElement("button");
      b.className = "toast__action";
      b.textContent = action.label;
      b.onclick = () => { t.classList.remove("show"); action.run(); };
      t.appendChild(b);
    }
    t.classList.toggle("toast--action", !!action);
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), action ? 6000 : 4000);
  }

  // Телефон для помощи
  const telHref = "tel:" + STORE.phone.replace(/[^\d+]/g, "");
  document.querySelectorAll("[data-phone]").forEach((a) => (a.href = telHref));
  document.querySelectorAll("[data-phone-text]").forEach((s) => (s.textContent = STORE.phone));

  window.addEventListener("scroll", () => {
    document.querySelector(".header").classList.toggle("scrolled", scrollY > 8);
  }, { passive: true });

  // ---------- Возврат со страницы оплаты ----------
  const params = new URLSearchParams(location.search);
  if (params.get("status") === "success") {
    cart = []; save(); open("successOverlay");
    history.replaceState(null, "", location.pathname);
  } else if (params.get("status") === "cancel") {
    toast("Оплата отменена — товары остались в корзине");
    history.replaceState(null, "", location.pathname);
  }

  renderHero(); renderFilters(); renderGrid(); renderCart();
})();
