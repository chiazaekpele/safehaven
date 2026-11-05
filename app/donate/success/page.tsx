import type { Metadata } from "next";
import { PaymentStatus } from "@/components/PaymentStatus";
import { isValidReference } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Your donation — Safe Haven Foundation",
  robots: { index: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.reference ?? params.trxref;
  const reference = typeof raw === "string" && isValidReference(raw) ? raw : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-16">
      <PaymentStatus reference={reference} />
    </main>
  );
}
