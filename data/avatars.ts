// Illustrated profile pictures for the demo seed profiles. Pure SVG, returned as
// data URLs, so they need no image hosting and work offline at the venue.
// Owned by Liam.

export type Hair = "short" | "buzz" | "long" | "bun" | "curly" | "beanie" | "spiky" | "bald";

export interface AvatarSpec {
  bg: string; // background colour
  skin: string;
  hair: Hair;
  hairColor: string;
  shirt: string;
  glasses?: "round" | "square";
  headphones?: string; // band colour
  eyes?: "open" | "sleepy" | "wink";
  mouth?: "smile" | "grin" | "flat" | "smirk";
  blush?: boolean;
  beard?: boolean;
  prop?: string; // emoji sticker in the corner
}

export const SKIN = {
  light: "#f6d6bd",
  fair: "#efc3a0",
  tan: "#d79f76",
  medium: "#b67a52",
  brown: "#8a5a3c",
  deep: "#5e3b27",
};

function hairBack(s: AvatarSpec) {
  if (s.hair === "long") return `<path d="M54 96C50 46 150 46 146 96L152 158C130 168 70 168 48 158Z" fill="${s.hairColor}"/>`;
  if (s.hair === "curly")
    return [
      [64, 70, 24], [100, 52, 28], [136, 70, 24], [56, 102, 18], [144, 102, 18], [80, 56, 20], [120, 56, 20],
    ].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${s.hairColor}"/>`).join("");
  return "";
}

function hairFront(s: AvatarSpec) {
  switch (s.hair) {
    case "short":
      return `<path d="M61 92C56 46 144 46 139 92C132 72 116 64 100 66C84 64 68 72 61 92Z" fill="${s.hairColor}"/>`;
    case "buzz":
      return `<path d="M64 82C66 54 134 54 136 82C120 70 80 70 64 82Z" fill="${s.hairColor}" opacity=".85"/>`;
    case "long":
      return `<path d="M60 94C58 52 142 52 140 94C124 66 92 62 60 94Z" fill="${s.hairColor}"/>`;
    case "bun":
      return `<circle cx="100" cy="40" r="17" fill="${s.hairColor}"/><path d="M61 90C56 48 144 48 139 90C126 70 74 70 61 90Z" fill="${s.hairColor}"/>`;
    case "curly":
      return `<path d="M64 84C70 60 130 60 136 84C118 74 82 74 64 84Z" fill="${s.hairColor}"/>`;
    case "beanie":
      return `<path d="M58 84C58 38 142 38 142 84Z" fill="${s.hairColor}"/><rect x="56" y="74" width="88" height="14" rx="7" fill="${s.hairColor}" stroke="#000" stroke-opacity=".15" stroke-width="2"/><circle cx="100" cy="36" r="9" fill="#fff"/>`;
    case "spiky":
      return `<path d="M60 88L62 62L74 70L78 44L90 62L100 38L110 62L122 44L126 70L138 62L140 88C124 72 76 72 60 88Z" fill="${s.hairColor}"/>`;
    default:
      return "";
  }
}

function eyes(s: AvatarSpec) {
  const ink = "#1d1b22";
  if (s.eyes === "sleepy")
    return `<path d="M79 98Q86 102 93 98M107 98Q114 102 121 98" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  if (s.eyes === "wink")
    return `<circle cx="86" cy="97" r="4.5" fill="${ink}"/><path d="M107 98Q114 93 121 98" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  return `<circle cx="86" cy="97" r="4.5" fill="${ink}"/><circle cx="114" cy="97" r="4.5" fill="${ink}"/><circle cx="87.5" cy="95.5" r="1.4" fill="#fff"/><circle cx="115.5" cy="95.5" r="1.4" fill="#fff"/>`;
}

function mouth(s: AvatarSpec) {
  const ink = "#1d1b22";
  switch (s.mouth) {
    case "grin":
      return `<path d="M88 114Q100 128 112 114Z" fill="${ink}"/><path d="M92 115Q100 119 108 115" stroke="#fff" stroke-width="2.5" fill="none"/>`;
    case "flat":
      return `<path d="M91 117H109" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>`;
    case "smirk":
      return `<path d="M90 117Q102 121 111 112" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    default:
      return `<path d="M89 114Q100 124 111 114" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  }
}

function glasses(s: AvatarSpec) {
  const g = `stroke="#16141a" stroke-width="3.5" fill="#ffffff" fill-opacity=".18"`;
  if (s.glasses === "round")
    return `<circle cx="86" cy="97" r="12" ${g}/><circle cx="114" cy="97" r="12" ${g}/><path d="M98 96Q100 93 102 96M62 94L74 96M126 96L138 94" stroke="#16141a" stroke-width="3" fill="none"/>`;
  if (s.glasses === "square")
    return `<rect x="72" y="87" width="26" height="19" rx="4" ${g}/><rect x="102" y="87" width="26" height="19" rx="4" ${g}/><path d="M98 95H102M62 93L72 95M128 95L138 93" stroke="#16141a" stroke-width="3"/>`;
  return "";
}

export function avatar(s: AvatarSpec): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<rect width="200" height="200" fill="${s.bg}"/>
<circle cx="100" cy="100" r="78" fill="#fff" fill-opacity=".14"/>
${hairBack(s)}
<path d="M28 200C28 154 60 134 100 134C140 134 172 154 172 200Z" fill="${s.shirt}"/>
<path d="M84 136L100 156L116 136" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="4"/>
<path d="M92 150V172M108 150V172" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
<rect x="88" y="116" width="24" height="24" rx="8" fill="${s.skin}"/>
<rect x="88" y="126" width="24" height="10" fill="#000" opacity=".08"/>
<circle cx="61" cy="99" r="9" fill="${s.skin}"/><circle cx="139" cy="99" r="9" fill="${s.skin}"/>
<ellipse cx="100" cy="94" rx="39" ry="43" fill="${s.skin}"/>
${s.beard ? `<path d="M62 100C64 140 136 140 138 100C130 120 70 120 62 100Z" fill="${s.hairColor}"/>` : ""}
${s.blush ? `<circle cx="76" cy="111" r="6" fill="#ff6b8b" opacity=".35"/><circle cx="124" cy="111" r="6" fill="#ff6b8b" opacity=".35"/>` : ""}
${eyes(s)}
<path d="M80 86Q86 82 92 85M108 85Q114 82 120 86" stroke="#1d1b22" stroke-opacity=".55" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${mouth(s)}
${glasses(s)}
${hairFront(s)}
${s.headphones ? `<path d="M56 98C52 34 148 34 144 98" fill="none" stroke="${s.headphones}" stroke-width="8" stroke-linecap="round"/><rect x="47" y="86" width="16" height="28" rx="7" fill="${s.headphones}"/><rect x="137" y="86" width="16" height="28" rx="7" fill="${s.headphones}"/>` : ""}
${s.prop ? `<circle cx="160" cy="162" r="25" fill="#fff" stroke="#000" stroke-opacity=".1" stroke-width="2"/><text x="160" y="172" font-size="28" text-anchor="middle">${s.prop}</text>` : ""}
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\n/g, ""))}`;
}
