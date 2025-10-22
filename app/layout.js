

export const metadata = {
  title: 'Luxora - Kids Toy Store',
  description: 'Your trusted destination for quality toys',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}