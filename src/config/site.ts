/**
 * El copy es configuración: todos los textos y datos de la marca viven acá.
 * Los componentes solo consumen y pintan.
 */
const CLOUD = 'https://res.cloudinary.com/afwyrt75/image/upload'
const LOGO_ID = 'pantuflasec/marca/kdiwg79agtwcurg3136v'

/** Logo desde Cloudinary en las variantes que usa la web. Nunca hay imágenes locales. */
export const logo = {
  /** Cuadrado original, fondo amarillo. */
  square: `${CLOUD}/c_fill,w_512,h_512/f_auto,q_auto/${LOGO_ID}.jpg`,
  /** Solo el letrero, recortado. */
  wordmark: `${CLOUD}/c_crop,w_360,h_130,x_44,y_158/e_make_transparent:35/f_png/${LOGO_ID}.jpg`,
  /** Ícono redondeado para header, favicon y apple-touch. */
  icon: (px: number) => `${CLOUD}/c_fill,w_${px},h_${px},r_max/f_png/${LOGO_ID}.jpg`,
  /** Imagen para compartir (WhatsApp, Instagram, Facebook). */
  og: `${CLOUD}/c_pad,w_1200,h_630,b_rgb:ffcc00/f_jpg,q_auto/${LOGO_ID}.jpg`,
}

export const site = {
  name: 'Pantuflasec',
  tagline: 'Pantuflas, peluches y regalos con tus personajes favoritos.',
  description:
    'Tienda de pantuflas, peluches, tazas, pijamas y arreglos en Guayaquil. Envíos a todo el Ecuador.',
  url: 'https://pantuflas.ec',
  email: 'hola@pantuflas.ec',
  // Solo dígitos con código de país, ej: 593984934039
  whatsapp: '593982401562',
  whatsappDisplay: '+593 98 240 1562',
  social: {
    instagram: 'https://www.instagram.com/pantuflasec',
    instagramHandle: '@pantuflasec',
    tiktok: 'https://www.tiktok.com/@pantuflasec',
    tiktokHandle: '@pantuflasec',
    facebook: 'https://www.facebook.com/share/19QsuSy5Tc/',
    facebookHandle: 'Pantuflas Ecuador',
  },
  stores: [
    { name: 'La Garzota', address: 'Av. Agustín Freire, frente al Garzocentro', city: 'Guayaquil' },
    { name: 'La Joya', address: 'Plaza Sevilla, urbanización La Joya', city: 'Daule' },
  ],
  nav: [
    { label: 'Inicio', to: '/' },
    { label: 'Tienda', to: '/tienda' },
    { label: 'Nuevo', to: '/tienda?nuevo=1' },
    { label: 'Mis pedidos', to: '/mis-pedidos' },
  ],
} as const

/** Redes con icono, para el menú y el pie. */
export const socialLinks = [
  {
    href: site.social.instagram,
    icon: 'fa-brands fa-instagram',
    label: site.social.instagramHandle,
    name: 'Instagram',
  },
  {
    href: site.social.tiktok,
    icon: 'fa-brands fa-tiktok',
    label: site.social.tiktokHandle,
    name: 'TikTok',
  },
  {
    href: site.social.facebook,
    icon: 'fa-brands fa-facebook',
    label: site.social.facebookHandle,
    name: 'Facebook',
  },
] as const

export function whatsappLink(message = 'Hola, quiero más información'): string {
  if (!site.whatsapp) return '#'
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`
}

/** Aviso de que hay un deploy nuevo y la pestaña abierta quedó vieja. */
export const updateBanner = {
  title: 'Hay una versión nueva de la tienda',
  body: 'Actualiza para ver los últimos cambios.',
  action: 'Actualizar',
}
