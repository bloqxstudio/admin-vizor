import { createClient } from '@/lib/supabase/server'
import ProductsTable from '@/components/ProductsTable'

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('num', { ascending: true })

  if (error) {
    return (
      <div style={styles.error}>
        <strong>Erro ao carregar produtos:</strong> {error.message}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbItem}>Vizor Películas</span>
            <span style={styles.breadcrumbSep}>/</span>
            <span style={styles.breadcrumbActive}>Produtos</span>
          </div>
          <h1 style={styles.title}>Catálogo de Produtos</h1>
          <p style={styles.subtitle}>
            {products.length} produtos cadastrados · Clique em Editar para alterar um produto
          </p>
        </div>
      </div>

      {/* Tabela */}
      <ProductsTable products={products} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    marginBottom: '24px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  breadcrumbItem: {
    fontSize: '12px',
    color: 'var(--text-3)',
  },
  breadcrumbSep: {
    fontSize: '12px',
    color: 'var(--text-3)',
  },
  breadcrumbActive: {
    fontSize: '12px',
    color: 'var(--text-2)',
    fontWeight: 600,
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
  error: {
    background: 'rgba(255,102,102,0.08)',
    border: '1px solid rgba(255,102,102,0.2)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    color: 'var(--red)',
    fontSize: '14px',
  },
}
