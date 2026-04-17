import React from "react";
import { Dialog } from "../ui/Dialog";
import { Stamp } from "../ui/Stamp";
import { ExternalLink, Copy } from "lucide-react";
import { cn } from "../lib/cn";

export type TxEventType =
  | "CREATED"
  | "SCHEDULED"
  | "PAYMENT_EXECUTED"
  | "WITHDRAWN"
  | "COMPLETED";

export interface TxEvent {
  timestamp: number;
  type: TxEventType;
  txHash?: string;
  balanceLovelace: number;
}

export interface PaymentDetails {
  from: string;
  to: string;
  amountLovelace: number;
  asset: string;
  numPulls: number;
  epochInterval: number;
  initialDepositLovelace: number;
  maxFeeLovelace: number;
  epochStart: number;
  epochEnd: number;
  events: TxEvent[];
}

export interface PaymentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  details?: PaymentDetails;
}

const eventLabel: Record<TxEventType, string> = {
  CREATED: "Schedule created",
  SCHEDULED: "Pull scheduled",
  PAYMENT_EXECUTED: "Payment sent",
  WITHDRAWN: "Withdrawn by owner",
  COMPLETED: "Schedule completed",
};

const eventTone: Record<TxEventType, "mist" | "amber" | "jade" | "neutral"> = {
  CREATED: "neutral",
  SCHEDULED: "amber",
  PAYMENT_EXECUTED: "jade",
  WITHDRAWN: "mist",
  COMPLETED: "jade",
};

const shortHash = (h?: string) =>
  h ? `${h.slice(0, 8)}…${h.slice(-8)}` : "—";

const shortAddr = (a: string) =>
  a.length > 22 ? `${a.slice(0, 12)}…${a.slice(-8)}` : a;

const fmtDate = (ts: number) =>
  new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 16) + " UTC";

export const PaymentDetailsDialog: React.FC<PaymentDetailsDialogProps> = ({
  open,
  onClose,
  details,
}) => {
  const copy = (text: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Schedule detail"
      description="Record · on-chain event log"
      size="lg"
    >
      <div className="px-5 md:px-6 py-5">
        {!details ? (
          <div className="text-marginalia">Loading…</div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 border-t border-b border-rule py-4">
              <Detail label="From">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-mono text-[14px]">{shortAddr(details.from)}</span>
                  <button
                    type="button"
                    onClick={() => copy(details.from)}
                    aria-label="Copy from address"
                    className="text-marginalia hover:text-ink p-1 rounded-sharp hover:bg-paper-raised"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </span>
              </Detail>
              <Detail label="To">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-mono text-[14px]">{shortAddr(details.to)}</span>
                  <button
                    type="button"
                    onClick={() => copy(details.to)}
                    aria-label="Copy to address"
                    className="text-marginalia hover:text-ink p-1 rounded-sharp hover:bg-paper-raised"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </span>
              </Detail>
            </div>

            <div className="border border-rule rounded-card grid grid-cols-2 md:grid-cols-4 overflow-hidden">
              <Cell k="Per payment" v={`${(details.amountLovelace / 1_000_000).toFixed(2)}`} unit={details.asset} dominant />
              <Cell k="Count" v={`${details.numPulls}`} unit="pulls" />
              <Cell k="Interval" v={`${details.epochInterval}`} unit="epoch" />
              <Cell k="Max fee" v={`${(details.maxFeeLovelace / 1_000_000).toFixed(2)}`} unit="ADA" />
              <Cell k="Initial deposit" v={`${(details.initialDepositLovelace / 1_000_000).toFixed(2)}`} unit="ADA" />
              <Cell k="Epoch start" v={`${details.epochStart}`} />
              <Cell k="Epoch end" v={`${details.epochEnd}`} />
              <Cell k="Events" v={`${details.events.length}`} unit="entries" />
            </div>

            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia mb-2">
                Event log
              </div>
              <div className="border border-rule rounded-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <Th>Timestamp (UTC)</Th>
                      <Th>Event</Th>
                      <Th>Tx</Th>
                      <Th className="text-right">Balance</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.events.map((e, i) => (
                      <tr
                        key={i}
                        className="border-t border-rule hover:bg-paper-raised"
                      >
                        <Td className="font-mono text-[12px]">{fmtDate(e.timestamp)}</Td>
                        <Td>
                          <div className="inline-flex items-center gap-2">
                            <Stamp tone={eventTone[e.type]}>
                              {e.type.replace("_", " ")}
                            </Stamp>
                            <span className="text-[13px] text-marginalia">
                              {eventLabel[e.type]}
                            </span>
                          </div>
                        </Td>
                        <Td>
                          {e.txHash ? (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="font-mono text-[12px]">
                                {shortHash(e.txHash)}
                              </span>
                              <a
                                href={`https://cardanoscan.io/transaction/${e.txHash}`}
                                target="_blank"
                                rel="noopener"
                                className="text-marginalia hover:text-ink p-1 rounded-sharp hover:bg-paper-raised"
                                aria-label="Open tx"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <span className="font-mono text-marginalia">—</span>
                          )}
                        </Td>
                        <Td className="text-right">
                          <span className="num text-[13px]">
                            {(e.balanceLovelace / 1_000_000).toFixed(2)}{" "}
                            <span className="font-mono text-[11px] text-marginalia">
                              ADA
                            </span>
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end px-5 md:px-6 py-3 border-t border-rule">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-marginalia hover:text-ink"
        >
          Close
        </button>
      </div>
    </Dialog>
  );
};

const Detail: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="min-w-0">
    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia mb-1">
      {label}
    </div>
    <div className="break-all">{children}</div>
  </div>
);

const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th
    className={cn(
      "font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia font-medium px-3 py-2",
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
  <td className={cn("px-3 py-3 text-[13px]", className)} {...props}>
    {children}
  </td>
);

const Cell: React.FC<{
  k: string;
  v: string;
  unit?: string;
  dominant?: boolean;
}> = ({ k, v, unit, dominant }) => (
  <div className="p-4 border-r border-b border-rule last:border-r-0 [&:nth-child(4n)]:border-r-0 [&:nth-last-child(-n+4)]:md:border-b-0">
    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-marginalia">
      {k}
    </div>
    <div
      className={cn(
        "mt-1 num",
        dominant
          ? "font-display text-[24px] font-semibold leading-none"
          : "text-[16px] font-medium",
      )}
    >
      {v}
      {unit && (
        <span className="ml-1 font-mono text-[11px] text-marginalia">
          {unit}
        </span>
      )}
    </div>
  </div>
);
