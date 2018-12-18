export default pathname => pathname
  .split('/')
  .filter(el => el)
  .join('-')
  .replace(/[^\w]/g, '-')
  .concat('.html');
