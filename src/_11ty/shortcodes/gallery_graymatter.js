const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const moment = require('moment');

module.exports = {
  gallery_graymatter: (...slugs) => {
    if (slugs.length === 0) return '';

    let gallery = `<ul class="gallery">`;
    slugs.forEach((slug) => {
      const md = fs.readFileSync(
        path.join('./src/photos/', slug, 'index.md'),
        'utf8'
      );
      const content = matter(md);
      gallery += `<li>
<figure>
  <img src="/photos/${slug}/${slug}.jpg" alt="${
        content.data.title
      }" class="frame${
        content.data.dimensions.width < content.data.dimensions.height
          ? ' portrait'
          : ''
      }" ${
        content.data.dimensions.width
          ? `width="${content.data.dimensions.width}`
          : ''
      } ${
        content.data.dimensions.height
          ? `height="${content.data.dimensions.height}`
          : ''
      } style="background-color: rgb(${
        content.data.colors.muted
      } / 50%)" data-responsiver="thumbnail_${
        content.data.dimensions.width < content.data.dimensions.height
          ? ' portrait'
          : 'landscape'
      }" />
  <figcaption>
    <a href="{{ item.url }}">${content.data.title}</a>
    <ul class="meta">
      <li class="date meta__item meta__date">
        <svg class="icon" aria-hidden="true"><use xlink:href="#date-icon" /></svg> <time class="dt-published" datetime="${moment(
          content.data.date
        ).format('YYYY-MM-DD')}">
          ${moment(content.data.date).format('Do MMMM YYYY')}
        </time>
      </li>
    </ul>
  </figcaption>
</figure>
</li>`;
    });
    gallery += '</ul>';
    return gallery;
  },
};
