// Shared helpers: PokeAPI sprites (cached) + rendering
const SPRITE_CACHE_KEY = "pc_sprites_v1";
let spriteCache = {};
try { spriteCache = JSON.parse(localStorage.getItem(SPRITE_CACHE_KEY) || "{}"); } catch (e) {}

const slug = s => String(s).trim().toLowerCase().replace(/[.'’]/g, "").replace(/\s+/g, "-");

async function getSprite(nameOrId) {
  const key = slug(nameOrId);
  if (!key) return null;
  if (spriteCache[key]) return spriteCache[key];
  try {
    const r = await fetch("https://pokeapi.co/api/v2/pokemon/" + encodeURIComponent(key));
    if (!r.ok) return null;
    const d = await r.json();
    const url = d.sprites.front_default || d.sprites.other?.["official-artwork"]?.front_default;
    if (url) {
      spriteCache[key] = url;
      try { localStorage.setItem(SPRITE_CACHE_KEY, JSON.stringify(spriteCache)); } catch (e) {}
    }
    return url;
  } catch (e) { return null; }
}

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function playerHTML(p) {
  const teams = p.teams.map(t => `
    <div class="team"><h3>${esc(t.name || "Team")}</h3>
    <div class="mons">${t.pokemon.map(m => `
      <div class="mon"><img data-mon="${esc(m)}" alt="${esc(m)}" width="96" height="96"><div>${esc(m)}</div></div>`).join("")}
    </div></div>`).join("");
  return `<section class="player"><h2>${esc(p.name)}${p.country ? `<small>${esc(p.country)}</small>` : ""}</h2>${teams}</section>`;
}

async function loadSprites(root) {
  for (const img of root.querySelectorAll("img[data-mon]:not([src])")) {
    getSprite(img.dataset.mon).then(u => { if (u) img.src = u; else img.alt = img.dataset.mon + " (not found)"; });
  }
}

function renderPlayers(list, root) {
  root.innerHTML = list.length ? list.map(playerHTML).join("") : '<p class="muted">No players found.</p>';
  loadSprites(root);
}
