export default async (request, context) => {
  const response = await context.next();

  response.headers.set('X-Geo', JSON.stringify(context.geo));
  return response;
};
