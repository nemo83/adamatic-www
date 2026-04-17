import React from "react";
import {
  Eye,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Stamp } from "../ui/Stamp";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { cn } from "../lib/cn";

export type PaymentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "WITHDRAWN"
  | "CANCELLED"
  | "INSUFFICIENT_FUNDS";

export interface PaymentRow {
  id: string;
  stakingAddress: string;
  nextRun?: string;
  balanceLovelace: number;
  asset: string;
  status: PaymentStatus;
}

export interface PaymentsTableProps {
  rows: PaymentRow[];
  selected: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onView: (id: string) => void;
  onCancel: (id: string) => void;
  onCancelSelected?: () => void;
}

const statusTone: Record<PaymentStatus, "amber" | "jade" | "mist" | "rust"> = {
  SCHEDULED: "amber",
  COMPLETED: "jade",
  WITHDRAWN: "mist",
  CANCELLED: "mist",
  INSUFFICIENT_FUNDS: "rust",
};

const short = (a: string) =>
  a.length > 22 ? `${a.slice(0, 12)}…${a.slice(-6)}` : a;

const isCancellable = (s: PaymentStatus) =>
  s === "SCHEDULED" || s === "INSUFFICIENT_FUNDS";

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  rows,
  selected,
  onSelect,
  onSelectAll,
  onView,
  onCancel,
  onCancelSelected,
}) => {
  const cancellable = rows.filter((r) => isCancellable(r.status));
  const allSelected =
    cancellable.length > 0 && cancellable.every((r) => selected.has(r.id));
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <section className="px-4 md:px-8 py-8 md:py-10">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 min-h-[36px]">
          <p className="text-marginalia text-[13px]">
            {rows.length} entries · {cancellable.length} active
          </p>
          {selected.size > 0 && (
            <Button variant="danger" size="sm" onClick={onCancelSelected}>
              <Trash2 className="w-4 h-4" />
              Cancel selected ({selected.size})
            </Button>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block border border-rule rounded-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-paper">
              <tr className="text-left">
                <Th className="w-11">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                  />
                  {someSelected && (
                    <span className="sr-only">Some selected</span>
                  )}
                </Th>
                <Th>Stake key</Th>
                <Th>Next run</Th>
                <Th className="text-right">Balance</Th>
                <Th>Status</Th>
                <Th className="text-right w-[120px]">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-rule hover:bg-paper-raised transition-colors"
                >
                  <Td>
                    <Checkbox
                      checked={selected.has(row.id)}
                      onCheckedChange={() => onSelect(row.id)}
                    />
                  </Td>
                  <Td>
                    <div className="inline-flex items-center gap-2">
                      <span className="font-mono text-[13px]">
                        {short(row.stakingAddress)}
                      </span>
                      <a
                        href={`https://cardanoscan.io/stakekey/${row.stakingAddress}`}
                        target="_blank"
                        rel="noopener"
                        aria-label="Open on cardanoscan"
                        className="text-marginalia hover:text-ink p-1 rounded-sharp hover:bg-paper-raised"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </Td>
                  <Td>
                    {row.nextRun ? (
                      <span
                        className={cn(
                          "font-mono text-[13px]",
                          row.status === "SCHEDULED" &&
                            "text-amber-ink font-medium",
                        )}
                      >
                        {row.nextRun}
                      </span>
                    ) : (
                      <span className="font-mono text-marginalia">—</span>
                    )}
                  </Td>
                  <Td className="text-right">
                    {isCancellable(row.status) ? (
                      <span className="num">
                        {(row.balanceLovelace / 1_000_000).toFixed(2)}{" "}
                        <span className="font-mono text-[11px] text-marginalia">
                          {row.asset}
                        </span>
                      </span>
                    ) : (
                      <span className="font-mono text-marginalia">—</span>
                    )}
                  </Td>
                  <Td>
                    <Stamp tone={statusTone[row.status]}>
                      {row.status.replace("_", " ")}
                    </Stamp>
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-0.5">
                      <IconBtn label="View details" onClick={() => onView(row.id)}>
                        <Eye className="w-4 h-4" />
                      </IconBtn>
                      <IconBtn
                        label="Cancel"
                        onClick={() => onCancel(row.id)}
                        disabled={!isCancellable(row.status)}
                        tone="rust"
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconBtn>
                    </div>
                  </Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <Td colSpan={6}>
                    <div className="py-10 text-center text-marginalia">
                      No schedules yet. Set one up above.
                    </div>
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="flex md:hidden flex-col gap-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="border border-rule rounded-card p-4 bg-paper"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-marginalia mb-0.5">
                    Stake
                  </div>
                  <div className="font-mono text-[12px]">
                    {short(row.stakingAddress)}
                  </div>
                </div>
                <Stamp tone={statusTone[row.status]}>
                  {row.status.replace("_", " ")}
                </Stamp>
              </div>

              <div className="flex justify-between gap-3 mt-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-marginalia">
                    Next
                  </div>
                  <div
                    className={cn(
                      "font-mono text-[13px] mt-0.5",
                      row.status === "SCHEDULED" && "text-amber-ink",
                    )}
                  >
                    {row.nextRun ?? "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-marginalia">
                    Balance
                  </div>
                  <div className="num mt-0.5 text-sm">
                    {isCancellable(row.status)
                      ? `${(row.balanceLovelace / 1_000_000).toFixed(2)} ${row.asset}`
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-rule">
                <IconBtn label="View" onClick={() => onView(row.id)}>
                  <Eye className="w-4 h-4" />
                </IconBtn>
                <IconBtn
                  label="Cancel"
                  onClick={() => onCancel(row.id)}
                  disabled={!isCancellable(row.status)}
                  tone="rust"
                >
                  <Trash2 className="w-4 h-4" />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th
    className={cn(
      "font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia font-medium px-3 py-3",
      className,
    )}
    {...props}
  >
    {children}
  </th>
);

const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={cn("px-3 py-3.5 text-[14px]", className)} {...props}>
    {children}
  </td>
);

const IconBtn: React.FC<{
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "default" | "rust";
  children: React.ReactNode;
}> = ({ label, onClick, disabled, tone = "default", children }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-8 h-8 rounded-sharp grid place-items-center transition-colors",
      "hover:bg-paper-raised",
      "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
      tone === "rust" && !disabled && "hover:text-rust",
    )}
  >
    {children}
  </button>
);
