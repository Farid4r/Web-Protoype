export function calculateAvailableAverage(values, components) {
  const available = components.filter(component => component.active)
    .map(component => values?.[component.id])
    .filter(value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)))
    .map(Number)
  return available.length ? available.reduce((sum, value) => sum + value, 0) / available.length : null
}

export function getGradeCompleteness(values, components) {
  const missingRequired = components.filter(component => component.active && component.required)
    .filter(component => values?.[component.id] === '' || values?.[component.id] === null || values?.[component.id] === undefined)
  return {
    status: missingRequired.length ? 'Belum lengkap' : 'Lengkap',
    missingRequired,
    isComplete: missingRequired.length === 0,
  }
}

export function calculateGradeSummary(values, components) {
  const completeness = getGradeCompleteness(values, components)
  return {
    average: calculateAvailableAverage(values, components),
    ...completeness,
  }
}

export function evaluateAttainment(summary, kktp) {
  if (!summary.isComplete) return 'Belum dapat dievaluasi'
  if (kktp === null || kktp === undefined || kktp === '') return 'KKTP belum dikonfigurasi'
  if (summary.average === null) return 'Belum dapat dievaluasi'
  return summary.average >= Number(kktp) ? 'Tercapai' : 'Belum tercapai'
}
