// Единый каталог: используется и витриной (браузер), и сервером оплаты (api/checkout.js).
// Цены указаны в тенге. Сервер берёт цену только отсюда — подменить её из браузера нельзя.
(function (root) {
  const STORE = {
    name: "FORMA",
    currency: "kzt", // валюта Stripe (kzt, rub, usd, eur ...)
    currencySymbol: "₸",
    freeShippingFrom: 20000,
    shippingPrice: 1500,
    phone: "+7 (700) 000-00-00", // ← замените на свой номер для помощи покупателям
  };

  const CATEGORIES = [
    { id: "all", name: "Все" },
    { id: "cases", name: "Чехлы" },
    { id: "protection", name: "Защита" },
    { id: "power", name: "Зарядка" },
    { id: "audio", name: "Аудио" },
    { id: "extras", name: "Аксессуары" },
  ];

  const PRODUCTS = [
    {
      id: "case-matte",
      name: "Чехол мягкий",
      category: "cases",
      art: "case",
      price: 6990,
      badge: "Хит",
      short: "Мягкий на ощупь, не скользит в руке",
      description:
        "Тонкий силиконовый чехол с бархатистым покрытием. Внутри — микрофибра, которая бережёт корпус. Бортики над камерой и экраном защищают при падении.",
      colors: [
        { id: "sand", name: "Песок", hex: "#d8cbb5" },
        { id: "graphite", name: "Графит", hex: "#3a3a3c" },
        { id: "sage", name: "Шалфей", hex: "#a9b5a0" },
        { id: "clay", name: "Глина", hex: "#c98f74" },
      ],
    },
    {
      id: "case-clear",
      name: "Прозрачный чехол",
      category: "cases",
      art: "case-clear",
      price: 8490,
      short: "Видно цвет телефона, не желтеет",
      description:
        "Прозрачный поликарбонат с покрытием против пожелтения. Встроенное магнитное кольцо совместимо с MagSafe-зарядками и держателями.",
      colors: [{ id: "clear", name: "Прозрачный", hex: "#e9eef2" }],
    },
    {
      id: "glass",
      name: "Защитное стекло",
      category: "protection",
      art: "glass",
      price: 3990,
      short: "Бережёт экран от царапин и трещин",
      description:
        "Закалённое стекло твёрдостью 9H толщиной 0,33 мм. Олеофобное покрытие против отпечатков. В комплекте рамка для идеально ровной поклейки.",
    },
    {
      id: "charger-30",
      name: "Быстрая зарядка",
      category: "power",
      art: "charger",
      price: 11990,
      badge: "Новинка",
      short: "Заряжает телефон наполовину за 30 минут",
      description:
        "Сетевое зарядное устройство на нитриде галлия. До 50% заряда за 30 минут. Размер почти как у стандартной зарядки 5W.",
      colors: [
        { id: "white", name: "Белый", hex: "#f2f2f0" },
        { id: "black", name: "Чёрный", hex: "#2b2b2d" },
      ],
    },
    {
      id: "cable-c",
      name: "Провод для зарядки 1,5 м",
      category: "power",
      art: "cable",
      price: 4490,
      short: "Прочный, не перетирается",
      description:
        "Прочный кабель в нейлоновой оплётке. Поддерживает быструю зарядку до 60W и передачу данных. Длина 1,5 м.",
      colors: [
        { id: "white", name: "Белый", hex: "#f2f2f0" },
        { id: "black", name: "Чёрный", hex: "#2b2b2d" },
      ],
    },
    {
      id: "wireless-pad",
      name: "Беспроводная зарядка",
      category: "power",
      art: "pad",
      price: 14990,
      short: "Просто положите телефон — и он заряжается",
      description:
        "Магнитная беспроводная зарядка в алюминиевом корпусе. Сама встаёт на место, мощность до 15W. Кабель USB-C в комплекте.",
    },
    {
      id: "powerbank",
      name: "Переносной аккумулятор",
      category: "power",
      art: "powerbank",
      price: 19990,
      badge: "Хит",
      short: "Зарядит телефон в дороге 2 раза",
      description:
        "Тонкий магнитный аккумулятор на 10 000 мАч. Крепится к телефону и заряжает без проводов, а через USB-C — до 20W.",
      colors: [
        { id: "white", name: "Белый", hex: "#f2f2f0" },
        { id: "graphite", name: "Графит", hex: "#3a3a3c" },
      ],
    },
    {
      id: "earbuds",
      name: "Беспроводные наушники",
      category: "audio",
      art: "earbuds",
      price: 24990,
      short: "Без проводов, глушат шум улицы",
      description:
        "Беспроводные наушники с активным шумоподавлением и режимом прозрачности. До 7 часов на одном заряде и до 30 — с кейсом.",
    },
    {
      id: "stand",
      name: "Подставка на стол",
      category: "extras",
      art: "stand",
      price: 9990,
      short: "Удобно смотреть видео и звонить",
      description:
        "Настольная подставка из цельного алюминия с регулировкой угла. Резиновые накладки не дают телефону скользить.",
      colors: [
        { id: "silver", name: "Серебро", hex: "#cfd0d2" },
        { id: "graphite", name: "Графит", hex: "#3a3a3c" },
      ],
    },
    {
      id: "strap",
      name: "Шнурок на шею",
      category: "extras",
      art: "strap",
      price: 5490,
      short: "Телефон всегда под рукой и не потеряется",
      description:
        "Плетёный шнурок с регулируемой длиной и прочной вставкой под чехол. Подходит для любого чехла с отверстием.",
      colors: [
        { id: "sand", name: "Песок", hex: "#d8cbb5" },
        { id: "black", name: "Чёрный", hex: "#2b2b2d" },
        { id: "olive", name: "Олива", hex: "#7d8064" },
      ],
    },
  ];

  const data = { STORE, CATEGORIES, PRODUCTS };
  if (typeof module !== "undefined" && module.exports) module.exports = data;
  else root.SHOP = data;
})(typeof window !== "undefined" ? window : globalThis);
