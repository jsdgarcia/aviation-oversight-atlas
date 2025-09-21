(function(){
  const BASE = (window.BASE || '');

  function getCode(){
    const url = new URL(location.href);
    const q = url.searchParams.get('code');
    if (q) return q.toUpperCase();
    const path = location.pathname.startsWith(BASE) ? location.pathname.slice(BASE.length) : location.pathname;
    const parts = path.split('/').filter(Boolean);
    const i = parts.indexOf('c');
    if (i>=0 && parts[i+1]) return parts[i+1].toUpperCase();
    return null;
  }

  // Sort helper: CAA (0), AIA (1), everything else (2)
  function typeRank(t){
    const key = (t || '').toUpperCase();
    if (key === 'CAA') return 0;
    if (key === 'AIA') return 1;
    return 2;
  }

  const cc = getCode();
  const shell = document.getElementById('country-shell');
  const mapEl = document.getElementById('country-map');
  if (!cc){ shell.innerHTML = "<p>Missing country code.</p>"; return; }

  Promise.all([
    fetch(BASE + '/api/countries.json', {cache: 'no-store'}).then(r=>r.json()),
    fetch(BASE + '/api/organizations.json', {cache: 'no-store'}).then(r=>r.json())
  ]).then(([COUNTRIES, ORGS]) => {
    const meta = COUNTRIES[cc];
    if (!meta){ shell.innerHTML = "<p>Country not found.</p>"; return; }

    // ✅ CAA first, then AIA, then others; alphabetical by name within each
    const list = ORGS
      .filter(o => (o.country_code||'').toUpperCase() === cc)
      .sort((a, b) => {
        const ta = typeRank(a.type), tb = typeRank(b.type);
        if (ta !== tb) return ta - tb;
        const na = (a.name || '').toString();
        const nb = (b.name || '').toString();
        return na.localeCompare(nb, undefined, {sensitivity: 'base'});
      });

    document.title = `${meta.name} | Aviation Oversight Atlas`;

    const header = `
      <h1>${meta.name}</h1>
      <p class="muted">${cc} · ${list.length} ${list.length===1?'authority':'authorities'}</p>
      <p><a class="btn btn-sm" href="${BASE}/countries/">&larr; All countries</a></p>
    `;

    const cardHTML = o => `
      <div class="card org-card">
        <div class="card-body">
          <h3 class="card-title">${o.name}</h3>
          <p class="card-subtitle">
            <span class="badge">${o.type || ''}</span>
            ${o.short_name ? `<span class="badge badge-secondary">${o.short_name}</span>` : ''}
            ${o.hq_city ? `<span class="badge badge-info">${o.hq_city}</span>` : ''}
          </p>
          ${o.description ? `<p class="card-text">${o.description}</p>` : ''}
          <div class="card-buttons">
            ${o.website ? `<a class="btn btn-sm" href="${o.website}" target="_blank" rel="noopener">Website</a>` : ''}
          </div>
        </div>
      </div>
    `;

    const grid = `<div class="grid grid-2">${list.map(cardHTML).join('')}</div>`;

    shell.innerHTML = `
      <div class="post">
        <div class="post-content">
          ${header}
          ${list.length ? grid : `<p>No authorities listed yet.</p>`}
        </div>
      </div>
    `;

    // Map: only organization markers (no centroid, no lines)
    if (typeof meta.lat === 'number' && typeof meta.lon === 'number') {
      const map = L.map('country-map', { scrollWheelZoom: false }).setView([meta.lat, meta.lon], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'&copy; OpenStreetMap' }).addTo(map);

      const features = [];
      list.forEach(o => {
        if (typeof o.lat !== 'number' || typeof o.lon !== 'number') return;
        const m = L.marker([o.lat, o.lon]).addTo(map)
          .bindPopup(`<b>${o.name}</b><br>${o.type || ''}${o.hq_city ? ' · '+o.hq_city : ''}`);
        features.push(m);
      });

      if (features.length) {
        const group = L.featureGroup(features);
        map.fitBounds(group.getBounds().pad(0.25));
      }
    } else {
      mapEl.style.display = 'none';
    }
  }).catch(err => {
    console.error(err);
    shell.innerHTML = "<p>Could not load country data.</p>";
  });
})();
