// /api/pba/[...path]
// PBA 工程点检 · 多人协同后端（Vercel Blob，按记录分片存储，避免并发覆盖）
const { put, list, del, get } = require('@vercel/blob');

const ROOT = 'pba';
const cache = new Map(); // pathname -> {t, data}
const TTL = 2000;

const clean = (s) => String(s == null ? '' : s).replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 96);
const nid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const nowISO = () => new Date().toISOString();

function cacheSet(k, data) { cache.set(k, { t: Date.now(), data }); }
function cacheGet(k) { const c = cache.get(k); if (c && Date.now() - c.t < TTL) return c.data; return undefined; }
function invalidate(prefix) { for (const k of cache.keys()) if (k.startsWith(prefix) || prefix.startsWith(k)) cache.delete(k); }

async function readJSON(pathname, useCache = true) {
  if (useCache) { const c = cacheGet(pathname); if (c !== undefined) return c; }
  const r = await get(pathname, { access: 'private' });
  if (!r || r.statusCode !== 200 || !r.stream) return null;
  const txt = await new Response(r.stream).text();
  const data = JSON.parse(txt);
  cacheSet(pathname, data);
  return data;
}

async function writeJSON(pathname, obj) {
  await put(pathname, JSON.stringify(obj), {
    access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true,
  });
  invalidate(pathname);
}

async function removePath(pathname) {
  try { await del(pathname); } catch (e) { /* already gone */ }
  invalidate(pathname);
}

async function listBlobs(prefix) {
  let cursor;
  const out = [];
  do {
    const r = await list({ prefix, limit: 1000, cursor });
    out.push(...(r.blobs || []));
    cursor = r.hasMore ? r.cursor : null;
  } while (cursor);
  return out;
}

async function listJSON(prefix, { useCache = true, cap = 3000 } = {}) {
  const blobs = await listBlobs(prefix);
  const picked = blobs.slice(-cap);
  const rows = await Promise.all(picked.map(async (b) => {
    try { return await readJSON(b.pathname, useCache); } catch (e) { return null; }
  }));
  return rows.filter(Boolean);
}

async function removeCollection(prefix) {
  const blobs = await listBlobs(prefix);
  await Promise.all(blobs.map((b) => removePath(b.pathname)));
}

