// Add a "photos" collection with all photos
module.exports = {
  photos: (collection) =>
    collection
      .getAll()
      .filter((item) => item.url.match(/^\/photos\/[^/]+\//))
      .sort((a, b) => b.date - a.date),
  galleries: (collection) =>
    collection
      .getAll()
      .filter((item) =>
        item.url.match(/^\/(locations|nature|urban|portraits|animals)\//)
      )
      .sort((a, b) => {
        return a.data.title.localeCompare(b.data.title, 'en', {
          ignorePunctuation: true,
          sensitivity: 'base',
        });
      }),
};
