// host.js — the generic host (embedded into the server binary at build time),
// loaded only on pages that need liveness (the audit status page). It wires the
// reactive runtime's DOM ops, a returning http_get effect import, and a 10s poll.
const dec = new TextDecoder(), enc = new TextEncoder();
let mem, instance;
const cstr = (p) => { const b = new Uint8Array(mem.buffer); let e = p; while (b[e]) e++; return dec.decode(b.subarray(p, e)); };

const env = {
  // reactive runtime → DOM
  dom_mount: (r, h) => { const el = document.getElementById(cstr(r)); if (el) el.innerHTML = cstr(h); },
  dom_patch: (s, v) => { const el = document.querySelector('[data-s="' + cstr(s) + '"]'); if (el) el.textContent = cstr(v); },
  list_insert: (c, k, h) => { const li = document.createElement('li'); li.dataset.k = cstr(k); li.innerHTML = cstr(h); document.getElementById(cstr(c)).appendChild(li); },
  list_remove: (c, k) => { const el = document.querySelector('#' + cstr(c) + ' > [data-k="' + cstr(k) + '"]'); if (el) el.remove(); },
  list_order: (c, csv) => { const cont = document.getElementById(cstr(c)); for (const k of cstr(csv).split(',').filter(Boolean)) { const el = cont.querySelector('[data-k="' + k + '"]'); if (el) cont.appendChild(el); } },
  // returning effect import: MFL calls http_get(url) and gets the body back
  http_get: (u) => {
    let t = '';
    try { const xhr = new XMLHttpRequest(); xhr.open('GET', cstr(u), false); xhr.send(); if (xhr.status === 200) t = xhr.responseText; } catch (e) {}
    const r = enc.encode(t + '\0');
    const p = Number(instance.exports.alloc_export(BigInt(r.length)));
    new Uint8Array(mem.buffer).set(r, p);
    return p;
  },
};
// no-op WASI shim (imported but never called)
const wasi = { fd_write: () => 0, fd_seek: () => 0, fd_close: () => 0, fd_fdstat_get: () => 0 };

({ instance } = await WebAssembly.instantiateStreaming(fetch('/app.wasm'), { env, wasi_snapshot_preview1: wasi }));
mem = instance.exports.memory;
instance.exports._initialize?.();
instance.exports.start();

// audit status page: seed the issue number and poll until the audit is done.
if (typeof window.__ISSUE === 'number') {
  instance.exports.seed_issue(BigInt(window.__ISSUE));
  const iv = setInterval(() => { if (instance.exports.tick() === 1n) clearInterval(iv); }, 10000);
}
