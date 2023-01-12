module.exports = {
  photo: (slug = '') => {
    if (slug === '') return '';

    const photosWithSlug = globalUniquePhotos.filter(
      (page) => page.fileSlug === slug
    );
    if (photosWithSlug.length === 0) {
      console.log(`WARNING: No photo found with slug ${slug}`);
      return '';
    }
    const photo = photosWithSlug[0].data;
    const dimensions = photo.origin.data.dimensions;
    let html = `
<figure ${dimensions.width < dimensions.height ? ' class="portrait"' : ''}>
  <img src="/photos/${slug}/${slug}.jpg" alt="${photo.title}" class="frame${
      dimensions.width <= dimensions.height ? ' portrait' : ''
    }" ${dimensions.width ? `width="${dimensions.width}"` : ''} ${
      dimensions.height ? `height="${dimensions.height}"` : ''
    } style="background-color: rgb(${
      photo.origin.data.colors.muted
    } / 50%)" data-responsiver="thumbnail" />
  <figcaption>
    <a href="${photo.page.url}">${photo.title}</a>
    <ul class="meta">
      <li class="date meta__item meta__date">
        <svg class="icon" aria-hidden="true"><use xlink:href="#date-icon" /></svg> <time class="dt-published" datetime="${
          photo.origin.data.dates.iso
        }">
          ${photo.origin.data.dates.human}
        </time>
      </li>
    </ul>
  </figcaption>
</figure>`;
    return html.replace(/\n/g, '');
  },
};
