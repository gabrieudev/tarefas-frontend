import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata = {
  title: "Tarefas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
