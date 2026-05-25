import "../globals.css";

export const metadata = {
  title: "V2 Preview — AK Golf HQ",
  description: "Proof-of-concept sider for V2-komponentbiblioteket",
};

export default function V2PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
