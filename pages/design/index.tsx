import React, { useState } from "react";
import { useRouter } from "next/router";
import { LedgerLayout } from "../../design/layout";
import { Landing, type PaymentMode } from "../../design/components/Landing";

function DesignLanding() {
  const router = useRouter();
  const initial =
    (router.query.mode === "generic" ? "generic" : "hosky") as PaymentMode;
  const [mode, setMode] = useState<PaymentMode>(initial);

  return (
    <LedgerLayout currentPath="/design">
      <Landing
        mode={mode}
        onModeChange={setMode}
        onStart={() => router.push(`/design/setup?mode=${mode}`)}
      />
    </LedgerLayout>
  );
}

(DesignLanding as any).standalone = true;
export default DesignLanding;