const body = (req) => {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  return b || {};
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  let seg = [];
  const q = Object.assign({}, req.query);
  const rawP = String(q.p || '');
  delete q.p;
  if (rawP) {
    const [pPath, pQs] = rawP.split('?');
    seg = pPath.split('/').filter(Boolean).map((x) => { try { return decodeURIComponent(x); } catch (e) { return x; } });
    if (pQs) for (const [k, v] of new URLSearchParams(pQs)) q[k] = v;
  }

  try {
    if (!seg.length) return res.status(200).json({ ok: true, service: 'pba', hint: '/api/pba?p=/ping' });
    if (seg[0] === 'ping') {
      return res.status(200).json({ ok: true, mode: 'blob', time: nowISO() });
    }

    // ===== settings =====
    if (seg[0] === 'settings') {
      const P = `${ROOT}/settings.json`;
      if (seg[1] === 'field' && m === 'PUT') {
        const cur = (await readJSON(P)) || { id: 1, partnerName: '', factoryName: '', isSetupComplete: false, autoSaveDraft: false };
        const b = body(req);
        if (!b.field) return res.status(400).json({ error: 'field_required' });
        cur[b.field] = b.value;
        await writeJSON(P, cur);
        return res.status(200).json(cur);
      }
      if (m === 'GET') {
        const cur = await readJSON(P);
        return res.status(200).json(cur || { id: 1, partnerName: '', factoryName: '', isSetupComplete: false, autoSaveDraft: false });
      }
      if (m === 'PUT') {
        const b = body(req);
        const cur = (await readJSON(P)) || { id: 1 };
        const next = Object.assign(cur, b, { id: 1, updatedAt: nowISO() });
        await writeJSON(P, next);
        return res.status(200).json(next);
      }
    }

    // ===== processes =====
    if (seg[0] === 'processes') {
      const P = `${ROOT}/processes/`;
      if (seg[2] === 'itemcount' && m === 'PUT') {
        const rec = await readJSON(P + clean(seg[1]) + '.json');
        if (!rec) return res.status(404).json({ error: 'not_found' });
        rec.itemCount = body(req).itemCount;
        await writeJSON(P + clean(seg[1]) + '.json', rec);
        return res.status(200).json(rec);
      }
      if (m === 'GET') return res.status(200).json(await listJSON(P));
      if (m === 'POST') {
        const b = body(req);
        const all = await listJSON(P, { useCache: false });
        const dup = all.find((x) => x.name === b.name);
        if (dup) {
          if (b.itemCount != null && dup.itemCount !== b.itemCount) {
            dup.itemCount = b.itemCount; await writeJSON(P + clean(dup.id) + '.json', dup);
          }
          return res.status(200).json(dup.id);
        }
        const rec = Object.assign({}, b, { id: nid(), createdAt: nowISO() });
        await writeJSON(P + clean(rec.id) + '.json', rec);
        return res.status(200).json(rec.id);
      }
      if (m === 'DELETE') {
        await removeCollection(P);
        await removeCollection(`${ROOT}/items/`);
        await removeCollection(`${ROOT}/mapping/`);
        return res.status(200).json({ ok: true });
      }
    }

    // ===== lines =====
    if (seg[0] === 'lines') {
      const P = `${ROOT}/lines/`;
      if (m === 'GET') {
        const rows = await listJSON(P);
        rows.sort((a, b) => (a.order || 0) - (b.order || 0));
        return res.status(200).json(rows);
      }
      if (m === 'POST') {
        const b = body(req);
        const all = await listJSON(P, { useCache: false });
        const dup = all.find((x) => x.name === b.name);
        if (dup) return res.status(200).json(dup.id);
        const rec = { id: nid(), name: b.name, order: b.order != null ? b.order : all.length + 1, createdAt: nowISO() };
        await writeJSON(P + clean(rec.id) + '.json', rec);
        return res.status(200).json(rec.id);
      }
      if (m === 'DELETE') {
        await removeCollection(P);
        await removeCollection(`${ROOT}/mapping/`);
        return res.status(200).json({ ok: true });
      }
    }

    // ===== line-mapping =====
    if (seg[0] === 'line-mapping') {
      const P = `${ROOT}/mapping/`;
      if (m === 'GET') {
        const lineId = seg[1];
        const rows = (await listJSON(P)).filter((x) => String(x.lineId) === String(lineId));
        if (seg[2] === 'active') return res.status(200).json(rows.filter((x) => x.isActive));
        return res.status(200).json(rows);
      }
      if (m === 'POST') {
        const b = body(req);
        const all = await listJSON(P, { useCache: false });
        const ids = [];
        for (const pid of (b.processIds || [])) {
          const dup = all.find((x) => String(x.lineId) === String(b.lineId) && String(x.processId) === String(pid));
          if (dup) { ids.push(dup.id); continue; }
          const rec = { id: nid(), lineId: b.lineId, processId: pid, isActive: true, createdAt: nowISO() };
          await writeJSON(P + clean(rec.id) + '.json', rec);
          ids.push(rec.id);
        }
        return res.status(200).json(ids);
      }
      if (m === 'PUT') {
        const id = seg[1];
        const rec = await readJSON(P + clean(id) + '.json');
        if (!rec) return res.status(404).json({ error: 'not_found' });
        Object.assign(rec, body(req));
        await writeJSON(P + clean(id) + '.json', rec);
        return res.status(200).json(rec);
      }
    }

    // ===== checklist items =====
    if (seg[0] === 'checklist-items') {
      const P = `${ROOT}/items/`;
      if (m === 'GET') {
        let rows = await listJSON(P);
        if (q.processId) rows = rows.filter((x) => String(x.processId) === String(q.processId));
        if (q.inspectionType) rows = rows.filter((x) => (x.inspectionType || 'daily') === q.inspectionType);
        return res.status(200).json(rows);
      }
      if (m === 'POST') {
        const b = body(req);
        const all = await listJSON(P, { useCache: false });
        const dup = all.find((x) => String(x.processId) === String(b.processId)
          && String(x.no) === String(b.no) && (x.inspectionType || 'daily') === (b.inspectionType || 'daily'));
        if (dup) return res.status(200).json(dup.id);
        const rec = Object.assign({}, b, { id: nid(), createdAt: nowISO() });
        await writeJSON(P + clean(rec.id) + '.json', rec);
        return res.status(200).json(rec.id);
      }
      if (m === 'PUT') {
        const id = seg[1];
        const rec = await readJSON(P + clean(id) + '.json');
        if (!rec) return res.status(404).json({ error: 'not_found' });
        Object.assign(rec, body(req));
        await writeJSON(P + clean(id) + '.json', rec);
        return res.status(200).json(rec);
      }
      if (m === 'DELETE') {
        if (seg[1]) { await removePath(P + clean(seg[1]) + '.json'); return res.status(200).json({ ok: true }); }
        if (q.type) {
          const rows = (await listJSON(P)).filter((x) => (x.inspectionType || 'daily') === q.type);
          await Promise.all(rows.map((r) => removePath(P + clean(r.id) + '.json')));
          return res.status(200).json({ ok: true, deleted: rows.length });
        }
        return res.status(400).json({ error: 'id_or_type_required' });
      }
    }

    // ===== inspections =====
    if (seg[0] === 'inspections') {
      const P = `${ROOT}/inspections/`;
      if (m === 'GET' && !seg[1]) {
        const rows = await listJSON(P);
        rows.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        return res.status(200).json(rows);
      }
      if (m === 'GET' && seg[1]) {
        const rec = await readJSON(P + clean(seg[1]) + '.json');
        return rec ? res.status(200).json(rec) : res.status(404).json({ error: 'not_found' });
      }
      if (m === 'POST' && seg[1] === 'import') {
        const b = body(req);
        const rec = Object.assign({}, b, { id: b.id || nid(), createdAt: b.createdAt || nowISO(), imported: true });
        await writeJSON(P + clean(rec.id) + '.json', rec);
        return res.status(200).json(rec.id);
      }
      if (m === 'POST') {
        const b = body(req);
        const rec = Object.assign({}, b, { id: nid(), createdAt: nowISO() });
        await writeJSON(P + clean(rec.id) + '.json', rec);
        return res.status(200).json(rec.id);
      }
      if (m === 'DELETE' && seg[1]) {
        await removePath(P + clean(seg[1]) + '.json');
        await removeCollection(`${ROOT}/results/${clean(seg[1])}/`);
        return res.status(200).json({ ok: true });
      }
      if (m === 'PUT' && seg[2] === 'counts') {
        const rec = await readJSON(P + clean(seg[1]) + '.json');
        if (!rec) return res.status(404).json({ error: 'not_found' });
        const b = body(req);
        ['totalCount', 'passCount', 'failCount', 'naCount', 'holdCount'].forEach((k) => {
          if (b[k] != null) rec[k] = b[k];
        });
        rec.updatedAt = nowISO();
        await writeJSON(P + clean(seg[1]) + '.json', rec);
        return res.status(200).json(rec);
      }
    }

    // ===== inspection results =====
    if (seg[0] === 'inspection-results') {
      const P = `${ROOT}/results/`;
      if (m === 'POST') {
        const b = body(req);
        const inspId = b.inspectionId;
        if (!inspId) return res.status(400).json({ error: 'inspectionId_required' });
        const key = clean(b.checklistItemId || b.itemNo || nid());
        const rec = Object.assign({}, b, { id: b.id || nid(), updatedAt: nowISO() });
        if (seg[1] === 'import' && b.createdAt) rec.createdAt = b.createdAt;
        await writeJSON(`${P}${clean(inspId)}/${key}.json`, rec);
        return res.status(200).json({ ok: true, id: rec.id });
      }
      if (m === 'GET' && seg[1]) {
        const rows = await listJSON(`${P}${clean(seg[1])}/`);
        return res.status(200).json(rows);
      }
    }

    // ===== recent access =====
    if (seg[0] === 'recent-access') {
      const P = `${ROOT}/recent/`;
      if (m === 'GET') {
        const rows = await listJSON(P);
        rows.sort((a, b) => String(b.accessedAt || '').localeCompare(String(a.accessedAt || '')));
        return res.status(200).json(rows);
      }
      if (m === 'POST') {
        const b = body(req);
        const key = clean(`${b.lineId}_${b.processId}_${b.inspectionType || 'daily'}`);
        const cur = (await readJSON(P + key + '.json')) || {};
        await writeJSON(P + key + '.json', Object.assign({}, cur, b, { id: key, accessedAt: nowISO() }));
        return res.status(200).json({ ok: true });
      }
    }

    // ===== drafts =====
    if (seg[0] === 'drafts') {
      const P = `${ROOT}/drafts/`;
      if (m === 'GET' && !seg[1]) return res.status(200).json(await listJSON(P));
      if (m === 'GET' && seg[1]) {
        const rec = await readJSON(P + clean(decodeURIComponent(seg[1])) + '.json');
        return res.status(200).json(rec);
      }
      if (m === 'POST') {
        const b = body(req);
        if (!b.key) return res.status(400).json({ error: 'key_required' });
        const rec = { key: b.key, data: b.data, savedAt: nowISO() };
        await writeJSON(P + clean(b.key) + '.json', rec);
        return res.status(200).json({ ok: true });
      }
      if (m === 'DELETE') { await removePath(P + clean(decodeURIComponent(seg[1])) + '.json'); return res.status(200).json({ ok: true }); }
    }

    // ===== users =====
    if (seg[0] === 'users') {
      const P = `${ROOT}/users/`;
      if (m === 'GET') return res.status(200).json(await listJSON(P));
      if (m === 'POST') {
        const b = body(req);
        const all = await listJSON(P, { useCache: false });
        const dup = all.find((x) => x.name === b.name);
        if (dup) return res.status(200).json(dup.id);
        const rec = { id: nid(), name: b.name, role: b.role || 'inspector', createdAt: nowISO() };
        await writeJSON(P + clean(rec.id) + '.json', rec);
        return res.status(200).json(rec.id);
      }
      if (m === 'PUT') {
        const rec = await readJSON(P + clean(seg[1]) + '.json');
        if (!rec) return res.status(404).json({ error: 'not_found' });
        Object.assign(rec, body(req));
        await writeJSON(P + clean(seg[1]) + '.json', rec);
        return res.status(200).json(rec);
      }
      if (m === 'DELETE') { await removePath(P + clean(seg[1]) + '.json'); return res.status(200).json({ ok: true }); }
    }

    // ===== monitor =====
    if (seg[0] === 'monitor' && m === 'GET') {
      const tz = 'Asia/Seoul';
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date()); // YYYY-MM-DD
      const date = q.date || today;
      const all = await listJSON(`${ROOT}/inspections/`);
      const rows = (date === 'all' ? all : all.filter((x) => x.date === date))
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

      const totals = { inspections: rows.length, lines: 0, inspectors: 0, items: 0, done: 0, pass: 0, fail: 0, na: 0, hold: 0 };
      const partnerMap = new Map();
      const lineSet = new Set();
      const inspSet = new Set();

      for (const r of rows) {
        const total = Number(r.totalCount || 0);
        const pass = Number(r.passCount || 0);
        const fail = Number(r.failCount || 0);
        const na = Number(r.naCount || 0);
        const hold = Number(r.holdCount || 0);
        const done = pass + fail + na + hold;
        totals.items += total; totals.done += done; totals.pass += pass; totals.fail += fail; totals.na += na; totals.hold += hold;
        lineSet.add(`${r.partnerName || ''}|${r.lineName || ''}`);
        if (r.inspector) inspSet.add(r.inspector);

        const pk = r.partnerName || '(未设定)';
        if (!partnerMap.has(pk)) partnerMap.set(pk, { name: pk, factory: r.factoryName || '', lines: new Map(), inspectors: new Set(), totals: { items: 0, done: 0, pass: 0, fail: 0, na: 0, hold: 0 } });
        const p = partnerMap.get(pk);
        if (r.factoryName) p.factory = r.factoryName;
        if (r.inspector) p.inspectors.add(r.inspector);
        ['items', 'done', 'pass', 'fail', 'na', 'hold'].forEach((k) => { p.totals[k] += ({ items: total, done, pass, fail, na, hold })[k]; });

        const lk = r.lineName || '(未设定)';
        if (!p.lines.has(lk)) p.lines.set(lk, { name: lk, processes: [] });
        p.lines.get(lk).processes.push({
          inspectionId: r.id,
          process: r.processName || '',
          inspector: r.inspector || '',
          type: r.inspectionType || 'daily',
          total, done, pass, fail, na, hold,
          progress: total ? Math.round((done / total) * 100) : 0,
          status: total && done >= total ? 'done' : (done > 0 ? 'running' : 'pending'),
          createdAt: r.createdAt || '',
          updatedAt: r.updatedAt || r.createdAt || '',
        });
      }

      totals.lines = lineSet.size;
      totals.inspectors = inspSet.size;
      totals.progress = totals.items ? Math.round((totals.done / totals.items) * 100) : 0;

      // NG 明细（仅取有不良的 inspection，最多 15 条）
      const ngInsp = rows.filter((r) => Number(r.failCount || 0) + Number(r.holdCount || 0) > 0).slice(0, 15);
      const feed = [];
      for (const r of ngInsp) {
        const results = await listJSON(`${ROOT}/results/${clean(r.id)}/`);
        for (const it of results) {
          if (it.status === 'fail' || it.status === 'hold') {
            feed.push({
              time: it.updatedAt || it.createdAt || r.updatedAt || r.createdAt || '',
              partner: r.partnerName || '', line: r.lineName || '', process: r.processName || '',
              inspector: r.inspector || '', itemNo: it.itemNo || '', status: it.status,
              remark: it.remark || '', photo: it.photoUri ? String(it.photoUri).split('||')[0] : '',
            });
          }
        }
      }
      feed.sort((a, b) => String(b.time).localeCompare(String(a.time)));

      const partners = [...partnerMap.values()].map((p) => ({
        name: p.name, factory: p.factory,
        inspectors: [...p.inspectors],
        totals: p.totals,
        progress: p.totals.items ? Math.round((p.totals.done / p.totals.items) * 100) : 0,
        lines: [...p.lines.values()].map((l) => ({
          name: l.name,
          progress: (() => {
            const t = l.processes.reduce((s, x) => s + x.total, 0);
            const d = l.processes.reduce((s, x) => s + x.done, 0);
            return t ? Math.round((d / t) * 100) : 0;
          })(),
          processes: l.processes.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))),
        })).sort((a, b) => a.name.localeCompare(b.name)),
      })).sort((a, b) => a.name.localeCompare(b.name));

      return res.status(200).json({ generatedAt: nowISO(), date, timezone: tz, totals, partners, feed: feed.slice(0, 30) });
    }

    return res.status(404).json({ error: 'unknown_endpoint', path: seg });
  } catch (e) {
    return res.status(500).json({ error: 'server_error', message: String((e && e.message) || e) });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '12mb' } } };
