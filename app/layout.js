import './globals.css'

export const metadata = {
  title: 'KYZX Generator AM',
  description: 'KYZX Generator AM 1y',
  icons: { icon: '/favicon.ico' }
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}