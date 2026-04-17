import React from "react";
import { useRouter } from "next/router";
import { LedgerLayout } from "../design/layout";
import { PaymentSetup } from "../design/components/PaymentSetup";

function SetupPage() {
    const router = useRouter();
    const mode = router.query.mode === "generic" ? "generic" : "hosky";

    return (
        <LedgerLayout currentPath="/setup">
            <PaymentSetup mode={mode as "hosky" | "generic"} />
        </LedgerLayout>
    );
}

(SetupPage as any).standalone = true;
export default SetupPage;
