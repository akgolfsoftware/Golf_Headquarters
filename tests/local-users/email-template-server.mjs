/** Lokal app og Resend-protokollmottaker. Ingen ekte e-posttjeneste eller adresser. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { assertLocalUsersTargets } from '../../scripts/local-users-target.mjs';
assertLocalUsersTargets(process.env);
const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'POST' || req.url !== '/emails') throw Error('Unexpected request');
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 150_000) throw Error('Oversized'); chunks.push(chunk); }
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const recipients = Array.isArray(input.to) ? input.to : [input.to];
    if (recipients.length !== 1 || !/^[a-z0-9._+-]+@akgolf\.test$/i.test(recipients[0])) throw Error('Synthetic recipient required');
    if (input.subject.startsWith('[TEST] Avvis syntetisk')) {
      res.writeHead(422, { 'content-type': 'application/json' }).end(JSON.stringify({ name: 'validation_error', message: 'Synthetic rejection' })); return;
    }
    const received = await fetch('http://127.0.0.1:55624/api/v1/send', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      From: { Email: 'maltest@akgolf.test' }, To: recipients.map(Email => ({ Email })), Subject: input.subject, HTML: input.html, Tags: ['synthetic-template-editor'],
    }) });
    if (!received.ok) throw Error('Local receiver failure');
    const message = await received.json();
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ id: message.ID }));
  } catch { res.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ name: 'validation_error', message: 'Local test guard rejected request' })); }
});
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3061'], {
  stdio: 'inherit', env: { ...process.env, VEDLIKEHOLD: '0', RESEND_API_KEY: 're_synthetic_local_only', RESEND_BASE_URL: `http://127.0.0.1:${server.address().port}` },
});
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
child.on('exit', code => { server.close(); process.exitCode = code ?? 1; });
