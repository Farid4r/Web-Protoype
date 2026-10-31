import { useMemo, useState } from 'react'
import { Search, Save } from 'lucide-react'
import { activeAssessmentComponents as components } from '../data/assessmentComponents.js'
import { calculateGradeSummary, evaluateAttainment } from '../utils/gradeCalculations.js'
import './grade-management.css'

const students = [
  { id: 'SIM-01', name: 'Alya Pratama' }, { id: 'SIM-02', name: 'Bima Saputra' },
  { id: 'SIM-03', name: 'Citra Lestari' }, { id: 'SIM-04', name: 'Dafa Ramadhan' },
  { id: 'SIM-05', name: 'Eka Wulandari' }, { id: 'SIM-06', name: 'Fajar Nugraha' },
  { id: 'SIM-07', name: 'Gita Permata' }, { id: 'SIM-08', name: 'Hana Maulida' },
]
const storageKey = 'ruang-belajar.nilai.v1'
const kktpStorageKey = 'ruang-belajar.kktp.v1'
const initialContext = { year: '2025/2026', className: 'Kelas 4', subject: 'Matematika', period: 'Semester 1' }
const contextKey = c => [c.year, c.className, c.subject, c.period].join('|')
const kktpKey = c => [c.year, c.className, c.subject].join('|')
const readRecords = () => { try { return JSON.parse(localStorage.getItem(storageKey) || '{}') } catch { return {} } }
const readKktpRecords = () => { try { return JSON.parse(localStorage.getItem(kktpStorageKey) || '{}') } catch { return {} } }

