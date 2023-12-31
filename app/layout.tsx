import "@/lib/styles/global.css";
import { inter } from "@/lib/utils/fonts";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
};
export default RootLayout;
