---
title: Contact
nav:
  order: 20
  icon: contact
---

<ul class="breadcrumb">
  <li><a href="/">Home</a></li>
  {% for item in breadcrumb %}
    <li><a href="{{ item.url }}">{{ item.data.title }}</a></li>
  {% endfor %}
</ul>

<h1>Contact</h1>
