import React from "react";
import { useRouter } from "next/router";
import { LedgerLayout } from "../design/layout";
import { PaymentSetup } from "../design/components/PaymentSetup";

function SetupPage() {
    const router = useRouter();
    const mode = router.query.mode === "generic" ? "generic" : "hosky";

    const onModeChange = (next: "hosky" | "generic") => {
        router.replace({ pathname: "/setup", query: { mode: next } }, undefined, {
            shallow: true,
        });
    };

    return (
        <LedgerLayout currentPath="/setup">
            {/* `key={mode}` remounts the stepper so mode-specific form
                state (Hosky template vs blank generic) is reset cleanly. */}
            <PaymentSetup
                key={mode}
                mode={mode as "hosky" | "generic"}
                onModeChange={onModeChange}
            />
        </LedgerLayout>
    );
}

(SetupPage as any).standalone = true;
export default SetupPage;
