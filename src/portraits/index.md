---
title: Portraits
nav:
  order: 2
---

<div class="stack">

{% for entry in collections.portraits %}

  <article class="card">
    <h2 class="card__title"><a href="{{ entry.url }}">{{ entry.data.title }}</a></h2>
    <p class="card__meta">{{ entry.date | date("Do MMMM YYYY") }}</p>
    <img src="{{ entry.data.photo }}" alt="{{ entry.data.title }}" />
  </article>
{% endfor %}

</div>
