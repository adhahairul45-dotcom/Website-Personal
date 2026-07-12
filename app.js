const gameGrid = document.getElementById("gameGrid");
const searchInput = document.getElementById("searchInput");
const filterChips = document.getElementById("filterChips");

let currentCategory = "all";
let currentSearch = "";
let debounceTimer = null;

function initials(name) {
  return name
    .split(" ")
    .filter((w) => w.length && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("") || name.slice(0, 2).toUpperCase();
}

function renderGames(games) {
  if (!games.length) {
    gameGrid.innerHTML = `<p style="color: var(--text-dim); grid-column: 1 / -1;">No games match your search.</p>`;
    return;
  }

  gameGrid.innerHTML = games
    .map(
      (g) => `
    <a class="game-card" href="/game.html?id=${g.id}" style="--accent: ${g.accent}">
      <div class="banner">${initials(g.name)}</div>
      <div class="info">
        <div class="name">${g.name}</div>
        <div class="publisher">${g.publisher}</div>
        <div class="category-tag">${g.category}</div>
      </div>
    </a>
  `
    )
    .join("");
}

async function loadGames() {
  const params = new URLSearchParams();
  if (currentSearch) params.set("search", currentSearch);
  if (currentCategory !== "all") params.set("category", currentCategory);

  try {
    const res = await fetch(`/api/games?${params.toString()}`);
    const games = await res.json();
    renderGames(games);
  } catch (err) {
    gameGrid.innerHTML = `<p style="color: var(--danger); grid-column: 1 / -1;">Couldn't load games. Is the server running?</p>`;
  }
}

searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value.trim();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadGames, 250);
});

filterChips.addEventListener("click", (e) => {
  const chip = e.target.closest(".filter-chip");
  if (!chip) return;
  filterChips.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  currentCategory = chip.dataset.category;
  loadGames();
});

loadGames();
