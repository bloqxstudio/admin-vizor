'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  {
    section: 'Vizor Películas',
    color: '#1A5C8A',
    items: [
      {
        label: 'Produtos',
        href: '/dashboard/vizor/products',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        ),
      },
      {
        label: 'Leads',
        href: '/dashboard/vizor/leads',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ),
        disabled: true,
      },
    ],
  },
  {
    section: 'Evolved Event',
    color: '#3d2a6e',
    items: [
      {
        label: 'Eventos',
        href: '/dashboard/evolved/events',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        ),
        disabled: true,
      },
    ],
  },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={styles.aside}>
      {/* Logo */}
      <Link href="/dashboard" style={styles.logo}>
        <div style={styles.logoIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <span style={styles.logoText}>Admin Panel</span>
      </Link>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV.map(group => (
          <div key={group.section} style={styles.group}>
            <div style={styles.groupLabel}>
              <div style={{
                ...styles.groupDot,
                background: group.color,
              }} />
              {group.section}
            </div>
            {group.items.map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.disabled ? '#' : item.href}
                  style={{
                    ...styles.navItem,
                    ...(active ? styles.navItemActive : {}),
                    ...(item.disabled ? styles.navItemDisabled : {}),
                  }}
                >
                  <span style={{
                    ...styles.navIcon,
                    color: active ? 'var(--accent)' : 'var(--text-3)',
                  }}>
                    {item.icon}
                  </span>
                  {item.label}
                  {item.disabled && (
                    <span style={styles.soon}>em breve</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.user}>
          <div style={styles.avatar}>
            {userEmail[0]?.toUpperCase()}
          </div>
          <span style={styles.userEmail}>{userEmail}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn} title="Sair">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  aside: {
    width: '220px',
    flexShrink: 0,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 16px',
    borderBottom: '1px solid var(--border)',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '30px',
    height: '30px',
    background: 'var(--accent)',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text)',
    letterSpacing: '0.04em',
  },
  nav: {
    flex: 1,
    padding: '16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  groupLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-3)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '4px 8px',
    marginBottom: '4px',
  },
  groupDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 8px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-2)',
    transition: 'background 0.15s, color 0.15s',
    cursor: 'pointer',
  },
  navItemActive: {
    background: 'var(--surface-2)',
    color: 'var(--text)',
  },
  navItemDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  soon: {
    marginLeft: 'auto',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-3)',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '2px 5px',
  },
  footer: {
    padding: '12px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  user: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  avatar: {
    width: '28px',
    height: '28px',
    background: 'var(--accent)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userEmail: {
    fontSize: '11px',
    color: 'var(--text-3)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-3)',
    display: 'flex',
    alignItems: 'center',
    padding: '6px',
    borderRadius: '6px',
    transition: 'color 0.15s, background 0.15s',
    flexShrink: 0,
  },
}
