---
layout: default
title: Aviation Oversight Atlas - Countries
permalink: /countries/
---

<div class="post">
  <div class="post-content">

    <h1>Browse by country</h1>

    <input id="c-filter" type="search" placeholder="Filter countries…" style="width:100%;max-width:520px;padding:.6rem;border:1px solid #e5e7eb;border-radius:10px;margin:.5rem 0 1rem;">

    <div id="countries-grid" class="grid grid-2">
      <p>Loading countries…</p>
    </div>

    <div id="countries-map" style="height:420px;border-radius:8px;overflow:hidden;margin-top:1rem;"></div>

  </div>
</div>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Load the exact file name you showed me -->
<script src="{{ '/assets/js/countries-index.js' | relative_url }}"></script>
