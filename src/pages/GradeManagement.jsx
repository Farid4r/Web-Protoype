import { useMemo, useState } from 'react'
import { Search, Save } from 'lucide-react'
import './grade-management.css'

const students = [
  { id: 'SIM-01', name: 'Alya Pratama' }, { id: 'SIM-02', name: 'Bima Saputra' },
  { id: 'SIM-03', name: 'Citra Lestari' }, { id: 'SIM-04', name: 'Dafa Ramadhan' },
  { id: 'SIM-05', name: 'Eka Wulandari' }, { id: 'SIM-06', name: 'Fajar Nugraha' },
  { id: 'SIM-07', name: 'Gita Permata' }, { id: 'SIM-08', name: 'Hana Maulida' },
]
const components = [{ id: 'tugas', label: 'Tugas' }, { id: 'kuis', label: 'Kuis' }, { id: 'asesmen', label: 'Asesmen' }]
const storageKey = 'ruang-belajar.nilai.v1'
const initialContext = { year: '2025/2026', className: 'Kelas 4', subject: 'Matematika', period: 'Semester 1' }
const contextKey = c => [c.year, c.className, c.subject, c.period].join('|')

export default function GradeManagement() {
  const [context, setContext] = useState(initialContext)
  const [records, setRecords] = useState(() => { try { return JSON.parse(localStorage.getItem(storageKey) || '{}') } catch { return {} } })
  const [draft, setDraft] = useState(() => records[contextKey(initialContext)] || {})
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const key = contextKey(context)
  const visible = useMemo(() => students.filter(s => `${s.name} ${s.id}`.toLowerCase().includes(query.toLowerCase())), [query])
  const updateContext = (field, value) => {
    const next = { ...context, [field]: value }; setContext(next); setDraft(records[contextKey(next)] || {}); setMessage('')
  }
  const updateGrade = (studentId, component, value) => {
    setDraft(prev => ({ ...prev, [studentId]: { ...prev[studentId], [component]: value } }))
    setMessage('')
  }
  const filled = students.reduce((n, s) => n + components.filter(c => draft[s.id]?.[c.id] !== '' && draft[s.id]?.[c.id] != null).length, 0)
  const save = () => {
    for (const s of students) for (const c of components) {
      const value = draft[s.id]?.[c.id]
      if (value !== '' && value != null && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
        setMessage(`Nilai ${c.label} untuk ${s.name} harus berada pada rentang 0–100.`); return
      }
    }
    const clean = Object.fromEntries(Object.entries(draft).map(([id, grades]) => [id, Object.fromEntries(Object.entries(grades).map(([comp, value]) => [comp, value === '' || value == null ? null : Number(value)]))]))
    const next = { ...records, [key]: clean }
    setRecords(next); setDraft(clean)
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setMessage('Perubahan nilai tersimpan di penyimpanan lokal prototype.') }
    catch { setMessage('Gagal menyimpan. Penyimpanan browser mungkin tidak tersedia.') }
  }
  return <section className="grade-page">
    <div className="sim-notice"><b>Data simulasi</b><span>Nama dan ID siswa dibuat khusus untuk prototype; bukan data sekolah.</span></div>
    <div className="grade-filters">{[['year','Tahun ajaran',['2025/2026','2026/2027']],['className','Kelas',['Kelas 4','Kelas 5','Kelas 6']],['subject','Mata pelajaran',['Matematika','Bahasa Indonesia','IPAS']],['period','Periode',['Semester 1','Semester 2']]].map(([field,label,options]) => <label key={field}>{label}<select value={context[field]} onChange={e => updateContext(field,e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select></label>)}</div>
    <div className="grade-summary"><span><b>{filled}</b> nilai terisi dari {students.length * components.length}</span><span><b>{students.length * components.length - filled}</b> belum diisi</span><label className="grade-search"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama atau ID simulasi" aria-label="Cari siswa"/></label></div>
    <div className="grade-table-wrap"><table className="grade-table"><thead><tr><th>Siswa simulasi</th>{components.map(c => <th key={c.id}>{c.label}<small>0–100</small></th>)}</tr></thead><tbody>{visible.map(s => <tr key={s.id}><td><b>{s.name}</b><small>{s.id}</small></td>{components.map(c => { const value = draft[s.id]?.[c.id] ?? ''; return <td key={c.id}><input className={value === '' ? 'grade-empty' : ''} type="number" min="0" max="100" step="any" value={value} placeholder="Belum diisi" onChange={e => updateGrade(s.id,c.id,e.target.value)} aria-label={`${c.label}, ${s.name}`} /></td> })}</tr>)}</tbody></table>{visible.length === 0 && <p className="grade-empty-result">Tidak ada siswa yang cocok dengan pencarian.</p>}</div>
    <div className="grade-actions"><span role="status">{message}</span><button onClick={save}><Save size={16}/>Simpan perubahan</button></div>
    <p className="grade-note">Nilai akhir, bobot komponen, dan KKTP belum dihitung. Perlu aturan sekolah yang tervalidasi.</p>
  </section>
}
