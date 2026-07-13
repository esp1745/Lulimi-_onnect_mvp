export function buildWhatsAppLink(number: string, message?: string): string {
  const digits = number.replace(/[^\d]/g, '')
  const params = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${params}`
}
