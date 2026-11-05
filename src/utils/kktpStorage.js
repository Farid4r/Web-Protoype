export const kktpStorageKey = 'ruang-belajar.kktp.v1'

export function getKktpContextKey({ year, className, subject }) {
  return [year, className, subject].join('|')
}

export function readKktpRecords(storage = globalThis.localStorage) {
  try {
    const records = JSON.parse(storage?.getItem(kktpStorageKey) || '{}')
    return records && typeof records === 'object' && !Array.isArray(records) ? records : {}
  } catch {
    return {}
  }
}

export function isValidKktpValue(value) {
  return value !== '' && value !== null && value !== undefined
    && !(typeof value === 'string' && value.trim() === '')
    && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100
}

export function normalizeKktpRecord(record, context) {
  if (typeof record === 'number' && Number.isFinite(record)) {
    return {
      ...context,
      value: record,
      updatedAt: null,
      history: [{ value: record, changedAt: null, action: 'Nilai sebelumnya; tanggal tidak tercatat' }],
    }
  }

  if (!record || typeof record !== 'object' || !isValidKktpValue(record.value)) return null
  return {
    ...context,
    ...record,
    value: Number(record.value),
    history: Array.isArray(record.history) && record.history.length
      ? record.history
      : [{ value: Number(record.value), changedAt: record.updatedAt ?? null, action: 'KKTP tersimpan' }],
  }
}

export function listKktpRecords(records) {
  return Object.entries(records).flatMap(([key, stored]) => {
    const [year, className, subject] = key.split('|')
    const context = stored && typeof stored === 'object'
      ? { year: stored.year ?? year, className: stored.className ?? className, subject: stored.subject ?? subject }
      : { year, className, subject }
    if (!context.year || !context.className || !context.subject) return []
    const record = normalizeKktpRecord(stored, context)
    return record ? [{ key, ...record }] : []
  })
}

export function getKktpValue(records, context) {
  return normalizeKktpRecord(records[getKktpContextKey(context)], context)?.value ?? null
}

export function saveKktpRecord(records, context, rawValue, mode, changedAt = new Date().toISOString()) {
  if (!isValidKktpValue(rawValue)) return { error: 'Nilai KKTP harus berada pada rentang 0–100.' }

  const key = getKktpContextKey(context)
  const existing = records[key]
  if (mode === 'add' && existing !== undefined) {
    return { error: 'KKTP untuk tahun ajaran, kelas, dan mata pelajaran ini sudah tersedia.' }
  }
  if (mode === 'edit' && existing === undefined) {
    return { error: 'Data KKTP yang akan diubah sudah tidak tersedia. Muat ulang daftar.' }
  }

  const previous = normalizeKktpRecord(existing, context)
  const history = previous?.history ?? []
  const value = Number(rawValue)
  if (previous?.value === value) return { key, record: previous, records, unchanged: true }
  const record = {
    ...context,
    value,
    updatedAt: changedAt,
    history: [...history, {
      value,
      changedAt,
      action: previous ? 'KKTP diubah' : 'KKTP ditetapkan',
    }],
  }
  return { key, record, records: { ...records, [key]: record } }
}

export function writeKktpRecords(records, storage = globalThis.localStorage) {
  try {
    if (!storage) return false
    storage.setItem(kktpStorageKey, JSON.stringify(records))
    return true
  } catch {
    return false
  }
}
