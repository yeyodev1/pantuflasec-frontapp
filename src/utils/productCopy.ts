import type { Product } from '@/types'

/**
 * Cuando el producto no tiene descripción escrita, se arma una a partir de
 * categoría, colección y variantes. El admin puede reemplazarla cuando quiera.
 */
const byCategory: Record<string, (p: Product) => string> = {
  pantuflas: (p) =>
    `Pantuflas de ${p.collection || 'tus personajes favoritos'} en felpa suave, con suela antideslizante y relleno acolchado para estar calentito en casa. Perfectas para regalar o para consentirte.`,
  peluches: (p) =>
    `Peluche de ${p.collection || 'tu personaje favorito'} de felpa muy suave, con relleno firme que mantiene la forma. Ideal como regalo de cumpleaños, aniversario o San Valentín.`,
  tazas: (p) =>
    `Taza de cerámica en 3D de ${p.collection || 'tu personaje favorito'}, apta para bebidas calientes y frías. Un detalle que se usa todos los días.`,
  tomatodos: (p) =>
    `Tomatodo de ${p.collection || 'tu personaje favorito'} para llevar tu bebida a todos lados. Cierre seguro y fácil de limpiar.`,
  pijamas: (p) =>
    `Pijama enteriza de ${p.collection || 'tu personaje favorito'} en tela polar suave y abrigada, con capucha. Cómoda para dormir y para la pijamada.`,
  mantas: (p) =>
    `Manta de ${p.collection || 'tu personaje favorito'} en tela polar, ligera pero abrigada. Para el sofá, la cama o ver películas.`,
  arreglos: (p) =>
    `Arreglo listo para regalar${p.collection && p.collection !== 'Flores' ? ` con temática de ${p.collection}` : ''}. Lo armamos con cuidado y lo entregamos en la fecha que elijas; escríbenos si quieres personalizarlo.`,
  accesorios: (p) =>
    `Accesorio de ${p.collection || 'tu personaje favorito'}, original y con detalles bien cuidados. Un regalo pequeño que siempre gusta.`,
}

export function describe(p: Product): string {
  if (p.description?.trim()) return p.description
  return byCategory[p.category]?.(p) ?? `${p.name}. Escríbenos por WhatsApp si quieres más detalles o fotos.`
}

/** Pares etiqueta/valor para la ficha del producto. */
export function specs(p: Product): Array<{ label: string; value: string }> {
  const out: Array<{ label: string; value: string }> = []
  if (p.collection) out.push({ label: 'Colección', value: p.collection })
  const sizes = p.variants.filter((v) => v.size).map((v) => v.size)
  const colors = p.variants.filter((v) => v.color).map((v) => v.color)
  if (sizes.length) out.push({ label: sizes.length > 1 ? 'Tallas' : 'Talla', value: sizes.join(' · ') })
  if (colors.length) out.push({ label: 'Opciones', value: colors.join(' · ') })
  const size = p.name.match(/(\d+(?:[.,]\d+)?)\s*(cm|m)\b/i)
  if (size && !sizes.length) out.push({ label: 'Tamaño', value: `${size[1]} ${size[2]!.toLowerCase()}` })
  out.push({ label: 'Entrega', value: 'Retiro en La Garzota o La Joya, o envío a todo el Ecuador' })
  return out
}

/** Tabla de tallas de pantuflas, según la guía del catálogo. */
export const slipperSizes = [
  { size: '3', cm: '16 × 9 cm', shoe: '24 a 26' },
  { size: '6', cm: '20 × 9 cm', shoe: '28 a 32' },
  { size: 'M', cm: '26 × 10 cm', shoe: '34 a 39' },
  { size: 'XL', cm: '31 × 11 cm', shoe: '40 a 44' },
]

export const perks = [
  { icon: 'fa-solid fa-truck-fast', text: 'Envío a todo Ecuador, 24 a 72 h' },
  { icon: 'fa-solid fa-store', text: 'Retiro gratis en La Garzota o La Joya' },
  { icon: 'fa-solid fa-lock', text: 'Pago seguro con tarjeta' },
  { icon: 'fa-brands fa-whatsapp', text: 'Atención por WhatsApp' },
]
