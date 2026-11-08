import { createServer, request } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendPort = Number(process.env.FRONTEND_PORT || 5173);
const backendPort = Number(process.env.BACKEND_PORT || 8080);
const publicDirectory = fileURLToPath(new URL('./public', import.meta.url));
const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
};

function proxyApi(incoming, outgoing) {
    const backend = request({
        hostname: '127.0.0.1',
        port: backendPort,
        path: incoming.url,
        method: incoming.method,
        headers: { ...incoming.headers, host: `127.0.0.1:${backendPort}` },
    }, response => {
        outgoing.writeHead(response.statusCode, response.headers);
        response.on('error', error => outgoing.destroy(error));
        response.pipe(outgoing);
    });

    backend.setTimeout(10000, () => backend.destroy(new Error('Backend timed out')));
    backend.on('error', () => {
        if (outgoing.destroyed) return;
        if (outgoing.headersSent) {
            outgoing.destroy();
            return;
        }
        outgoing.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
        outgoing.end(JSON.stringify({ status: 'DOWN', error: 'BACKEND_UNAVAILABLE' }));
    });
    outgoing.on('close', () => { if (!outgoing.writableFinished) backend.destroy(); });
    incoming.pipe(backend);
}

async function servePage(incoming, outgoing) {
    if (incoming.method !== 'GET' && incoming.method !== 'HEAD') {
        outgoing.writeHead(405, { Allow: 'GET, HEAD' }).end();
        return;
    }
    let pathname;
    try {
        pathname = decodeURIComponent(new URL(incoming.url, 'http://localhost').pathname);
    } catch {
        outgoing.writeHead(400).end();
        return;
    }
    const file = resolve(publicDirectory, pathname === '/' ? 'index.html' : `.${pathname}`);
    if (!file.startsWith(publicDirectory + sep)) {
        outgoing.writeHead(404).end();
        return;
    }
    try {
        const body = await readFile(file);
        outgoing.writeHead(200, {
            'Content-Type': contentTypes[extname(file)] || 'application/octet-stream',
            'Content-Length': body.length,
            'Cache-Control': 'no-store',
        });
        outgoing.end(incoming.method === 'HEAD' ? undefined : body);
    } catch (error) {
        const notFound = ['ENOENT', 'ENOTDIR', 'EISDIR'].includes(error.code);
        outgoing.writeHead(notFound ? 404 : 500).end();
    }
}

createServer((incoming, outgoing) => {
    const path = incoming.url.split('?')[0];
    if (path === '/api' || path.startsWith('/api/')) {
        proxyApi(incoming, outgoing);
        return;
    }
    void servePage(incoming, outgoing);
}).listen(frontendPort, '127.0.0.1', () => {
    console.log(`T93 frontend: http://127.0.0.1:${frontendPort}/`);
    console.log(`API proxy: /api/* -> http://127.0.0.1:${backendPort}`);
});
