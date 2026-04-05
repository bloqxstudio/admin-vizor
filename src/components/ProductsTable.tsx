'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Product = {
  id: string
  num: number
  brand: string
  model: string
  year: string | null
  folder: string
  file: string
  image_url: string | null
}

export default function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [viewing, setViewing] = useState<Product | null>(null)

  // Form state do modal
  const [form, setForm] = useState({ brand: '', model: '', year: '' })

  // Estado de imagem
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    return (
      p.brand.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      String(p.num).includes(q)
    )
  })

  function openEdit(product: Product) {
    setEditing(product)
    setForm({
      brand: product.brand,
      model: product.model,
      year: product.year ?? '',
    })
    setImageFile(null)
    setImagePreview(null)
    setSaveError('')
    setSaveSuccess(false)
  }

  function closeEdit() {
    setEditing(null)
    setImageFile(null)
    setImagePreview(null)
    setSaveError('')
    setSaveSuccess(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  async function uploadImage(productId: string, file: File): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `products/${productId}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true })

    if (error) {
      setSaveError(`Erro no upload da imagem: ${error.message}`)
      return null
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    return data.publicUrl
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    const supabase = createClient()

    let newImageUrl = editing.image_url

    if (imageFile) {
      setUploadingImage(true)
      const uploaded = await uploadImage(editing.id, imageFile)
      setUploadingImage(false)
      if (!uploaded) {
        setSaving(false)
        return
      }
      newImageUrl = uploaded
    }

    const { error } = await supabase
      .from('products')
      .update({
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: form.year.trim() || null,
        image_url: newImageUrl,
      })
      .eq('id', editing.id)

    setSaving(false)

    if (error) {
      setSaveError(error.message)
      return
    }

    setSaveSuccess(true)

    startTransition(() => {
      router.refresh()
    })

    setTimeout(closeEdit, 1000)
  }

  const currentImage = imagePreview ?? editing?.image_url ?? null

  return (
    <>
      {/* Barra de busca */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <svg style={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por marca, modelo ou número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.search}
          />
        </div>
        <span style={styles.count}>{filtered.length} resultados</span>
      </div>

      {/* Tabela */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['#', 'Imagem', 'Marca', 'Modelo', 'Ano', 'Arquivo', ''].map(col => (
                <th key={col} style={styles.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{
                ...styles.tr,
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}>
                <td style={styles.tdNum}>
                  <span style={styles.numBadge}>VZB0{String(p.num).padStart(3, '0')}</span>
                </td>
                <td style={styles.tdThumb}>
                  {p.image_url ? (
                    <button
                      onClick={() => setViewing(p)}
                      style={styles.thumbBtn}
                      title="Visualizar imagem"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image_url}
                        alt={`${p.brand} ${p.model}`}
                        style={styles.thumb}
                      />
                    </button>
                  ) : (
                    <div style={styles.thumbEmpty}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={styles.brand}>{p.brand}</span>
                </td>
                <td style={styles.tdModel}>{p.model}</td>
                <td style={styles.tdYear}>{p.year ?? <span style={styles.empty}>—</span>}</td>
                <td style={styles.tdFile}>
                  <span style={styles.file}>{p.file}</span>
                </td>
                <td style={styles.tdAction}>
                  <button
                    onClick={() => setViewing(p)}
                    style={styles.viewBtn}
                    title="Visualizar produto"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    style={styles.editBtn}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={styles.empty2}>Nenhum produto encontrado.</div>
        )}
      </div>

      {/* Modal visualizar produto */}
      {viewing && (
        <div style={styles.overlay} onClick={e => {
          if (e.target === e.currentTarget) setViewing(null)
        }}>
          <div style={styles.viewModal}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalSup}>Produto</span>
                <h2 style={styles.modalTitle}>
                  VZB0{String(viewing.num).padStart(3, '0')}
                </h2>
              </div>
              <div style={styles.headerActions}>
                <button
                  onClick={() => { setViewing(null); openEdit(viewing) }}
                  style={styles.editBtnModal}
                >
                  Editar
                </button>
                <button onClick={() => setViewing(null)} style={styles.closeBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            <div style={styles.viewBody}>
              {/* Imagem grande */}
              <div style={styles.viewImageWrap}>
                {viewing.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={viewing.image_url}
                    alt={`${viewing.brand} ${viewing.model}`}
                    style={styles.viewImage}
                  />
                ) : (
                  <div style={styles.viewImageEmpty}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '8px' }}>Sem imagem</span>
                  </div>
                )}
              </div>

              {/* Dados do produto */}
              <div style={styles.viewData}>
                <div style={styles.viewRow}>
                  <span style={styles.viewLabel}>Marca</span>
                  <span style={styles.viewValue}>{viewing.brand}</span>
                </div>
                <div style={styles.viewRow}>
                  <span style={styles.viewLabel}>Modelo</span>
                  <span style={styles.viewValue}>{viewing.model}</span>
                </div>
                <div style={styles.viewRow}>
                  <span style={styles.viewLabel}>Ano</span>
                  <span style={styles.viewValue}>{viewing.year ?? <span style={styles.empty}>—</span>}</span>
                </div>
                <div style={styles.viewRow}>
                  <span style={styles.viewLabel}>Pasta</span>
                  <span style={{ ...styles.viewValue, fontFamily: 'var(--mono)', fontSize: '12px' }}>{viewing.folder}</span>
                </div>
                <div style={styles.viewRow}>
                  <span style={styles.viewLabel}>Arquivo</span>
                  <span style={{ ...styles.viewValue, fontFamily: 'var(--mono)', fontSize: '12px' }}>{viewing.file}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {editing && (
        <div style={styles.overlay} onClick={e => {
          if (e.target === e.currentTarget) closeEdit()
        }}>
          <div style={styles.modal}>
            {/* Header modal */}
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalSup}>Editando produto</span>
                <h2 style={styles.modalTitle}>
                  VZB0{String(editing.num).padStart(3, '0')}
                </h2>
              </div>
              <button onClick={closeEdit} style={styles.closeBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Campos */}
            <div style={styles.modalBody}>

              {/* Upload de imagem */}
              <div style={styles.field}>
                <label style={styles.label}>Imagem do produto</label>
                <div style={styles.imageUploadArea}>
                  {/* Preview */}
                  <div style={styles.imagePreviewWrap}>
                    {currentImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentImage}
                        alt="Preview"
                        style={styles.imagePreview}
                      />
                    ) : (
                      <div style={styles.imagePreviewEmpty}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Ações de imagem */}
                  <div style={styles.imageActions}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={styles.uploadBtn}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      {currentImage ? 'Trocar imagem' : 'Selecionar imagem'}
                    </button>
                    {imageFile && (
                      <span style={styles.fileName}>{imageFile.name}</span>
                    )}
                    {!imageFile && editing.image_url && (
                      <span style={styles.imageStatus}>Imagem atual mantida</span>
                    )}
                    {!imageFile && !editing.image_url && (
                      <span style={styles.imageStatus}>Nenhuma imagem</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Marca</label>
                <input
                  value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  style={styles.input}
                  placeholder="ex: Honda"
                  autoFocus
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Modelo</label>
                <input
                  value={form.model}
                  onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  style={styles.input}
                  placeholder="ex: CB 300F Twister"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Ano / Período</label>
                <input
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                  style={styles.input}
                  placeholder="ex: 2023–2025"
                />
              </div>

              {/* Campos somente leitura */}
              <div style={styles.readonlyGroup}>
                <div style={styles.readonlyField}>
                  <span style={styles.readonlyLabel}>Pasta</span>
                  <span style={styles.readonlyValue}>{editing.folder}</span>
                </div>
                <div style={styles.readonlyField}>
                  <span style={styles.readonlyLabel}>Arquivo</span>
                  <span style={styles.readonlyValue}>{editing.file}</span>
                </div>
              </div>

              {saveError && (
                <div style={styles.errorBox}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {saveError}
                </div>
              )}

              {saveSuccess && (
                <div style={styles.successBox}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Salvo com sucesso!
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div style={styles.modalFooter}>
              <button onClick={closeEdit} style={styles.cancelBtn}>
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  ...styles.saveBtn,
                  ...(saving ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
                }}
              >
                {uploadingImage ? 'Enviando imagem...' : saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-3)',
    pointerEvents: 'none',
  },
  search: {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '8px 12px 8px 36px',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
  },
  count: {
    fontSize: '12px',
    color: 'var(--text-3)',
    fontFamily: 'var(--mono)',
  },
  tableWrap: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-3)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.1s',
  },
  td: {
    padding: '10px 16px',
    fontSize: '13px',
    color: 'var(--text)',
  },
  tdNum: {
    padding: '10px 16px',
    fontSize: '13px',
    width: '120px',
  },
  tdThumb: {
    padding: '8px 16px',
    width: '60px',
  },
  tdModel: {
    padding: '10px 16px',
    fontSize: '13px',
    color: 'var(--text)',
    maxWidth: '220px',
  },
  tdYear: {
    padding: '10px 16px',
    fontSize: '12px',
    color: 'var(--text-2)',
    fontFamily: 'var(--mono)',
    whiteSpace: 'nowrap',
  },
  tdFile: {
    padding: '10px 16px',
    maxWidth: '200px',
    overflow: 'hidden',
  },
  tdAction: {
    padding: '10px 16px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
  },
  thumbBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: 0,
    cursor: 'pointer',
    overflow: 'hidden',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: '40px',
    height: '40px',
    objectFit: 'cover',
    display: 'block',
  },
  thumbEmpty: {
    width: '40px',
    height: '40px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-3)',
  },
  numBadge: {
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--accent)',
    background: 'rgba(91,127,255,0.1)',
    border: '1px solid rgba(91,127,255,0.2)',
    borderRadius: '4px',
    padding: '2px 7px',
  },
  brand: {
    fontWeight: 600,
    fontSize: '12px',
    color: 'var(--text-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  file: {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    color: 'var(--text-3)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  },
  empty: {
    color: 'var(--text-3)',
  },
  empty2: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-3)',
    fontSize: '13px',
  },
  viewBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '5px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-3)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  editBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '5px',
    padding: '5px 10px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-2)',
    transition: 'border-color 0.15s, color 0.15s',
    cursor: 'pointer',
  },

  // Modal visualizar
  viewModal: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '560px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  viewBody: {
    padding: '24px',
    display: 'flex',
    gap: '24px',
  },
  viewImageWrap: {
    flexShrink: 0,
    width: '180px',
    height: '180px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  viewImageEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-3)',
    gap: '8px',
  },
  viewData: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    justifyContent: 'center',
  },
  viewRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  viewLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  viewValue: {
    fontSize: '14px',
    color: 'var(--text)',
    fontWeight: 500,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  editBtnModal: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-2)',
    cursor: 'pointer',
  },

  // Modal edição
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '24px',
  },
  modal: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
  },
  modalSup: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-3)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '3px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    letterSpacing: '-0.01em',
  },
  closeBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-3)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  modalBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-3)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  input: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '9px 12px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
  },

  // Image upload
  imageUploadArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px',
  },
  imagePreviewWrap: {
    flexShrink: 0,
    width: '72px',
    height: '72px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: '72px',
    height: '72px',
    objectFit: 'cover',
    display: 'block',
  },
  imagePreviewEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-3)',
    width: '100%',
    height: '100%',
  },
  imageActions: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  uploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '7px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-2)',
    cursor: 'pointer',
    width: 'fit-content',
  },
  fileName: {
    fontSize: '11px',
    color: 'var(--accent)',
    fontFamily: 'var(--mono)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  imageStatus: {
    fontSize: '11px',
    color: 'var(--text-3)',
  },

  readonlyGroup: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  readonlyField: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  readonlyLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    width: '48px',
    flexShrink: 0,
  },
  readonlyValue: {
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    color: 'var(--text-2)',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,102,102,0.08)',
    border: '1px solid rgba(255,102,102,0.2)',
    borderRadius: 'var(--radius)',
    padding: '10px 12px',
    color: 'var(--red)',
    fontSize: '13px',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(62,207,142,0.08)',
    border: '1px solid rgba(62,207,142,0.2)',
    borderRadius: 'var(--radius)',
    padding: '10px 12px',
    color: 'var(--green)',
    fontSize: '13px',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-2)',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  saveBtn: {
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius)',
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
}
