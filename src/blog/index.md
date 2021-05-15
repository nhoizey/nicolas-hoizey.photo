---
title: Blog
nav:
  order: 3
---

Voici les dernières actualités :

<div class="stack">

{% for entry in collections.blog %}

  <article class="blog">
    <h2 class="blog__title"><a href="{{ entry.url }}">{{ entry.data.title }}</a></h2>
    <p class="blog__meta">{{ entry.date | date("Do MMMM YYYY") }}</p>
  </article>
{% endfor %}

</div>