export default function GradeManagement() {
  const [context, setContext] = useState(initialContext)
  const [records, setRecords] = useState(readRecords)
  const [kktpRecords, setKktpRecords] = useState(readKktpRecords)
  const [kktpDraft, setKktpDraft] = useState(() => readKktpRecords()[kktpKey(initialContext)] ?? '')
  const [draft, setDraft] = useState(() => records[contextKey(initialContext)] || {})
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const key = contextKey(context)
  const visible = useMemo(() => students.filter(student => `${student.name} ${student.id}`.toLowerCase().includes(query.toLowerCase())), [query])
  const updateContext = (field, value) => {
    const next = { ...context, [field]: value }
    setContext(next); setDraft(records[contextKey(next)] || {}); setKktpDraft(kktpRecords[kktpKey(next)] ?? ''); setMessage('')
  }
  const updateGrade = (studentId, componentId, value) => {
    setDraft(previous => ({ ...previous, [studentId]: { ...previous[studentId], [componentId]: value } }))
    setMessage('')
  }
  const filled = students.reduce((count, student) => count + components.filter(component => {
    const value = draft[student.id]?.[component.id]
    return value !== '' && value !== null && value !== undefined
  }).length, 0)
  const save = () => {
    for (const student of students) for (const component of components) {
      const value = draft[student.id]?.[component.id]
      if (value !== '' && value != null && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
        setMessage(`Nilai ${component.name} untuk ${student.name} harus berada pada rentang 0–100.`); return
      }
    }
    const clean = Object.fromEntries(Object.entries(draft).map(([studentId, grades]) => [studentId,
      Object.fromEntries(components.map(component => {
        const value = grades?.[component.id]
        return [component.id, value === '' || value == null ? null : Number(value)]
      }))]))
    const next = { ...records, [key]: clean }
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
      setRecords(next); setDraft(clean); setMessage('Perubahan tersimpan di penyimpanan lokal prototype.')
    } catch { setMessage('Gagal menyimpan. Penyimpanan browser mungkin tidak tersedia.') }
  }
  const saveKktp = () => {
    if (kktpDraft === '' || !Number.isFinite(Number(kktpDraft)) || Number(kktpDraft) < 0 || Number(kktpDraft) > 100) {
      setMessage('KKTP wajib diisi dengan angka 0–100.'); return
    }
    const next = { ...kktpRecords, [kktpKey(context)]: Number(kktpDraft) }
    try {
      localStorage.setItem(kktpStorageKey, JSON.stringify(next))
      setKktpRecords(next); setMessage('KKTP tersimpan untuk tahun ajaran, kelas, dan mata pelajaran ini.')
    } catch { setMessage('Gagal menyimpan KKTP. Penyimpanan browser mungkin tidak tersedia.') }
  }
  return <section className="grade-page">
    <div className="sim-notice"><b>Data simulasi</b><span>Nama dan ID siswa dibuat untuk prototype, bukan data sekolah. Komponen penilaian juga simulasi dan belum menjadi ketentuan final.</span></div>
    <div className="grade-filters">{[['year','Tahun ajaran',['2025/2026','2026/2027']],['className','Kelas',['Kelas 4','Kelas 5','Kelas 6']],['subject','Mata pelajaran',['Matematika','Bahasa Indonesia','IPAS']],['period','Periode',['Semester 1','Semester 2']]].map(([field,label,options]) => <label key={field}>{label}<select value={context[field]} onChange={event => updateContext(field,event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></label>)}</div>
    <div className="kktp-panel"><div><h2>Pengaturan KKTP</h2><p>{context.year} · {context.className} · {context.subject}</p><span>{kktpRecords[kktpKey(context)] == null ? 'KKTP belum dikonfigurasi' : `KKTP tersimpan: ${kktpRecords[kktpKey(context)]}`}</span></div><label>Nilai KKTP<input aria-label="Nilai KKTP" type="number" min="0" max="100" step="any" value={kktpDraft} placeholder="Belum dikonfigurasi" onChange={event => { setKktpDraft(event.target.value); setMessage('') }}/></label><button onClick={saveKktp}>Simpan KKTP</button></div>
    <div className="grade-summary"><span><b>{filled}</b> nilai terisi dari {students.length * components.length}</span><span><b>{students.length * components.length - filled}</b> belum diisi</span><label className="grade-search"><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama atau ID simulasi" aria-label="Cari siswa"/></label></div>
    <div className="grade-table-wrap"><table className="grade-table"><thead><tr><th>Siswa simulasi</th>{components.map(component => <th key={component.id}>{component.name}<small>{component.required ? 'Wajib' : 'Tidak wajib'} · 0–100</small></th>)}<th>Hasil</th></tr></thead><tbody>{visible.map(student => {
      const values = draft[student.id] || {}
      const summary = calculateGradeSummary(values, components)
      return <tr key={student.id}><td><b>{student.name}</b><small>{student.id}</small></td>{components.map(component => { const value = values[component.id] ?? ''; return <td key={component.id}><input className={value === '' ? 'grade-empty' : ''} type="number" min="0" max="100" step="any" value={value} placeholder="Kosong" onChange={event => updateGrade(student.id,component.id,event.target.value)} aria-label={`${component.name}, ${student.name}`}/></td> })}<td><b>{summary.average === null ? '—' : Number(summary.average.toFixed(2))}</b><small>{summary.isComplete ? 'Nilai akhir · Lengkap' : 'Rata-rata sementara · Belum lengkap'}</small>{summary.missingRequired.length > 0 && <small>Belum diisi: {summary.missingRequired.map(item => item.name).join(', ')}</small>}<small className="attainment">{evaluateAttainment(summary,kktpRecords[kktpKey(context)])}</small></td></tr>
    })}</tbody></table>{visible.length === 0 && <p className="grade-empty-result">Tidak ada siswa yang cocok dengan pencarian.</p>}</div>
    <div className="grade-actions"><span role="status">{message}</span><button onClick={save}><Save size={16}/>Simpan perubahan</button></div>
    <p className="grade-note">Rata-rata menghitung semua komponen aktif yang terisi; kelengkapan ditentukan dari komponen wajib. Nilai akhir tidak disimpan terpisah. Tidak ada bobot atau KKTP.</p>
  </section>
}
