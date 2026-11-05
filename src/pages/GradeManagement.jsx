import { useMemo, useState } from 'react'
import { Search, Save } from 'lucide-react'
import { subjects } from '../data/academicOptions.js'
import { activeAssessmentComponents as components } from '../data/assessmentComponents.js'
import KktpManagement from './KktpManagement.jsx'
import { calculateGradeSummary, evaluateAttainment } from '../utils/gradeCalculations.js'
import { getGradeContextKey, prepareGradeRecords, readGradeRecords, writeGradeRecords } from '../utils/gradeStorage.js'
import { getKktpValue, readKktpRecords } from '../utils/kktpStorage.js'
import { academicYears, classes, getRoster } from '../data/students.js'
import './grade-management.css'

const initialContext = { year: '2025/2026', className: 'Kelas 4', subject: 'Matematika', period: 'Semester 1' }

export default function GradeManagement() {
  const [context, setContext] = useState(initialContext)
  const [activeView, setActiveView] = useState('nilai')
  const [records, setRecords] = useState(readGradeRecords)
  const [kktpRecords, setKktpRecords] = useState(readKktpRecords)
  const [draft, setDraft] = useState(() => records[getGradeContextKey(initialContext)] || {})
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const key = getGradeContextKey(context)
  const currentKktp = getKktpValue(kktpRecords, context)
  const roster = useMemo(() => getRoster(context.year, context.className), [context.year, context.className])
  const visible = useMemo(() => roster.filter(student => `${student.name} ${student.id}`.toLowerCase().includes(query.toLowerCase())), [roster, query])
  const updateContext = (field, value) => {
    const next = { ...context, [field]: value }
    setContext(next); setDraft(records[getGradeContextKey(next)] || {}); setMessage('')
  }
  const updateGrade = (studentId, componentId, value) => {
    setDraft(previous => ({ ...previous, [studentId]: { ...previous[studentId], [componentId]: value } }))
    setMessage('')
  }
  const filled = roster.reduce((count, student) => count + components.filter(component => {
    const value = draft[student.id]?.[component.id]
    return value !== '' && value !== null && value !== undefined
  }).length, 0)
  const save = () => {
    const prepared = prepareGradeRecords(draft, roster, components)
    if (prepared.error) { setMessage(prepared.error); return }
    const next = { ...records, [key]: prepared.records }
    if (!writeGradeRecords(next)) { setMessage('Gagal menyimpan. Penyimpanan browser mungkin tidak tersedia.'); return }
    setRecords(next); setDraft(prepared.records); setMessage('Perubahan tersimpan di penyimpanan lokal prototype.')
  }
  return <section className="grade-page">
    <div className="sim-notice"><b>Data simulasi</b><span>Nama dan ID siswa dibuat untuk prototype, bukan data sekolah. Komponen penilaian juga simulasi dan belum menjadi ketentuan final.</span></div>
    <div className="grade-view-switch" aria-label="Bagian pengelolaan nilai">
      <button type="button" aria-pressed={activeView === 'nilai'} onClick={() => setActiveView('nilai')}>Pengelolaan Nilai</button>
      <button type="button" aria-pressed={activeView === 'kktp'} onClick={() => setActiveView('kktp')}>Pengelolaan KKTP</button>
    </div>
    {activeView === 'kktp' ? <KktpManagement records={kktpRecords} onRecordsChange={setKktpRecords} initialContext={context}/> : <>
    <div className="grade-filters">{[['year','Tahun ajaran',academicYears],['className','Kelas',classes],['subject','Mata pelajaran',subjects],['period','Periode',['Semester 1','Semester 2']]].map(([field,label,options]) => <label key={field}>{label}<select value={context[field]} onChange={event => updateContext(field,event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></label>)}</div>
    <div className="kktp-panel"><div><h2>KKTP untuk hasil nilai ini</h2><p>{context.year} · {context.className} · {context.subject}</p><span>{currentKktp === null ? 'KKTP belum ditetapkan' : `KKTP: ${currentKktp}`}</span></div><button type="button" onClick={() => setActiveView('kktp')}>Kelola KKTP dan riwayat</button></div>
    <div className="grade-summary"><span><b>{filled}</b> nilai terisi dari {roster.length * components.length}</span><span><b>{roster.length * components.length - filled}</b> belum diisi</span><label className="grade-search"><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama atau ID simulasi" aria-label="Cari siswa"/></label></div>
    <div className="grade-table-wrap"><table className="grade-table"><thead><tr><th>Siswa simulasi</th>{components.map(component => <th key={component.id}>{component.name}<small>{component.required ? 'Wajib' : 'Tidak wajib'} · 0–100</small></th>)}<th>Hasil</th></tr></thead><tbody>{visible.map(student => {
      const values = draft[student.id] || {}
      const summary = calculateGradeSummary(values, components)
      const displayedGrade = summary.officialGrade ?? summary.average
      return <tr key={student.id}><td><b>{student.name}</b><small>{student.id}</small></td>{components.map(component => { const value = values[component.id] ?? ''; return <td key={component.id}><input className={value === '' ? 'grade-empty' : ''} type="number" min="0" max="100" step="any" value={value} placeholder="Kosong" onChange={event => updateGrade(student.id,component.id,event.target.value)} aria-label={`${component.name}, ${student.name}`}/></td> })}<td><b>{displayedGrade === null ? '—' : Number(displayedGrade.toFixed(2))}</b><small>{summary.isComplete ? 'Nilai akhir · Lengkap' : summary.hasAnyGrade || summary.invalidComponents.length ? 'Rata-rata sementara · Belum Lengkap' : 'Belum ada nilai'}</small>{summary.missingRequired.length > 0 && <small>Belum diisi: {summary.missingRequired.map(item => item.name).join(', ')}</small>}{summary.invalidComponents.length > 0 && <small>Nilai di luar rentang 0–100: {summary.invalidComponents.map(item => item.name).join(', ')}</small>}<small className="attainment">{evaluateAttainment(summary,currentKktp)}</small></td></tr>
    })}</tbody></table>{visible.length === 0 && <p className="grade-empty-result">{roster.length === 0 ? `Belum ada siswa dengan penempatan ${context.className} pada tahun ajaran ${context.year}.` : 'Tidak ada siswa pada kelas ini yang cocok dengan pencarian.'}</p>}</div>
    <div className="grade-actions"><span role="status">{message}</span><button onClick={save}><Save size={16}/>Simpan perubahan</button></div>
    <p className="grade-note">Rata-rata menghitung semua komponen aktif yang terisi; kelengkapan ditentukan dari komponen wajib. Nilai akhir tidak disimpan terpisah. Nilai tersimpan di localStorage sebagai penyimpanan prototype, bukan database final.</p>
    </>}
  </section>
}
