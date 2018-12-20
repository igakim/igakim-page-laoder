import axios from 'axios';
import { promises as fsp, createWriteStream } from 'fs';
import url from 'url';
import path from 'path';
import cheerio from 'cheerio';

import { getResourceName, linkReplace, getDownloadLinks } from './utils';

const downloadResource = (resource, directory) => {
  const { actualUrl, fileName } = resource;
  axios({
    method: 'get',
    url: actualUrl,
    responseType: 'stream',
  }).then((res) => {
    res.data.pipe(createWriteStream(path.join(directory, fileName)));
  }).catch(e => console.log(`Couldn't load ${actualUrl} \n ${e}`));
};

const pageLoader = (pageUrl, options = {}) => {
  const directory = options.output || '.';
  const { host, pathname, protocol } = url.parse(pageUrl);
  const fileName = getResourceName(path.join(host, pathname), '.html'); // hexlet-io-courses.html
  const assetsDirectoryName = getResourceName(path.join(host, pathname), '_files'); // hexlet-io-courses_files
  const fullPathToHtml = path.resolve(directory, fileName);
  const fullPathToAssetsDirectory = path.resolve(directory, assetsDirectoryName);
  let downloadLinks;
  return axios.get(pageUrl)
    .then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      downloadLinks = getDownloadLinks($, { host, protocol });
      const newBody = linkReplace($, assetsDirectoryName);
      return fsp.writeFile(fullPathToHtml, newBody);
    })
    .then(() => fsp.mkdir(fullPathToAssetsDirectory))
    .then(() => {
      downloadLinks.forEach((el) => {
        downloadResource(el, fullPathToAssetsDirectory);
      });
    })
    .catch(e => console.log(e));
};

export default pageLoader;
