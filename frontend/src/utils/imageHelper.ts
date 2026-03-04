/**
 * Helper untuk resolve image URL dari backend.
 *
 * Backend menyimpan imageUrl sebagai relative path: "/uploads/image-xxx.jpg"
 *
 * Kita TIDAK boleh prefix http://localhost:5000 karena backend pakai helmet()
 * yang set Cross-Origin-Resource-Policy header → browser block cross-origin images.
 *
 * Solusi: Pakai relative path "/uploads/..." agar request lewat Vite proxy
 * (dikonfigurasi di vite.config.ts) → same-origin → tidak di-block.
 */
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  // Kalau sudah full URL (http/https) atau data URI, langsung return
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;
  // Return relative path agar lewat Vite proxy (same-origin)
  return imageUrl;
}
