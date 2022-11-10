export const JoinImagePath = (baseUrl, path) => {
  const url = new URL(baseUrl);
  url.searchParams.append("path", path);
  return url.toString();
};
