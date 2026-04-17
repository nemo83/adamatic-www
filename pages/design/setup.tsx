import React, { useState } from "react";
import { useRouter } from "next/router";
import { LedgerLayout } from "../../design/layout";
import { PaymentSetup } from "../../design/components/PaymentSetup";
import type {
  PaymentFormValue,
} from "../../design/components/steps/types";

const fixtureForm: PaymentFormValue = {
  payee:
    "addr1q9x2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd",
  asset: "ADA",
  amount: "2.00",
  wallets: [
    {
      address:
        "stake1u84d82s2d60yz8zatlzkzlfp5qv9rjqx6hjq3frudyazwjsmf6q72",
      status: "valid",
    },
  ],
  startTime: "2026-04-20 18:00",
  endTime: "2026-06-08 18:00",
  frequencyEpochs: 1,
  maxFeeAda: "1.0",
  acceptRisk: false,
  acceptFees: false,
};

function DesignSetup() {
  const router = useRouter();
  const mode = router.query.mode === "generic" ? "generic" : "hosky";
  const [form, setForm] = useState<PaymentFormValue>(fixtureForm);

  return (
    <LedgerLayout currentPath="/design/setup">
      <PaymentSetup
        mode={mode as "hosky" | "generic"}
        value={form}
        onChange={setForm}
        onSubmit={() => router.push("/design/schedules")}
      />
    </LedgerLayout>
  );
}

(DesignSetup as any).standalone = true;
export default DesignSetup;
