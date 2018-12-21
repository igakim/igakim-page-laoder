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
const cdnHost = 'https://cdn2.hexlet.io/';
const page = '/courses/';
const loadingPage = url.resolve(host, page);
const fileName = 'hexlet-io-courses.html';

beforeAll(async () => {
  const html = await fsp.readFile(path.resolve(__dirname, '__fixtures__/index.html'), 'utf-8');
  const css = await fsp.readFile(path.resolve(__dirname, '__fixtures__/assets/style.css'), 'utf-8');
  const mainCss = await fsp.readFile(path.resolve(__dirname, '__fixtures__/assets/main.css'), 'utf-8');
  const js = await fsp.readFile(path.resolve(__dirname, '__fixtures__/assets/js/script.js'), 'utf-8');
  const img = await fsp.readFile(path.resolve(__dirname, '__fixtures__/assets/img/1.png'));

  nock(host)
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get(page)
    .reply(200, html);
  nock(host)
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get('/assets/style.css')
    .replyWithFile(200, path.join(__dirname, '__fixtures__/assets/style.css'));
  nock(host)
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get('/assets/main.css')
    .replyWithFile(200, path.join(__dirname, '__fixtures__/assets/main.css'));
  nock(host)
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get('/assets/js/script.js')
    .replyWithFile(200, path.join(__dirname, '__fixtures__/assets/js/script.js'));
  nock(host)
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get('/assets/img/1.png')
    .replyWithFile(200, path.join(__dirname, '__fixtures__/assets/img/1.png'));
  nock(cdnHost)
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get('/assets/essential-476044e86044baa43c1b5a57ffdcb6a8c8853888ec074dc6a5ac5b8141bfd1e6.js')
    .replyWithFile(200, path.join(__dirname, '__fixtures__/assets/js/script.js'));
});

it('should work if file exists and has body', async () => {
  const output = await fsp.mkdtemp(path.join(os.tmpdir(), 'hexlet-'));
  await pageLoader(loadingPage, { output });
  const result = await fsp.stat(path.join(output, fileName));
  expect(result.isFile()).toBe(true);

  const expected = await fsp.readFile(path.join(output, fileName), 'utf-8');
  const body = await fsp.readFile(path.resolve(__dirname, '__snapshots__/index.html'), 'utf-8');
  expect(expected.trim()).toBe(body);
});

it('should throw an error', async () => {
  const output = await fsp.mkdtemp(path.join(os.tmpdir(), 'hexlet-'));
  nock('https://hexlet.test/')
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get('/assets/js/script.js')
    .reply(404);

  const tt = async () => {
    try {
      await pageLoader('https://hexlet.test/assets/js/script.js', { output });
    } catch(e) {
      expect(e.message).toMatch('Request failed with status code 404');
    }
  }
});
