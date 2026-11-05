import { isGradeValueValid } from './gradeCalculations.js'

export const gradeStorageKey = 'ruang-belajar.nilai.v1'

export function getGradeContextKey(context) {
  return [context.year, context.className, context.subject, context.period].join('|')
}

export function readGradeRecords(storage = globalThis.localStorage) {
  try {
    const records = JSON.parse(storage?.getItem(gradeStorageKey) || '{}')
    return records && typeof records === 'object' && !Array.isArray(records) ? records : {}
  } catch {
    return {}
  }
}

export function prepareGradeRecords(draft, roster, components) {
  const clean = Object.fromEntries(Object.entries(draft).map(([studentId, values]) => [studentId, { ...values }]))

  for (const student of roster) {
    clean[student.id] ||= {}
    for (const component of components.filter(item => item.active)) {
      const value = clean[student.id][component.id]
      if (!isEmpty(value) && !isGradeValueValid(value)) {
        return { error: `Nilai ${component.name} untuk ${student.name} harus berada pada rentang 0–100.` }
      }
      clean[student.id][component.id] = isEmpty(value) ? null : Number(value)
    }
  }

  return { records: clean }
}

export function writeGradeRecords(records, storage = globalThis.localStorage) {
  try {
    if (!storage) return false
    storage.setItem(gradeStorageKey, JSON.stringify(records))
    return true
  } catch {
    return false
  }
}

const isEmpty = value => value === '' || value === null || value === undefined
