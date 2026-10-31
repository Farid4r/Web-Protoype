// Identitas dan penempatan berikut seluruhnya sintetis untuk prototype.
export const students = [
  { id: 'SIM-01', name: 'Alya Pratama' }, { id: 'SIM-02', name: 'Bima Saputra' },
  { id: 'SIM-03', name: 'Citra Lestari' }, { id: 'SIM-04', name: 'Dafa Ramadhan' },
  { id: 'SIM-05', name: 'Eka Wulandari' }, { id: 'SIM-06', name: 'Fajar Nugraha' },
  { id: 'SIM-07', name: 'Gita Permata' }, { id: 'SIM-08', name: 'Hana Maulida' },
]

export const studentPlacements = [
  ...students.slice(0, 4).map(student => ({ studentId: student.id, academicYear: '2025/2026', className: 'Kelas 4' })),
  ...students.slice(4, 8).map(student => ({ studentId: student.id, academicYear: '2025/2026', className: 'Kelas 5' })),
  ...students.slice(0, 4).map(student => ({ studentId: student.id, academicYear: '2026/2027', className: 'Kelas 5' })),
  ...students.slice(4, 8).map(student => ({ studentId: student.id, academicYear: '2026/2027', className: 'Kelas 6' })),
]

export const academicYears = [...new Set(studentPlacements.map(placement => placement.academicYear))].sort()
export const classes = [...new Set(studentPlacements.map(placement => placement.className))].sort((a, b) => a.localeCompare(b, 'id', { numeric: true }))

export function getRoster(academicYear, className) {
  const studentIds = new Set(studentPlacements
    .filter(placement => placement.academicYear === academicYear && placement.className === className)
    .map(placement => placement.studentId))
  return students.filter(student => studentIds.has(student.id))
}
