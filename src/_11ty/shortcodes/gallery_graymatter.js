import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export const gallery_graymatter = (...slugs) => {
	if (slugs.length === 0) return '';

	let gallery = `<ul class="photos">`;
	slugs.forEach((slug) => {
		const md = fs.readFileSync(
			path.join('./src/collections/photos/', slug, 'index.md'),
			'utf8'
		);
		const content = matter(md);
		gallery += `<li>
<figure>
  <img src="/photos/${slug}/${slug}.jpg" alt="${
		content.data.alt_text || content.data.title
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
	} / 50%)" data-responsiver="thumbnail" />
  <figcaption>
    <a href="{{ item.page.url }}">${content.data.title}</a>
    <ul class="meta">
      <li class="date meta__item meta__date">
        <svg class="icon" aria-hidden="true"><use xlink:href="#date-icon" /></svg> <time class="dt-published" datetime="${
					content.data.dates.iso
				}">
          ${content.data.dates.human}
        </time>
      </li>
    </ul>
  </figcaption>
</figure>
</li>`;
	});
	gallery += '</ul>';
	return gallery;
};
