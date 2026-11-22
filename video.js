// Мини-видео «Как пользоваться сайтом»: анимированные сцены + озвучка (голос Милена).
// Анимация синхронизирована со звуком через audio.currentTime, поэтому пауза работает честно.
(function () {
  const root = document.getElementById("vt");
  if (!root) return;
  const { PRODUCTS } = window.SHOP;
  const P = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const money = (n) => n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";
  const art = (id) => window.productArt(P[id]);
  const $ = (s) => root.querySelector(s);

  const head = (n) => `<div class="vt-head"><b class="vt-logo">FORMA</b>
    <span class="vt-cartbtn" data-t="cart">🛍 Корзина <i class="vt-badge" ${n ? "" : "hidden"}>${n || 1}</i></span></div>`;
  const card = (id, i) => `<div class="vt-card" data-c="${i}">
      <div class="vt-card__art">${art(id)}</div>
      <b>${P[id].name}</b><span class="vt-price">${money(P[id].price)}</span>
      <span class="vt-btn vt-btn--dark" data-t="add${i}">В корзину</span>
      <span class="vt-btn" data-t="more${i}">Подробнее</span>
    </div>`;
  const grid = () => `<div class="vt-title">Наши товары</div><div class="vt-grid">${["case-matte", "charger-30", "powerbank"].map(card).join("")}</div>`;
  const drawer = (open) => `<div class="vt-drawer ${open ? "open" : ""}">
      <b class="vt-drawer__title">Ваша корзина</b>
      <div class="vt-line"><div class="vt-line__art">${art("case-matte")}</div>
        <div><b>${P["case-matte"].name}</b>
        <div class="vt-qty"><span>−</span><i class="vt-qn">1</i><span data-t="plus">+</span></div></div>
        <b class="vt-lp">${money(P["case-matte"].price)}</b></div>
      <div class="vt-total"><span>Итого</span><b class="vt-sum">${money(P["case-matte"].price + 1500)}</b></div>
      <span class="vt-btn vt-btn--dark vt-btn--wide" data-t="pay1">💳 Оплатить картой</span>
    </div>`;

  const setQty = (q) => {
    $(".vt-qn").textContent = q;
    $(".vt-lp").textContent = money(P["case-matte"].price * q);
    $(".vt-sum").textContent = money(P["case-matte"].price * q + (P["case-matte"].price * q >= 20000 ? 0 : 1500));
    $(".vt-badge").textContent = q;
    pop(".vt-qn"); pop(".vt-badge");
  };
  const pop = (s) => { const el = $(s); el.classList.remove("vt-pop"); void el.offsetWidth; el.classList.add("vt-pop"); };
  const toast = (t) => { const el = document.createElement("div"); el.className = "vt-toast"; el.textContent = t; $(".vt-stage__inner").appendChild(el); };

  const SCENES = [
    {
      sub: "Здравствуйте! Это магазин FORMA. Сейчас я покажу, как купить у нас чехол или зарядку. Это очень просто.",
      html: () => `${head(0)}<div class="vt-intro"><div class="vt-arts">${["case-matte", "earbuds", "powerbank", "charger-30"].map((id, i) => `<div style="animation-delay:${0.3 + i * 0.25}s">${art(id)}</div>`).join("")}</div>
        <div class="vt-intro__h">Как купить за 1 минуту</div></div>`,
      steps: [],
    },
    {
      sub: "Шаг первый. Пролистайте страницу вниз, до раздела «Наши товары», и выберите то, что понравилось. Чтобы узнать подробности, нажмите «Подробнее».",
      step: 1,
      html: () => head(0) + grid(),
      steps: [
        { t: 0.6, go: "more1" },
        { t: 7.6, go: "more0" },
        { t: 9.2, click: () => $('[data-c="0"]').classList.add("vt-focus") },
      ],
    },
    {
      sub: "Шаг второй. Нажмите чёрную кнопку «В корзину». Товар сразу попадёт в корзину, а справа вверху появится цифра.",
      step: 2,
      html: () => head(0) + grid(),
      steps: [
        { t: 1.6, go: "add0" },
        { t: 3.6, click: () => { $(".vt-badge").hidden = false; pop(".vt-badge"); toast("✓ «Чехол мягкий» в корзине"); } },
        { t: 5.2, go: "cart" },
      ],
    },
    {
      sub: "Шаг третий. Нажмите кнопку «Корзина» справа вверху. Здесь можно поменять количество кнопками плюс и минус, или убрать товар.",
      step: 3,
      html: () => head(1) + grid() + drawer(false),
      steps: [
        { t: 0.3, go: "cart" },
        { t: 1.6, click: () => $(".vt-drawer").classList.add("open") },
        { t: 4.4, go: "plus" },
        { t: 5.8, click: () => setQty(2) },
      ],
    },
    {
      sub: "Шаг четвёртый. Нажмите «Оплатить картой», а затем «Оплатить». Готово! Вы увидите надпись: «Спасибо за заказ».",
      step: 4,
      html: () => head(1) + grid() + drawer(true),
      steps: [
        { t: 0, run: () => { setQty(2); } },
        { t: 0.4, go: "pay1" },
        { t: 2.4, click: () => {
          $(".vt-stage__inner").insertAdjacentHTML("beforeend", `<div class="vt-modal" id="vtPay"><span class="vt-demo">Оплата картой</span>
            <div class="vt-bank"><span class="vt-chip"></span><span>4242 4242 4242 4242</span></div>
            <span class="vt-btn vt-btn--dark vt-btn--wide" data-t="pay2">Оплатить</span></div>`);
        } },
        { t: 3.6, go: "pay2" },
        { t: 5.2, click: () => {
          $("#vtPay").innerHTML = `<div class="vt-check">✓</div><b class="vt-ok">Спасибо за заказ!</b><span>Оплата прошла успешно</span>`;
          $("#vtPay").classList.add("vt-modal--ok");
        } },
      ],
    },
    {
      sub: "А ещё в разделе «Свой чехол» можно придумать собственный дизайн. Если что-то не получается, позвоните нам, и мы поможем. Приятных покупок!",
      html: () => `${head(0)}<div class="vt-outro">
        <div class="vt-outro__item"><div class="vt-case"><span>Галина</span></div><b>Свой чехол</b></div>
        <div class="vt-outro__item"><div class="vt-phone">📞</div><b>Поможем по телефону</b></div>
        </div><div class="vt-intro__h vt-intro__h--low">Приятных покупок! 💛</div>`,
      steps: [],
    },
  ];

  const audio = new Audio();
  audio.preload = "auto";
  let cur = -1, stepIdx = 0, raf = 0;

  // Сегменты прогресса
  $(".vt-segs").innerHTML = SCENES.map((_, i) => `<button class="vt-seg" data-i="${i}" aria-label="Часть ${i + 1}"><i></i></button>`).join("");

  function moveCursor(sel) {
    const target = $(`[data-t="${sel}"]`), stage = $(".vt-stage__inner");
    if (!target) return;
    const a = stage.getBoundingClientRect(), b = target.getBoundingClientRect();
    const c = $(".vt-cursor");
    c.hidden = false;
    c.style.left = ((b.left + b.width / 2 - a.left) / a.width) * 100 + "%";
    c.style.top = ((b.top + b.height / 2 - a.top) / a.height) * 100 + "%";
  }
  function clickFx() {
    const c = $(".vt-cursor");
    c.classList.remove("vt-click"); void c.offsetWidth; c.classList.add("vt-click");
  }

  function show(i) {
    cur = i; stepIdx = 0;
    const s = SCENES[i];
    $(".vt-stage__inner").innerHTML = s.html() + `<div class="vt-cursor" hidden></div>`;
    $(".vt-step").textContent = s.step ? `Шаг ${s.step} из 4` : "";
    $(".vt-step").hidden = !s.step;
    $(".vt-sub").textContent = s.sub;
    root.querySelectorAll(".vt-seg").forEach((el, k) => {
      el.classList.toggle("done", k < i);
      el.querySelector("i").style.width = k < i ? "100%" : "0%";
    });
    audio.src = `audio/s${i + 1}.m4a`;
    play();
  }
  function play() {
    root.classList.remove("vt--idle", "vt--end", "vt--paused");
    root.classList.add("vt--on");
    audio.play().catch(() => { root.classList.add("vt--paused"); });
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }
  function pause() {
    audio.pause();
    root.classList.add("vt--paused");
  }
  function tick() {
    const s = SCENES[cur], t = audio.currentTime;
    while (stepIdx < s.steps.length && s.steps[stepIdx].t <= t) {
      const st = s.steps[stepIdx++];
      if (st.go) moveCursor(st.go);
      if (st.run) st.run();
      if (st.click) { clickFx(); st.click(); }
    }
    if (audio.duration) root.querySelectorAll(".vt-seg i")[cur].style.width = (t / audio.duration) * 100 + "%";
    if (!audio.paused) raf = requestAnimationFrame(tick);
  }
  audio.addEventListener("play", () => { root.classList.remove("vt--paused"); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); });
  audio.addEventListener("ended", () => {
    tick();
    if (cur < SCENES.length - 1) setTimeout(() => show(cur + 1), 500);
    else { root.classList.add("vt--end"); root.classList.remove("vt--on"); }
  });

  $(".vt-start").onclick = () => show(0);
  $(".vt-replay").onclick = () => show(0);
  $(".vt-toggle").onclick = () => {
    if (cur < 0) return show(0);
    audio.paused ? play() : pause();
  };
  $(".vt-stage").addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    if (root.classList.contains("vt--on")) audio.paused ? play() : pause();
  });
  $(".vt-segs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) show(+b.dataset.i);
  });

  // Первый кадр-обложка
  $(".vt-stage__inner").innerHTML = SCENES[0].html();
  $(".vt-sub").textContent = "Нажмите большую кнопку, чтобы посмотреть видео со звуком.";

  // Для записи видео в файл (record.html)
  window.VT = { SCENES, root };
})();
