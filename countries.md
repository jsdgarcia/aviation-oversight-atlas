---
layout: default
title: Countries
permalink: /countries/
---

> Browse countries, search by name or code, and jump to a country page.

<input id="c-filter" type="search" placeholder="Search countries…" style="width:100%;max-width:520px;margin:1rem 0;">
<div id="countries-grid" class="grid"></div>

## Map
<div id="countries-map" style="height:560px;border-radius:8px;overflow:hidden;margin-top:1rem;"></div>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<link rel="stylesheet" href="{{ '/assets/css/site.css' | relative_url }}">
<script>
  window.BASE = '{{ "" | relative_url }}';
</script>
<script src="{{ '/assets/js/countries-index.js' | relative_url }}"></script>

