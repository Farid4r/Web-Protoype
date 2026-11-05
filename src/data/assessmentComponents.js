// Komponen contoh untuk prototype; belum menjadi ketentuan final sekolah.
export const assessmentComponents = [
  { id: 'tugas', name: 'Tugas', required: true, active: true },
  { id: 'harian', name: 'Nilai Harian', required: true, active: true },
  { id: 'ulangan', name: 'Ulangan atau Tes', required: true, active: true },
  { id: 'uts', name: 'UTS', required: true, active: true },
  { id: 'uas', name: 'UAS', required: true, active: true },
]

export const activeAssessmentComponents = assessmentComponents.filter(component => component.active)
