import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { BookOpen, ChevronDown, ClipboardList, GraduationCap, LayoutDashboard, Menu, PanelLeftClose, TrendingUp, Users, Bell } from 'lucide-react'
import { useState } from 'react'
import './app.css'

const nav = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Data Siswa', to: '/siswa', icon: Users },
  { label: 'Pengelolaan Nilai', to: '/nilai', icon: ClipboardList },
  { label: 'Monitoring Perkembangan', to: '/monitoring', icon: TrendingUp },
  { label: 'Rekapitulasi', to: '/rekapitulasi', icon: BookOpen },
]
const details = {
  '/': ['Dashboard', 'Ringkasan sistem informasi monitoring hasil belajar.'],
  '/siswa': ['Data Siswa', 'Halaman pengelolaan data siswa akan dikembangkan pada tahap berikutnya.'],
  '/nilai': ['Pengelolaan Nilai', 'Halaman pengelolaan nilai akan dikembangkan pada tahap berikutnya.'],
  '/monitoring': ['Monitoring Perkembangan', 'Halaman monitoring perkembangan akan dikembangkan pada tahap berikutnya.'],
  '/rekapitulasi': ['Rekapitulasi', 'Halaman rekapitulasi akan dikembangkan pada tahap berikutnya.'],
}
function App() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const [title, subtitle] = details[location.pathname] || details['/']
  return <div className="shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><GraduationCap size={22}/></span><span><b>Ruang Belajar</b><small>MONITORING AKADEMIK</small></span><button className="collapse" aria-label="Tutup menu" onClick={() => setOpen(false)}><PanelLeftClose size={18}/></button></div>
      <div className="school"><span className="school-icon"><BookOpen size={18}/></span><span><b>Portal Akademik</b><small>Prototype sistem</small></span><ChevronDown size={16}/></div>
      <p className="nav-label">MENU UTAMAA</p>
      <nav aria-label="Navigasi utama">{nav.map(({label,to,icon:Icon}) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-foot"><span className="prototype-dot"/>Prototype frontend <small>Data belum terhubung</small></div>
    </aside>
    {open && <button className="scrim" aria-label="Tutup menu" onClick={() => setOpen(false)}/>}
    <div className="main-column">
      <header className="topbar"><button className="mobile-menu" aria-label="Buka menu" onClick={() => setOpen(true)}><Menu size={21}/></button><div className="crumb">Ruang Belajar <span>/</span> <b>{title}</b></div><div className="top-actions"><span className="academic">Sistem Informasi Akademik</span><button className="icon-button" aria-label="Notifikasi"><Bell size={19}/></button><div className="user-chip"><span className="avatar">P</span><span><b>Pengguna</b><small>Prototype</small></span><ChevronDown size={15}/></div></div></header>
      <main className="content"><div className="page-heading"><div><p className="eyebrow">SISTEM MONITORING HASIL BELAJAR</p><h1>{title}</h1><p className="subtitle">{subtitle}</p></div></div><Routes>{nav.map(({to,label,icon:Icon}) => <Route key={to} path={to} element={<section className="placeholder"><span className="placeholder-icon"><Icon size={24}/></span><div><h2>{label}</h2><p>Area halaman ini disiapkan sebagai fondasi navigasi prototype.</p><span className="status"><span/>Dalam tahap pengembangan</span></div></section>} />)}</Routes><footer>Prototype antarmuka � Sistem Monitoring Perkembangan Hasil Belajar</footer></main>
    </div>
  </div>
}
export default App

