import React, { useState } from "react";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";
import { LedgerLayout } from "../../design/layout";
import {
  PaymentsTable,
  type PaymentRow,
} from "../../design/components/PaymentsTable";
import {
  PaymentDetailsDialog,
  type PaymentDetails,
} from "../../design/components/PaymentDetailsDialog";
import { Button } from "../../design/ui/Button";

const fixtureRows: PaymentRow[] = [
  {
    id: "a1",
    stakingAddress:
      "stake1u84d82s2d60yz8zatlzkzlfp5qv9rjqx6hjq3frudyazwjsmf6q72",
    nextRun: "2026-04-20 18:05 UTC",
    balanceLovelace: 6_800_000,
    asset: "ADA",
    status: "SCHEDULED",
  },
  {
    id: "a2",
    stakingAddress:
      "stake1uxsjrxgp8y8npyzmqn6g9jyez49hwmeuu6mhuuq5xvcj6gqevux32",
    nextRun: "2026-04-20 18:05 UTC",
    balanceLovelace: 1_200_000,
    asset: "ADA",
    status: "INSUFFICIENT_FUNDS",
  },
  {
    id: "a3",
    stakingAddress:
      "stake1u9p59axpnrs7sc2d0q7ns9ezhpwm4yq5mauazcc5s9xyaeczv3luz",
    balanceLovelace: 0,
    asset: "ADA",
    status: "COMPLETED",
  },
  {
    id: "a4",
    stakingAddress:
      "stake1u83383pq6z25326dqnh2w9fhrxsrveq344vh6yufhcanfcgl289w8",
    balanceLovelace: 0,
    asset: "ADA",
    status: "CANCELLED",
  },
];

const fixtureDetails: PaymentDetails = {
  from: "stake1u84d82s2d60yz8zatlzkzlfp5qv9rjqx6hjq3frudyazwjsmf6q72",
  to: "addr1q9x2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd",
  amountLovelace: 2_000_000,
  asset: "ADA",
  numPulls: 10,
  epochInterval: 1,
  initialDepositLovelace: 30_000_000,
  maxFeeLovelace: 1_000_000,
  epochStart: 520,
  epochEnd: 530,
  events: [
    {
      timestamp: 1_760_000_000,
      type: "CREATED",
      txHash:
        "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
      balanceLovelace: 30_000_000,
    },
    {
      timestamp: 1_760_430_000,
      type: "PAYMENT_EXECUTED",
      txHash:
        "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
      balanceLovelace: 27_000_000,
    },
    {
      timestamp: 1_760_860_000,
      type: "SCHEDULED",
      balanceLovelace: 27_000_000,
    },
  ],
};

function DesignSchedules() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailsOpen, setDetailsOpen] = useState(false);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    const cancellable = fixtureRows.filter(
      (r) => r.status === "SCHEDULED" || r.status === "INSUFFICIENT_FUNDS",
    );
    if (cancellable.every((r) => selected.has(r.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(cancellable.map((r) => r.id)));
    }
  };

  return (
    <LedgerLayout currentPath="/design/schedules">
      <section className="px-4 md:px-8 pt-10 md:pt-14">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
              Ledger · № 03
            </div>
            <h1 className="font-display text-[32px] md:text-[44px] font-semibold leading-[1.05] mt-1">
              My schedules
            </h1>
            <p className="text-marginalia text-sm mt-1.5 max-w-xl">
              Every recurring payment signed by this wallet. Click a row for
              the full record.
            </p>
          </div>
          <Button onClick={() => router.push("/design/setup")} size="md">
            <Plus className="w-4 h-4" />
            New schedule
          </Button>
        </div>
      </section>

      <PaymentsTable
        rows={fixtureRows}
        selected={selected}
        onSelect={toggle}
        onSelectAll={toggleAll}
        onView={() => setDetailsOpen(true)}
        onCancel={() => {}}
        onCancelSelected={() => {}}
      />

      <PaymentDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        details={fixtureDetails}
      />
    </LedgerLayout>
  );
}

(DesignSchedules as any).standalone = true;
export default DesignSchedules;
