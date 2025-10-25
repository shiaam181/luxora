
import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Luxora - Premium Fashion & Jewelry Store India',
  description: 'Shop elegant sarees, designer kurtis, jewelry at best prices. Free COD across India.',
  keywords: 'fashion, sarees, kurtis, jewelry, online shopping India, COD',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* You can add other head elements here if needed */}
      </head>
      <body>
        {children}
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8W60S20DRH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8W60S20DRH');
          `}
        </Script>
      </body>
    </html>
  )
}
