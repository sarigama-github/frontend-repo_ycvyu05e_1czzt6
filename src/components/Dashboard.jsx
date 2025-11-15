import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Section({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const [email, setEmail] = useState('john.doe@example.com')
  const [apartment, setApartment] = useState('A-301')
  const [notices, setNotices] = useState([])
  const [tickets, setTickets] = useState([])
  const [payments, setPayments] = useState([])
  const [assets, setAssets] = useState([])

  useEffect(() => {
    // pseudo login/upsert
    fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: 'John Doe', apartment }),
    })

    refresh()
  }, [])

  const refresh = async () => {
    const [n, t, p, a] = await Promise.all([
      fetch(`${API}/notices`).then(r => r.json()),
      fetch(`${API}/maintenance?email=${encodeURIComponent(email)}`).then(r => r.json()),
      fetch(`${API}/payments?email=${encodeURIComponent(email)}`).then(r => r.json()),
      fetch(`${API}/assets`).then(r => r.json()),
    ])
    setNotices(n)
    setTickets(t)
    setPayments(p)
    setAssets(a)
  }

  const dueAmount = useMemo(() => {
    const success = payments.filter(p => p.status === 'success')
    const paid = success.reduce((s, p) => s + (p.amount || 0), 0)
    const assumedMonthly = 1000
    return Math.max(0, assumedMonthly - paid)
  }, [payments])

  const createTicket = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())
    payload.requested_by = email
    payload.apartment = apartment
    payload.priority = payload.priority || 'medium'
    const res = await fetch(`${API}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      e.currentTarget.reset()
      refresh()
    }
  }

  const createReservation = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())
    payload.requested_by = email
    payload.start_time = new Date(payload.start_time)
    payload.end_time = new Date(payload.end_time)
    const res = await fetch(`${API}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      e.currentTarget.reset()
      alert('Reservation submitted!')
    } else {
      const msg = await res.json().catch(() => ({}))
      alert(msg.detail || 'Reservation failed')
    }
  }

  const payNow = async () => {
    const p = {
      user_email: email,
      amount: 1000,
      purpose: 'maintenance_fee',
      month: new Date().toISOString().slice(0, 7),
      status: 'success',
      receipt_no: `RCPT-${Date.now()}`,
    }
    const res = await fetch(`${API}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
    if (res.ok) {
      refresh()
    }
  }

  return (
    <section id="app" className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-3 grid md:grid-cols-3 gap-6">
        <Section title="Your Dues" action={<button onClick={payNow} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Pay Now</button>}>
          <p className="text-3xl font-bold text-gray-900">₹ {dueAmount}</p>
          <p className="text-gray-500 text-sm">Estimated monthly maintenance</p>
        </Section>
        <Section title="Recent Notices">
          <ul className="space-y-2 max-h-48 overflow-auto">
            {notices.slice(0, 5).map(n => (
              <li key={n._id} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-600"></span>
                <div>
                  <p className="font-medium text-gray-900">{n.title}</p>
                  <p className="text-gray-600 text-sm">{n.body?.slice(0, 120)}</p>
                </div>
              </li>
            ))}
            {notices.length === 0 && <p className="text-gray-500">No notices yet.</p>}
          </ul>
        </Section>
        <Section title="Your Tickets">
          <ul className="space-y-2 max-h-48 overflow-auto">
            {tickets.map(t => (
              <li key={t._id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{t.title}</p>
                  <p className="text-gray-600 text-sm">{t.status} • {t.category || 'general'}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-gray-100">{t.priority}</span>
              </li>
            ))}
            {tickets.length === 0 && <p className="text-gray-500">No tickets yet.</p>}
          </ul>
        </Section>
      </div>

      <div className="md:col-span-2 space-y-6">
        <Section title="Raise a Maintenance Ticket">
          <form onSubmit={createTicket} className="grid sm:grid-cols-2 gap-3">
            <input name="title" required placeholder="Title" className="border rounded px-3 py-2" />
            <select name="priority" className="border rounded px-3 py-2">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select name="category" className="border rounded px-3 py-2">
              <option value="general">General</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="cleaning">Cleaning</option>
              <option value="security">Security</option>
            </select>
            <input name="apartment" defaultValue={apartment} placeholder="Apartment" className="border rounded px-3 py-2" />
            <textarea name="description" required placeholder="Describe the issue" className="border rounded px-3 py-2 sm:col-span-2" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg sm:col-span-2">Submit</button>
          </form>
        </Section>

        <Section title="Book an Asset">
          <form onSubmit={createReservation} className="grid sm:grid-cols-2 gap-3">
            <select name="asset_name" className="border rounded px-3 py-2">
              {assets.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
              {assets.length === 0 && <option>No assets yet</option>}
            </select>
            <input type="text" name="purpose" placeholder="Purpose (optional)" className="border rounded px-3 py-2" />
            <input type="datetime-local" name="start_time" className="border rounded px-3 py-2" required />
            <input type="datetime-local" name="end_time" className="border rounded px-3 py-2" required />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg sm:col-span-2">Reserve</button>
          </form>
        </Section>
      </div>

      <div className="space-y-6">
        <Section title="Quick Add Asset" action={null}>
          <form onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const payload = Object.fromEntries(form.entries())
            const res = await fetch(`${API}/assets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (res.ok) { e.currentTarget.reset(); const a = await fetch(`${API}/assets`).then(r => r.json()); setAssets(a) }
          }} className="grid gap-3">
            <input name="name" placeholder="Name (e.g., Clubhouse Hall)" className="border rounded px-3 py-2" />
            <textarea name="description" placeholder="Description/Rules" className="border rounded px-3 py-2" />
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg">Add</button>
          </form>
        </Section>

        <Section title="Post a Notice">
          <form onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const payload = Object.fromEntries(form.entries())
            payload.tags = payload.tags ? payload.tags.split(',').map(t => t.trim()) : []
            payload.posted_by = email
            const res = await fetch(`${API}/notices`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (res.ok) { e.currentTarget.reset(); const n = await fetch(`${API}/notices`).then(r => r.json()); setNotices(n) }
          }} className="grid gap-3">
            <input name="title" placeholder="Title" className="border rounded px-3 py-2" />
            <textarea name="body" placeholder="Body" className="border rounded px-3 py-2" />
            <input name="tags" placeholder="Tags (comma separated)" className="border rounded px-3 py-2" />
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="pinned" /> Pinned
            </label>
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg">Post</button>
          </form>
        </Section>
      </div>
    </section>
  )
}
