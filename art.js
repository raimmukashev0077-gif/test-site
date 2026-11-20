// Минималистичные SVG-иллюстрации товаров (вместо фото).
// Когда появятся настоящие фотографии — добавьте товару поле image: "img/....jpg".
(function () {
  const INK = "#1d1d1f";

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.max(0, Math.min(255, v + amt));
    const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  const shapes = {
    case: (c) => `
      <rect x="62" y="22" width="76" height="156" rx="20" fill="${c}"/>
      <rect x="62" y="22" width="76" height="156" rx="20" fill="none" stroke="${shade(c, -25)}" stroke-width="1.5"/>
      <rect x="72" y="34" width="34" height="38" rx="11" fill="${shade(c, -18)}"/>
      <circle cx="83" cy="45" r="6.5" fill="${INK}"/><circle cx="96" cy="58" r="6.5" fill="${INK}"/>
      <circle cx="83" cy="45" r="2" fill="#4a4a50"/><circle cx="96" cy="58" r="2" fill="#4a4a50"/>
      <circle cx="98" cy="43" r="2" fill="#f4e7c2"/>`,
    "case-clear": (c) => `
      <rect x="62" y="22" width="76" height="156" rx="20" fill="#c9ccd1"/>
      <rect x="62" y="22" width="76" height="156" rx="20" fill="${c}" opacity=".55" stroke="#b5bcc4" stroke-width="2"/>
      <circle cx="100" cy="112" r="24" fill="none" stroke="#9aa3ad" stroke-width="5"/>
      <rect x="97" y="138" width="6" height="12" rx="2" fill="#9aa3ad"/>
      <rect x="72" y="34" width="34" height="38" rx="11" fill="#2a2a2e"/>
      <circle cx="83" cy="45" r="6.5" fill="#111"/><circle cx="96" cy="58" r="6.5" fill="#111"/>
      <path d="M70 40 L82 28" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`,
    glass: () => `
      <rect x="66" y="26" width="72" height="150" rx="18" fill="#26262a"/>
      <rect x="58" y="20" width="76" height="154" rx="19" fill="#dfe6ec" opacity=".7" stroke="#aab6c0" stroke-width="1.5"/>
      <rect x="84" y="28" width="24" height="7" rx="3.5" fill="#26262a"/>
      <path d="M72 60 L104 28 M72 84 L118 38" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`,
    charger: (c) => `
      <rect x="66" y="70" width="68" height="78" rx="14" fill="${c}" stroke="${shade(c, -30)}" stroke-width="1.5"/>
      <rect x="82" y="40" width="7" height="32" rx="2" fill="#b8b8bc"/><rect x="111" y="40" width="7" height="32" rx="2" fill="#b8b8bc"/>
      <rect x="88" y="128" width="24" height="8" rx="4" fill="${shade(c, -45)}"/>
      <text x="100" y="108" text-anchor="middle" font-family="Manrope,sans-serif" font-size="13" font-weight="700" fill="${shade(c, -60)}">30W</text>`,
    cable: (c) => `
      <path d="M58 150 C 40 90, 160 110, 140 60 S 80 40, 96 30" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
      <path d="M58 150 C 40 90, 160 110, 140 60 S 80 40, 96 30" fill="none" stroke="${shade(c, -30)}" stroke-width="9" stroke-dasharray="2 5" stroke-linecap="round" opacity=".35"/>
      <rect x="47" y="146" width="22" height="34" rx="6" fill="${c}" stroke="${shade(c, -30)}" stroke-width="1.5"/>
      <rect x="52" y="176" width="12" height="12" rx="3" fill="#b8b8bc"/>
      <rect x="85" y="14" width="22" height="22" rx="6" fill="${c}" stroke="${shade(c, -30)}" stroke-width="1.5" transform="rotate(-20 96 25)"/>`,
    pad: () => `
      <ellipse cx="100" cy="128" rx="60" ry="22" fill="#c9cacd"/>
      <ellipse cx="100" cy="120" rx="60" ry="22" fill="#e3e4e6" stroke="#b6b8bb" stroke-width="1.5"/>
      <ellipse cx="100" cy="118" rx="44" ry="15" fill="#f4f4f5"/>
      <circle cx="100" cy="118" r="3" fill="#7fc98a"/>
      <path d="M160 124 C 180 130, 182 160, 150 170" fill="none" stroke="#e3e4e6" stroke-width="6" stroke-linecap="round"/>`,
    powerbank: (c) => `
      <rect x="58" y="38" width="84" height="124" rx="18" fill="${c}" stroke="${shade(c, -30)}" stroke-width="1.5"/>
      <circle cx="100" cy="96" r="26" fill="none" stroke="${shade(c, -22)}" stroke-width="4"/>
      <rect x="88" y="146" width="24" height="6" rx="3" fill="${shade(c, -50)}"/>
      <circle cx="84" cy="56" r="2.5" fill="#7fc98a"/><circle cx="93" cy="56" r="2.5" fill="#7fc98a"/><circle cx="102" cy="56" r="2.5" fill="#7fc98a"/><circle cx="111" cy="56" r="2.5" fill="${shade(c, -25)}"/>`,
    earbuds: () => `
      <rect x="54" y="92" width="92" height="72" rx="30" fill="#f6f6f4" stroke="#c9c9c6" stroke-width="1.5"/>
      <path d="M54 116 H146" stroke="#c9c9c6" stroke-width="1.5"/>
      <circle cx="100" cy="140" r="3" fill="#7fc98a"/>
      <g transform="rotate(-18 76 62)"><ellipse cx="76" cy="52" rx="16" ry="14" fill="#fafaf8" stroke="#c9c9c6" stroke-width="1.5"/><rect x="70" y="56" width="11" height="32" rx="5.5" fill="#fafaf8" stroke="#c9c9c6" stroke-width="1.5"/></g>
      <g transform="rotate(18 124 62)"><ellipse cx="124" cy="52" rx="16" ry="14" fill="#fafaf8" stroke="#c9c9c6" stroke-width="1.5"/><rect x="119" y="56" width="11" height="32" rx="5.5" fill="#fafaf8" stroke="#c9c9c6" stroke-width="1.5"/></g>`,
    stand: (c) => `
      <rect x="48" y="160" width="104" height="12" rx="6" fill="${shade(c, -20)}"/>
      <path d="M82 160 L112 74" stroke="${c}" stroke-width="12" stroke-linecap="round"/>
      <g transform="rotate(-20 118 90)"><rect x="92" y="22" width="56" height="112" rx="14" fill="#1d1d1f"/><rect x="96" y="26" width="48" height="104" rx="11" fill="#2e3440"/><rect x="112" y="30" width="16" height="5" rx="2.5" fill="#1d1d1f"/></g>
      <rect x="76" y="144" width="40" height="8" rx="4" fill="${shade(c, -35)}" transform="rotate(-20 96 148)"/>`,
    strap: (c) => `
      <path d="M100 30 C 30 40, 30 150, 88 160" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
      <path d="M100 30 C 170 40, 170 150, 112 160" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
      <path d="M100 30 C 30 40, 30 150, 88 160 M100 30 C 170 40, 170 150, 112 160" fill="none" stroke="${shade(c, -35)}" stroke-width="8" stroke-dasharray="1 6" stroke-linecap="round" opacity=".4"/>
      <rect x="84" y="152" width="32" height="18" rx="5" fill="${shade(c, -25)}"/>
      <rect x="94" y="168" width="12" height="14" rx="3" fill="#b8b8bc"/>`,
  };

  window.productArt = function (product, colorHex) {
    const color = colorHex || (product.colors && product.colors[0].hex) || "#e5e5e5";
    const draw = shapes[product.art] || shapes.case;
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${product.name}">
      <ellipse cx="100" cy="186" rx="52" ry="5" fill="#000" opacity=".06"/>${draw(color)}</svg>`;
  };
})();
