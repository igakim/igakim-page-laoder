import axios from 'axios';
import { promises as fsp } from 'fs';
import url from 'url';
import path from 'path';
// import os from 'os';
import getFileName from './utils';

const pageLoader = (pageUrl, options = {}) => axios.get(pageUrl)
  .then((res) => {
    const { pathname, host } = url.parse(pageUrl);
    const dir = options.output || '.';
    const fileName = getFileName(path.join(host, pathname));
    const fullPath = path.resolve(dir, fileName);
    fsp.writeFile(fullPath, res.data);
    return fullPath;
  })
  .then(fullPath => console.log(`page successfully downloaded to ${fullPath}`))
  .catch(() => console.log('Couldn\'t load page'));
export default pageLoader;
