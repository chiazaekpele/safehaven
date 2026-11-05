// Server-only Paystack client. PAYSTACK_SECRET_KEY never leaves the server.

const API = "https://api.paystack.co";
const TIMEOUT_MS = 15_000;

export class PaystackError extends Error {
  constructor(
    message: string,
    readonly httpStatus?: number,
  ) {
    super(message);
    this.name = "PaystackError";
  }
}

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new PaystackError("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const cause = (err as { cause?: { code?: string } })?.cause?.code;
    throw new PaystackError(
      `Paystack request failed: ${err instanceof Error ? err.name : "unknown"}${cause ? ` (${cause})` : ""}`,
    );
  }

  const json = (await res.json().catch(() => null)) as
    | { status?: boolean; message?: string; data?: T }
    | null;

  if (!res.ok || !json?.status || json.data === undefined) {
    // Paystack's message is safe to log; it never contains our key.
    throw new PaystackError(
      `Paystack ${path.split("?")[0]} -> ${res.status}: ${json?.message ?? "no message"}`,
      res.status,
    );
  }
  return json.data;
}

export async function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  campaignEdition: number;
}): Promise<{ authorizationUrl: string; reference: string }> {
  const data = await call<{ authorization_url: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        currency: "NGN",
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: { campaign_edition: input.campaignEdition },
      }),
    },
  );
  if (data.reference !== input.reference || !data.authorization_url) {
    throw new PaystackError("Paystack returned an unexpected initialize response");
  }
  return { authorizationUrl: data.authorization_url, reference: data.reference };
}
