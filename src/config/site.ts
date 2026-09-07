/**
 * El copy es configuración: todos los textos y datos de la marca viven acá.
 * Los componentes solo consumen y pintan.
 */
export const site = {
  name: 'Pantuflasec',
  tagline: 'Pantuflas, peluches y regalos con tus personajes favoritos.',
  description: 'Tienda de pantuflas, peluches, tazas, pijamas y arreglos en Guayaquil. Envíos a todo el Ecuador.',
  url: 'https://pantuflas.ec',
  email: 'hola@pantuflas.ec',
  // Solo dígitos con código de país, ej: 593984934039
  whatsapp: '593982401562',
  social: {
    instagram: 'https://instagram.com/pantuflasec',
    facebook: '',
    tiktok: '',
  },
  stores: [
    { name: 'La Garzota', address: 'Av. Agustín Freire, frente al Garzocentro', city: 'Guayaquil' },
    { name: 'La Joya', address: 'Plaza Sevilla, urbanización La Joya', city: 'Daule' },
  ],
  nav: [
    { label: 'Inicio', to: '/' },
    { label: 'Tienda', to: '/tienda' },
    { label: 'Contacto', to: '/#contacto' },
  ],
} as const

export function whatsappLink(message = 'Hola, quiero más información'): string {
  if (!site.whatsapp) return '#'
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`
}
