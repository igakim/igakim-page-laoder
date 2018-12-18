import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { promises as fsp } from 'fs';
import os from 'os';
import path from 'path';
import url from 'url';
import pageLoader from '../src';

axios.defaults.adatper = httpAdapter;

const host = 'https://hexlet.io/';
const page = '/courses/';
const loadingPage = url.resolve(host, page);
const fileName = 'hexlet-io-courses.html';

beforeEach(async () => {
  nock(host)
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get(page)
    .reply(200, 'Hello, Hexlet!');
});

it('should return true if file exists and has body', async () => {
  const output = await fsp.mkdtemp(path.join(os.tmpdir(), 'hexlet-'));
  await pageLoader(loadingPage, { output });
  const result = await fsp.stat(path.join(output, fileName));
  expect(result.isFile()).toBe(true);
  const body = await fsp.readFile(path.join(output, fileName));
  expect(body.toString()).toBe('Hello, Hexlet!');
});
