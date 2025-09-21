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

  const cc = getCode();
  const shell = document.getElementById('country-shell');
  const mapEl = document.getElementById('country-map');
  if (!cc){ shell.innerHTML = "<p>Missing country code.</p>"; return; }

  Promise.all([
    fetch(BASE + '/api/countries.json').then(r=>r.json()),
    fetch(BASE + '/api/organizations.json').then(r=>r.json())
  ]).then(([COUNTRIES, ORGS]) => {
    const meta = COUNTRIES[cc];
    if (!meta){ shell.innerHTML = "<p>Country not found.</p>"; return; }

    const list = ORGS.filter(o => (o.country_code||'').toUpperCase() === cc)
                     .sort((a,b) => (a.type||'').localeCompare(b.type||'') || a.name.localeCompare(b.name));

    document.title = `${meta.name} | Aviation Oversight Atlas`;

    const header = `
      <h1>${meta.name}</h1>
      <p class="muted">${cc} · ${list.length} ${list.length===1?'authority':'authorities'}</p>
      <p><a class="btn btn-sm" href="${BASE}/countries/">&larr; All countries</a></p>
    `;

    const cards = list.map(o => `
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
    `).join('');

    shell.innerHTML = `
      <div class="post">
        <div class="post-content">
          ${header}
          ${list.length ? `<div class="grid grid-2">${cards}</div>` : `<p>No authorities listed yet.</p>`}
        </div>
      </div>
    `;

    if (typeof meta.lat === 'number' && typeof meta.lon === 'number') {
      const map = L.map('country-map', { scrollWheelZoom: false }).setView([meta.lat, meta.lon], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'&copy; OpenStreetMap' }).addTo(map);

      const markers = [];
      list.forEach(o => {
        if (typeof o.lat !== 'number' || typeof o.lon !== 'number') return;
        const m = L.marker([o.lat, o.lon]).addTo(map)
          .bindPopup(`<b>${o.name}</b><br>${o.type || ''}${o.hq_city ? ' · '+o.hq_city : ''}`);
        L.polyline([[o.lat, o.lon], [meta.lat, meta.lon]], {weight:1, opacity:0.6}).addTo(map);
        markers.push(m);
      });

      if (markers.length) {
        const group = L.featureGroup(markers.concat([L.marker([meta.lat, meta.lon])]));
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

