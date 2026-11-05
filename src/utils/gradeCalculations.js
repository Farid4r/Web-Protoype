const isEmpty = value => value === '' || value === null || value === undefined

export function isGradeValueValid(value) {
  return isEmpty(value) || (Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100)
}

const getValidValues = (values, components) => components
  .filter(component => component.active)
  .map(component => values?.[component.id])
  .filter(value => !isEmpty(value) && isGradeValueValid(value))
  .map(Number)

export function calculateAvailableAverage(values, components) {
  const available = getValidValues(values, components)
  return available.length ? available.reduce((sum, value) => sum + value, 0) / available.length : null
}

export function getGradeCompleteness(values, components) {
  const activeComponents = components.filter(component => component.active)
  const missingRequired = activeComponents.filter(component => component.required)
    .filter(component => isEmpty(values?.[component.id]))
  const invalidComponents = activeComponents
    .filter(component => !isEmpty(values?.[component.id]) && !isGradeValueValid(values?.[component.id]))
  const hasAnyGrade = getValidValues(values, components).length > 0
  const isComplete = hasAnyGrade && missingRequired.length === 0 && invalidComponents.length === 0
  return {
    status: !hasAnyGrade && invalidComponents.length === 0 ? 'Belum ada nilai' : isComplete ? 'Lengkap' : 'Sebagian nilai terisi',
    missingRequired,
    invalidComponents,
    hasAnyGrade,
    isComplete,
  }
}

export function calculateGradeSummary(values, components) {
  const completeness = getGradeCompleteness(values, components)
  const average = calculateAvailableAverage(values, components)
  return {
    average,
    officialGrade: completeness.isComplete ? average : null,
    ...completeness,
  }
}

export function evaluateAttainment(summary, kktp) {
  if (!summary.isComplete) return 'Belum dapat ditentukan'
  if (kktp === null || kktp === undefined || kktp === '') return 'KKTP belum ditetapkan'
  if (summary.average === null) return 'Belum dapat ditentukan'
  return summary.average >= Number(kktp) ? 'Mencapai KKTP' : 'Belum Mencapai KKTP'
}
