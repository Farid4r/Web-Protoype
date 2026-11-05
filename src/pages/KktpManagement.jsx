import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { subjects } from '../data/academicOptions.js'
import { academicYears, classes } from '../data/students.js'
import { isValidKktpValue, listKktpRecords, saveKktpRecord, writeKktpRecords } from '../utils/kktpStorage.js'
import './kktp-management.css'

const emptyFilters = { year: '', className: '', subject: '' }

function formatDate(value) {
  if (!value) return 'Tanggal tidak tercatat'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Tanggal tidak tercatat' : date.toLocaleString('id-ID')
}

export default function KktpManagement({ records, onRecordsChange, initialContext }) {
  const [filters, setFilters] = useState(emptyFilters)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(() => ({
    year: initialContext.year,
    className: initialContext.className,
    subject: initialContext.subject,
    value: '',
  }))
  const [editingKey, setEditingKey] = useState(null)
  const [historyKey, setHistoryKey] = useState(null)
  const [message, setMessage] = useState('')
  const allRecords = useMemo(() => listKktpRecords(records), [records])
  const visibleRecords = allRecords
    .filter(record => (!filters.year || record.year === filters.year)
      && (!filters.className || record.className === filters.className)
      && (!filters.subject || record.subject === filters.subject)
      && `${record.year} ${record.className} ${record.subject}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.year.localeCompare(a.year) || a.className.localeCompare(b.className, 'id', { numeric: true }) || a.subject.localeCompare(b.subject, 'id'))
  const historyRecord = visibleRecords.find(record => record.key === historyKey)

  const clearForm = () => {
    setForm({ ...initialContext, value: '' })
    setEditingKey(null)
    setMessage('')
  }

  const selectRecord = record => {
    setForm({ year: record.year, className: record.className, subject: record.subject, value: String(record.value) })
    setEditingKey(record.key)
    setHistoryKey(record.key)
    setMessage('')
  }

  const save = event => {
    event.preventDefault()
    if (!isValidKktpValue(form.value)) {
      setMessage('Nilai KKTP harus berupa angka dari 0 sampai 100.')
      return
    }
    const context = { year: form.year, className: form.className, subject: form.subject }
    const result = saveKktpRecord(records, context, form.value, editingKey ? 'edit' : 'add')
    if (result.error) {
      setMessage(result.error)
      return
    }
    if (result.unchanged) {
      setMessage('Nilai tidak berubah; riwayat tetap seperti sebelumnya.')
      return
    }
    if (!writeKktpRecords(result.records)) {
      setMessage('Gagal menyimpan. Penyimpanan browser mungkin tidak tersedia.')
      return
    }
    onRecordsChange(result.records)
    setEditingKey(result.key)
    setHistoryKey(result.key)
    setMessage(editingKey ? 'Perubahan KKTP tersimpan dan masuk ke riwayat prototype.' : 'KKTP simulasi berhasil ditambahkan.')
  }

  return <section className="kktp-management" aria-labelledby="kktp-management-title">
    <div className="kktp-intro">
      <div>
        <h2 id="kktp-management-title">Pengelolaan KKTP</h2>
        <p>Setiap KKTP terhubung dengan satu tahun ajaran, kelas, dan mata pelajaran.</p>
      </div>
      <span className="kktp-simulation-label">Data simulasi</span>
    </div>
    <p className="kktp-prototype-note">Tidak ada nilai KKTP sekolah yang diisi otomatis. Data disimpan di localStorage untuk prototype, bukan database final.</p>

    <form className="kktp-form" onSubmit={save}>
      <div className="kktp-form-heading">
        <h3>{editingKey ? 'Ubah KKTP' : 'Tambah KKTP'}</h3>
        {editingKey && <button type="button" className="kktp-text-button" onClick={clearForm}>Batal mengubah</button>}
      </div>
      <div className="kktp-form-fields">
        <label>Tahun ajaran
          <select required value={form.year} disabled={Boolean(editingKey)} onChange={event => setForm(previous => ({ ...previous, year: event.target.value }))}>
            {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label>Kelas
          <select required value={form.className} disabled={Boolean(editingKey)} onChange={event => setForm(previous => ({ ...previous, className: event.target.value }))}>
            {classes.map(className => <option key={className} value={className}>{className}</option>)}
          </select>
        </label>
        <label>Mata pelajaran
          <select required value={form.subject} disabled={Boolean(editingKey)} onChange={event => setForm(previous => ({ ...previous, subject: event.target.value }))}>
            {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
          </select>
        </label>
        <label>Nilai KKTP (0–100)
          <input required type="number" min="0" max="100" step="any" value={form.value} placeholder="Masukkan nilai" onChange={event => setForm(previous => ({ ...previous, value: event.target.value }))}/>
        </label>
      </div>
      <div className="kktp-form-actions">
        <span role="status">{message}</span>
        <button type="submit">{editingKey ? 'Simpan perubahan' : 'Tambah KKTP'}</button>
      </div>
    </form>

    <div className="kktp-list-heading">
      <div><h3>Daftar KKTP</h3><span>{visibleRecords.length} data</span></div>
      <label className="kktp-search"><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari tahun, kelas, atau mata pelajaran" aria-label="Cari data KKTP"/></label>
    </div>
    <div className="kktp-filters">
      <label>Tahun ajaran
        <select value={filters.year} onChange={event => setFilters(previous => ({ ...previous, year: event.target.value }))}>
          <option value="">Semua tahun</option>{academicYears.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
      <label>Kelas
        <select value={filters.className} onChange={event => setFilters(previous => ({ ...previous, className: event.target.value }))}>
          <option value="">Semua kelas</option>{classes.map(className => <option key={className} value={className}>{className}</option>)}
        </select>
      </label>
      <label>Mata pelajaran
        <select value={filters.subject} onChange={event => setFilters(previous => ({ ...previous, subject: event.target.value }))}>
          <option value="">Semua mata pelajaran</option>{subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
        </select>
      </label>
    </div>

    <div className="kktp-table-wrap">
      <table className="kktp-table">
        <thead><tr><th>Tahun ajaran</th><th>Kelas</th><th>Mata pelajaran</th><th>KKTP</th><th>Terakhir diubah</th><th>Aksi</th></tr></thead>
        <tbody>{visibleRecords.map(record => <tr key={record.key}>
          <td>{record.year}</td><td>{record.className}</td><td>{record.subject}</td><td><b>{record.value}</b></td>
          <td>{formatDate(record.updatedAt)}</td>
          <td className="kktp-row-actions"><button type="button" onClick={() => selectRecord(record)}>Ubah</button><button type="button" onClick={() => setHistoryKey(record.key)}>Riwayat</button></td>
        </tr>)}</tbody>
      </table>
      {visibleRecords.length === 0 && <p className="kktp-empty">{allRecords.length ? 'Tidak ada KKTP yang cocok dengan pencarian atau filter.' : 'Belum ada data KKTP simulasi. Tambahkan nilai yang telah ditetapkan untuk konteks yang dipilih.'}</p>}
    </div>

    {historyRecord && <section className="kktp-history" aria-labelledby="kktp-history-title">
      <div><h3 id="kktp-history-title">Riwayat perubahan</h3><p>{historyRecord.year} · {historyRecord.className} · {historyRecord.subject}</p></div>
      <ol>{historyRecord.history.map((item, index) => <li key={`${item.changedAt ?? 'legacy'}-${index}-${item.value}`}>
        <b>{item.value}</b><span>{item.action}</span><time>{formatDate(item.changedAt)}</time>
      </li>)}</ol>
    </section>}
  </section>
}
