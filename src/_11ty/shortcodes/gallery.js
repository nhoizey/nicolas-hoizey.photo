const moment = require('moment');

module.exports = {
  gallery: (...slugs) => {
    if (slugs.length === 0) return '';

    let gallery = `<ul class="gallery">`;
    slugs.forEach((slug) => {
      const photosWithSlug = globalUniquePhotos.filter(
        (page) => page.fileSlug === slug
      );
      if (photosWithSlug.length === 1) {
        const photo = photosWithSlug[0].data;
        console.dir(photo);
        const dimensions = photo.origin.data.dimensions;
        gallery += `<li>
<figure>
  <img src="/photos/${slug}/${slug}.jpg" alt="${photo.title}" class="frame${
          dimensions.width < dimensions.height ? ' portrait' : ''
        }" ${dimensions.width ? `width="${dimensions.width}"` : ''} ${
          dimensions.height ? `height="${dimensions.height}"` : ''
        } style="background-color: rgb(${
          photo.origin.data.colors.muted
        } / 50%)" data-responsiver="thumbnail_${
          dimensions.width < dimensions.height ? ' portrait' : 'landscape'
        }" />
  <figcaption>
    <a href="${photo.page.url}">${photo.title}</a>
    <ul class="meta">
      <li class="date meta__item meta__date">
        <svg class="icon" aria-hidden="true"><use xlink:href="#date-icon" /></svg> <time class="dt-published" datetime="${moment(
          photo.date
        ).format('YYYY-MM-DD')}">
          ${moment(photo.date).format('Do MMMM YYYY')}
        </time>
      </li>
    </ul>
  </figcaption>
</figure>
</li>`;
      }
    });
    gallery += '</ul>';
    return gallery;
  },
};
