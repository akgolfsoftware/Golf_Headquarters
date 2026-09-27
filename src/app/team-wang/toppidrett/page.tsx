import { WangToppidrettPrecisionView } from "../WangToppidrettPrecisionView";

export const metadata = {
  title: "WANG Toppidrett · Treningsplan & Fysiske Tester",
  description: "Morgentreninger, fraværsregistrering og nasjonale benchmark-tester for golfere.",
  robots: { index: false, follow: false },
};

export default function WangToppidrettPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#141413]">
      <WangToppidrettPrecisionView />
    </div>
  );
}
