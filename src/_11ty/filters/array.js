module.exports = {
  split: (string, separator) => {
    return string.split(separator);
  },
  length: (array) => {
    return !array ? 0 : array.length;
  },
  limit: (array, limit) => {
    return array.slice(0, limit);
  },
  offset: (array, offset) => {
    return array.slice(offset);
  },
  uniq: (array) => {
    return [...new Set(array)];
  },
  shuffle: (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },
  sort_by_url_length: (array) => {
    const copy = [...array];
    copy.sort((a, b) => {
      return b.url.length <= a.url.length;
    });
    return [...copy];
  },
};
