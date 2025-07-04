export function gallery(...slugs) {
	if (slugs.length === 0) return "";

	// Collections are available in `this.ctx.collections` in classic (not arrow) functions
	// https://github.com/11ty/eleventy/issues/813#issuecomment-1037874929

	let gallery = `<ul class="photos">`;
	for (const slug of slugs) {
		const photosWithSlug = this.ctx.collections.unique_photos.filter(
			(item) => item.page.fileSlug === slug,
		);
		if (photosWithSlug.length === 1) {
			const photo = photosWithSlug[0].data;
			const dimensions = photo.origin.data.dimensions;
			gallery += `<li>
<figure>
  <img src="/photos/${slug}/${slug}.jpg" alt="${
		photo.origin.data.alt_text || photo.title
	}" class="frame${
		dimensions.width < dimensions.height ? " portrait" : ""
	}" ${dimensions.width ? `width="${dimensions.width}"` : ""} ${
		dimensions.height ? `height="${dimensions.height}"` : ""
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
</figure>
</li>`;
		}
	}
	gallery += "</ul>";
	return gallery;
}
