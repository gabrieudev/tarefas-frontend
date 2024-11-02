import { Toaster } from "@/components/ui/toaster";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata = {
  title: "Tarefas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={`${roboto.className} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
