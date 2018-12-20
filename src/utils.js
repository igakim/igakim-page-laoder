import { flattenDeep } from 'lodash';
import path from 'path';
import url from 'url';

const tags = {
  img: 'src',
  script: 'src',
  link: 'href',
};


export const getResourceName = (pathname, end) => pathname
  .split('/')
  .filter(el => el)
  .join('-')
  .replace(/[^\w]/g, '-')
  .concat(end);

export const getDownloadLinks = ($, defaultUrl) => {
  const tagsNames = Object.keys(tags);
  const allLinks = tagsNames
    .map(tag => $(tag)
      .map((i, el) => {
        const tagUrl = $(el).attr(tags[tag]);
        if (tagUrl) {
          const {
            pathname, protocol, host, query, search,
          } = url.parse(tagUrl);
          const urlFormat = {
            protocol: protocol || defaultUrl.protocol,
            host: host || defaultUrl.host,
            pathname,
            query,
            search,
          };

          const { dir, name, ext } = path.parse(pathname);
          const fileName = getResourceName(path.join(dir, name), ext);
          const actualUrl = url.format(urlFormat);
          return { actualUrl, fileName };
        }
        return null;
      })
      .get())
    .filter(el => el);
  return flattenDeep(allLinks);
};

export const linkReplace = ($, directoryName) => {
  const tagsNames = Object.keys(tags);
  tagsNames.forEach((tag) => {
    $(tag).each((i, el) => {
      const tagUrl = $(el).attr(tags[tag]);
      if (tagUrl) {
        const { pathname } = url.parse(tagUrl);
        const { dir, ext, name } = path.parse(pathname);
        const assetName = getResourceName(path.format({ dir, name }), ext);
        $(el).attr(tags[tag], path.join(directoryName, assetName));
      }
    });
  });
  return $.html();
};
