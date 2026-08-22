'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface SecurePDFViewerProps {
  pdfUrl: string
  title: string
}

export default function SecurePDFViewer({ pdfUrl, title }: SecurePDFViewerProps) {
  const [loading, setLoading] = useState(true)

  // Use Google Docs viewer for better font support, or direct iframe with toolbar=0
  // Google docs viewer is more secure as it renders images of the PDF
  const isGoogleDriveUrl = pdfUrl.includes('drive.google.com')
  
  let embedUrl = pdfUrl
  if (isGoogleDriveUrl) {
    const fileIdMatch = pdfUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || pdfUrl.match(/id=([a-zA-Z0-9_-]+)/)
    if (fileIdMatch && fileIdMatch[1]) {
      embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`
    }
  } else {
    // For direct PDF links, use Google Docs viewer for better font rendering and security
    embedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-paper rounded-xl overflow-hidden border border-line-soft">
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-cream z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal animate-spin mx-auto mb-4" />
            <p className="text-ink-soft text-lg font-medium">در حال بارگذاری سند...</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-cream/90 backdrop-blur-sm border-b border-line-soft px-6 py-4 flex items-center justify-between">
        <h3 className="text-ink font-bold text-lg truncate pr-2 border-r-4 border-teal">{title}</h3>
        <div className="text-ink-soft text-sm font-medium bg-paper px-3 py-1 rounded-full border border-line-soft">
          فایل PDF
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 w-full bg-cream relative">
        <iframe
          src={embedUrl}
          className="w-full h-full absolute inset-0"
          frameBorder="0"
          onLoad={() => setLoading(false)}
          title={title}
          allowFullScreen
        />
        
        {/* Protection watermark */}
        <div className="absolute bottom-4 right-4 bg-paper/90 text-ink-soft px-3 py-1.5 rounded-lg text-xs font-medium pointer-events-none z-30 border border-line-soft shadow-sm">
          محافظت شده - کپی برداری ممنوع
        </div>
      </div>
    </div>
  )
}
