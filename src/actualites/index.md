---
title: Actualités
nav:
  order: 2
---

Voici les dernières actualités :

<div class="stack">

{% for entry in collections.actualites %}

  <article class="news">
    <h2 class="news__title"><a href="{{ entry.url }}">{{ entry.data.title }}</a></h2>
    <p class="news__meta">{{ entry.date | date("Do MMMM YYYY") }}</p>
  </article>
{% endfor %}

</div>
