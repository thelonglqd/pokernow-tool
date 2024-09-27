import localFont from "next/font/local";
import "./globals.css";

const robotoRegular = localFont({
  src: "./fonts/Roboto-Regular.woff",
  variable: "--font-roboto-regular",
  weight: "100 900",
});

export const metadata = {
  title: "Poker now tool",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${robotoRegular.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
