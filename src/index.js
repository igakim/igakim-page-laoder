import axios from 'axios';
import { promises as fsp, createWriteStream } from 'fs';
import url from 'url';
import path from 'path';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';

import { getResourceName, replaceLinks, getResourcesLinks } from './utils';

const log = debug('page-loader');
const downloadResource = (resource, directory) => {
  const { actualUrl, fileName } = resource;
  return () => axios({
    method: 'get',
    url: actualUrl,
    responseType: 'stream',
  })
    .then((res) => {
      res.data.pipe(createWriteStream(path.join(directory, fileName)));
      log('resource dowloaded %s', path.join(directory, fileName));
    })
    .catch((e) => {
      log('resource wasn\'n downloaded %s', path.join(directory, fileName));
      throw new Error(`One or more files were not downloaded. ${e.message}`);
    });
};

const pageLoader = (pageUrl, options = {}) => {
  const directory = options.output || '.';
  const { host, pathname, protocol } = url.parse(pageUrl);
  const fileName = getResourceName(path.join(host, pathname), '.html'); // hexlet-io-courses.html
  const assetsDirectoryName = getResourceName(path.join(host, pathname), '_files'); // hexlet-io-courses_files
  const fullPathToHtml = path.resolve(directory, fileName);
  const fullPathToAssetsDirectory = path.resolve(directory, assetsDirectoryName);
  let resourcesLinks;
  return axios.get(pageUrl)
    .then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      resourcesLinks = getResourcesLinks($, { host, protocol });
      const newBody = replaceLinks($, assetsDirectoryName);
      return fsp.writeFile(fullPathToHtml, newBody);
    })
    .then(() => log('html file downloaded to %s', directory))
    .then(() => fsp.mkdir(fullPathToAssetsDirectory))
    .then(() => log('assets directory created in %s', fullPathToAssetsDirectory))
    .then(() => {
      const resourcesTasks = resourcesLinks.map(el => ({
        title: `Download ${el.fileName}`,
        task: downloadResource(el, fullPathToAssetsDirectory),
      }));
      const tasks = new Listr(resourcesTasks, { concurrent: true, exitOnError: false });
      return tasks;
      // return Promise.all(promises);
    })
    .then(tasks => tasks.run().catch(() => console.error('Some file wasn\'t download')))
    .then(() => log('all resources processed and downlaoded to %s', fullPathToAssetsDirectory))
    .catch((e) => {
      log(e);
      throw e;
    });
};
export default pageLoader;
