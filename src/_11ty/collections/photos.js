// Add a "photos" collection with all photos
module.exports = {
  photos: (collection) =>
    collection
      .getAll()
      .filter((item) => 'photo' in item.data)
      .sort((a, b) => b.date - a.date),
  galleries: (collection) =>
    collection
      .getAll()
      .filter(
        (item) =>
          item.url.match(/^\/(travel|people)\//) && !('photo' in item.data)
      )
      .sort((a, b) => b.data.title.localeCompare(a.data.title), 'en'),
};
