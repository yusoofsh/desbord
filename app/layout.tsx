import "@/lib/styles/global.css"
import { inter } from "@/lib/utils/fonts"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    template: "%s | Acme Dashboard",
    default: "Acme Dashboard",
  },
  description: "Next.js Learn Dashboard",
  metadataBase: new URL("https://desbord.yusoofsh.id"),
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
