module.exports = {
  nav:
    process.env.NODE_ENV === 'production'
      ? {}
      : {
          order: 20,
          icon: 'info',
        },
};
