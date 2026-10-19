import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!target.startsWith(root+sep)){res.writeHead(403).end();return}
    const data=await readFile(target);res.setHeader('Content-Type',mime[extname(target)]||'application/octet-stream');res.end(data);
  }catch(e){res.writeHead(404).end('not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
  await page.locator('#exam').click();
  await page.locator('#quiz:not(.hidden)').waitFor({timeout:8000});
  assert.match(await page.locator('#meta').innerText(),/1 \/ 44問/);
  assert.equal(await page.locator('#choices button').count(),5);
  assert.equal(await page.locator('#timer').innerText().then(s=>s.startsWith('残り')),true);
  page.once('dialog',d=>d.accept());
  await page.locator('#quit').click();
  await page.locator('#result:not(.hidden)').waitFor({timeout:8000});
  assert.match(await page.locator('#score').innerText(),/判定対象外/);
  assert.deepEqual(errors,[]);
  console.log('PASS: 44問模試の開始、選択肢5件、タイマー、途中終了');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
