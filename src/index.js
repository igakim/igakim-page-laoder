import axios from 'axios';
import { promises as fsp, createWriteStream } from 'fs';
import url from 'url';
import path from 'path';
import cheerio from 'cheerio';
import debug from 'debug';

import { getResourceName, replaceLinks, getResourcesLinks } from './utils';

const a = debug('page-loader');
const downloadResource = (resource, directory) => {
  const { actualUrl, fileName } = resource;
  return axios({
    method: 'get',
    url: actualUrl,
    responseType: 'stream',
  })
    .then((res) => {
      res.data.pipe(createWriteStream(path.join(directory, fileName)));
      a('resource dowloaded %s', path.join(directory, fileName));
    })
    .catch((e) => {
      a('resource wasn\'n downloaded %s', path.join(directory, fileName));
      throw new Error(`One or more files were not downloaded. Response status - ${e.response.status}`);
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
    .then(() => a('html file downloaded'))
    .then(() => fsp.mkdir(fullPathToAssetsDirectory))
    .then(() => a('assets directory created'))
    .then(() => {
      const promises = resourcesLinks.map(el => downloadResource(el, fullPathToAssetsDirectory));
      return Promise.all(promises);
    })
    .then(() => a('all resources processed and downlaoded'))
    .catch((e) => {
      a('all resources processed');
      a(e);
    });
};
// Я понял что нужно контролировать, но не знаю как реализовать здесь.
// Я исхожу из следующей лоики - Один из ресурсов может быть не скачан, например 404
// Но остальные все равно должны быть скачаны, поэтому Promise.all для загрузки не подойдет.
// Поэтому нужно бросать все по отдельности и скачивать (map).
// Но как внутри map сделать без остановки не понимаю.
// Решил сложить все промисы в массив и вернуть их.
// Но если хоть один промис в состоянии rejected,
// то ни один then дальше не отработает.

export default pageLoader;
