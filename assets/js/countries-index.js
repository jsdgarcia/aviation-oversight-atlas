(function(){
  const grid = document.getElementById('countries-grid');
  const input = document.getElementById('c-filter');
  const mapEl = document.getElementById('countries-map');
  const BASE = (window.BASE || '');

  Promise.all([
    fetch(BASE + '/api/countries.json').then(r=>r.json()),
    fetch(BASE + '/api/organizations.json').then(r=>r.json())
  ]).then(([COUNTRIES, ORGS]) => {
    const counts = {};
    ORGS.forEach(o => {
      const cc = (o.country_code||'').toUpperCase();
      if (!cc) return;
      counts[cc] = (counts[cc]||0)+1;
    });

    const entries = Object.keys(COUNTRIES).map(cc => ({
      code: cc,
      name: COUNTRIES[cc].name,
      lat: COUNTRIES[cc].lat,
      lon: COUNTRIES[cc].lon,
      n: counts[cc] || 0
    })).filter(e => e.n > 0)
      .sort((a,b) => a.name.localeCompare(b.name));

    function renderGrid(items){
      grid.innerHTML = items.map(e => `
        <a class="country-card" href="${BASE}/c/${e.code}">
          <div class="country-name">${e.name}</div>
          <div class="country-meta">${e.code} · ${e.n} ${e.n===1?'authority':'authorities'}</div>
        </a>
      `).join('');
    }

    renderGrid(entries);

    input.addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = entries.filter(e =>
        e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q)
      );
      renderGrid(filtered);
    });

    if (mapEl) {
      const map = L.map('countries-map', { scrollWheelZoom: false }).setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'&copy; OpenStreetMap' }).addTo(map);

      const markers = [];
      entries.forEach(e => {
        const m = L.circleMarker([e.lat, e.lon], {radius: Math.min(14, 4 + Math.log2(1+e.n))})
          .addTo(map)
          .bindPopup(`<b>${e.name}</b><br>${e.code} · ${e.n} ${e.n===1?'authority':'authorities'}<br><a href="${BASE}/c/${e.code}">Open country</a>`);
        markers.push(m);
      });
      if (markers.length) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
      }
    }
  }).catch(console.error);
})();

