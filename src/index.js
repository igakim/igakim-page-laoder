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
    return fsp.writeFile(path.resolve(dir, fileName), res.data);
  })
  .catch(e => console.log(e));
export default pageLoader;
