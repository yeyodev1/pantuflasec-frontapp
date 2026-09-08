/**
 * Países del selector de teléfono. Ecuador primero y por defecto; luego la
 * región y los destinos frecuentes de la diáspora. Las banderas vienen de
 * flagcdn (no hay imágenes locales).
 */
export interface Country {
  iso: string
  name: string
  dial: string
  /** Largo típico del número nacional, para validar sin librerías. */
  min: number
  max: number
}

export const countries: Country[] = [
  { iso: 'ec', name: 'Ecuador', dial: '593', min: 8, max: 9 },
  { iso: 'co', name: 'Colombia', dial: '57', min: 10, max: 10 },
  { iso: 'pe', name: 'Perú', dial: '51', min: 9, max: 9 },
  { iso: 'us', name: 'Estados Unidos', dial: '1', min: 10, max: 10 },
  { iso: 'es', name: 'España', dial: '34', min: 9, max: 9 },
  { iso: 'mx', name: 'México', dial: '52', min: 10, max: 10 },
  { iso: 'cl', name: 'Chile', dial: '56', min: 9, max: 9 },
  { iso: 'ar', name: 'Argentina', dial: '54', min: 10, max: 11 },
  { iso: 've', name: 'Venezuela', dial: '58', min: 10, max: 10 },
  { iso: 'pa', name: 'Panamá', dial: '507', min: 7, max: 8 },
  { iso: 'it', name: 'Italia', dial: '39', min: 9, max: 10 },
  { iso: 'ca', name: 'Canadá', dial: '1', min: 10, max: 10 },
  { iso: 'br', name: 'Brasil', dial: '55', min: 10, max: 11 },
  { iso: 'bo', name: 'Bolivia', dial: '591', min: 8, max: 8 },
  { iso: 'uy', name: 'Uruguay', dial: '598', min: 8, max: 9 },
]

export const flag = (iso: string, w = 40) => `https://flagcdn.com/w${w}/${iso}.png`

export const DEFAULT_COUNTRY = countries[0]!

/** Separa un E.164 (o lo que haya) en país + número nacional. */
export function split(value: string): { country: Country; national: string } {
  const digits = (value || '').replace(/\D/g, '')
  if (value?.startsWith('+') || digits.length > 10) {
    // El código más largo que coincida gana (593 antes que 5).
    const match = [...countries].sort((a, b) => b.dial.length - a.dial.length).find((c) => digits.startsWith(c.dial))
    if (match) return { country: match, national: digits.slice(match.dial.length) }
  }
  return { country: DEFAULT_COUNTRY, national: digits.replace(/^0+/, '') }
}

/** Arma el E.164: quita ceros iniciales (el 0 de 099… en Ecuador) y espacios. */
export function toE164(country: Country, national: string): string {
  const n = national.replace(/\D/g, '').replace(/^0+/, '')
  return n ? `+${country.dial}${n}` : ''
}

export function isValid(country: Country, national: string): boolean {
  const n = national.replace(/\D/g, '').replace(/^0+/, '')
  return n.length >= country.min && n.length <= country.max
}

/** Formato legible: +593 98 240 1562. */
export function format(value: string): string {
  const { country, national } = split(value)
  if (!national) return value
  const groups = national.match(/^(\d{2})(\d{3})(\d{0,4})$/) ?? national.match(/^(\d{3})(\d{3})(\d{0,4})$/)
  return `+${country.dial} ${groups ? groups.slice(1).filter(Boolean).join(' ') : national}`
}
