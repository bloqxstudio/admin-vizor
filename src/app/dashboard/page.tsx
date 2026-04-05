import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Conta produtos do Vizor
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  // Conta leads do Vizor
  const { count: leadsCount } = await supabase
    .from('distributor_leads')
    .select('*', { count: 'exact', head: true })

  const projects = [
    {
      id: 'vizor',
      name: 'Vizor Películas',
      description: 'Catálogo de produtos e leads de revendedores',
      href: '/dashboard/vizor/products',
      color: '#1A5C8A',
      accent: '#5BAEE0',
      stats: [
        { label: 'Produtos', value: productCount ?? 0 },
        { label: 'Leads', value: leadsCount ?? 0 },
      ],
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      ),
    },
    {
      id: 'evolved',
      name: 'Evolved Event',
      description: 'Em breve — eventos e páginas',
      href: '#',
      color: '#3d2a6e',
      accent: '#9b6dff',
      stats: [
        { label: 'Eventos', value: '—' },
        { label: 'Páginas', value: '—' },
      ],
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      disabled: true,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Projetos</h1>
          <p style={styles.subtitle}>Selecione um projeto para gerenciar seu conteúdo.</p>
        </div>
      </div>

      {/* Cards */}
      <div style={styles.grid}>
        {projects.map(project => (
          <Link
            key={project.id}
            href={project.href}
            style={{
              ...styles.card,
              ...(project.disabled ? styles.cardDisabled : {}),
              '--project-color': project.color,
              '--project-accent': project.accent,
            } as React.CSSProperties}
          >
            {/* Top bar colorida */}
            <div style={{
              ...styles.cardBar,
              background: `linear-gradient(90deg, ${project.color}, ${project.accent})`,
            }} />

            {/* Ícone */}
            <div style={{
              ...styles.cardIcon,
              background: `${project.color}22`,
              color: project.accent,
              border: `1px solid ${project.color}44`,
            }}>
              {project.icon}
            </div>

            {/* Info */}
            <div style={styles.cardContent}>
              <h2 style={styles.cardTitle}>{project.name}</h2>
              <p style={styles.cardDesc}>{project.description}</p>
            </div>

            {/* Stats */}
            <div style={styles.cardStats}>
              {project.stats.map(stat => (
                <div key={stat.label} style={styles.stat}>
                  <span style={styles.statValue}>{stat.value}</span>
                  <span style={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Rodapé */}
            <div style={styles.cardFooter}>
              {project.disabled ? (
                <span style={styles.badge}>Em breve</span>
              ) : (
                <span style={styles.link}>
                  Acessar →
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-2)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '24px',
    paddingTop: '20px',
    transition: 'border-color 0.2s, transform 0.2s',
    position: 'relative',
    cursor: 'pointer',
  },
  cardDisabled: {
    opacity: 0.5,
    cursor: 'default',
    pointerEvents: 'none',
  },
  cardBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
  },
  cardIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: '4px',
    letterSpacing: '-0.01em',
  },
  cardDesc: {
    fontSize: '13px',
    color: 'var(--text-2)',
    lineHeight: 1.5,
  },
  cardStats: {
    display: 'flex',
    gap: '24px',
    padding: '16px',
    background: 'var(--bg)',
    borderRadius: '8px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  badge: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-3)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  link: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--accent)',
    letterSpacing: '0.02em',
  },
}
