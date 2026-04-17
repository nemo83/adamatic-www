/**
 * Datum byte-compatibility verification.
 *
 * Runs the comparison in getServerSideProps so it's visible to `curl` as
 * server-rendered HTML. Route: /_internal/datum-compat
 */
import React from "react";
import type { GetServerSideProps } from "next";
import TransactionUtil from "../../lib/util/TransactionUtil";
import { builderDataToCbor } from "@meshsdk/core-csl";
import { getEvolutionChainAdapter, datumToCborHex } from "../../lib/cardano/EvolutionChainAdapter";
import type RecurringPaymentDatum from "../../lib/interfaces/RecurringPaymentDatum";

const fixtures: Array<{ name: string; dto: RecurringPaymentDatum }> = [
  {
    name: "Hosky-like: ADA, base+stake payee, endTime set, interval set",
    dto: {
      ownerPaymentPubKeyHash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
      amountToSend: [{ policyId: "", assetName: "", amount: 2_000_000 }],
      payee:
        "addr_test1qzx9hu8j4ah3auytk0mwcupd69hpc52t0cw39a65ndrah86djs784u92a3m5w475w3w35tyd6v3qumkze80j8a6h5tuqq5xe8y",
      startTime: 1_760_000_000_000,
      endTime: 1_760_430_000_000,
      paymentIntervalHours: 120,
      maxPaymentDelayHours: undefined,
      maxFeesLovelace: 1_000_000,
    },
  },
  {
    name: "Open-ended: no endTime, no interval, no maxDelay",
    dto: {
      ownerPaymentPubKeyHash: "1111111111111111111111111111111111111111111111111111111111111111".slice(0, 56),
      amountToSend: [{ policyId: "", assetName: "", amount: 5_000_000 }],
      payee:
        "addr_test1qzx9hu8j4ah3auytk0mwcupd69hpc52t0cw39a65ndrah86djs784u92a3m5w475w3w35tyd6v3qumkze80j8a6h5tuqq5xe8y",
      startTime: 1_760_000_000_000,
      endTime: undefined,
      paymentIntervalHours: undefined,
      maxPaymentDelayHours: undefined,
      maxFeesLovelace: 500_000,
    },
  },
  {
    name: "Native asset: non-empty policyId/assetName",
    dto: {
      ownerPaymentPubKeyHash: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      amountToSend: [
        {
          policyId: "cafebabecafebabecafebabecafebabecafebabecafebabecafebabe",
          assetName: "424542",
          amount: 100_000_000,
        },
      ],
      payee:
        "addr_test1qzx9hu8j4ah3auytk0mwcupd69hpc52t0cw39a65ndrah86djs784u92a3m5w475w3w35tyd6v3qumkze80j8a6h5tuqq5xe8y",
      startTime: 1_760_000_000_000,
      endTime: 1_790_000_000_000,
      paymentIntervalHours: 168,
      maxPaymentDelayHours: 24,
      maxFeesLovelace: 2_000_000,
    },
  },
];

type Row = {
  name: string;
  meshCbor: string;
  evoCbor: string;
  match: boolean;
  error?: string;
};

interface Props {
  rows: Row[];
  allMatch: boolean;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const evolution = getEvolutionChainAdapter();
  const rows: Row[] = fixtures.map(({ name, dto }) => {
    try {
      const meshDatum = TransactionUtil.createDatum(dto);
      const meshCbor = builderDataToCbor({ type: "Mesh", content: meshDatum as any });

      const evoDatum = evolution.encodeSetupDatum(dto);
      const evoCbor = datumToCborHex(evoDatum);

      return {
        name,
        meshCbor,
        evoCbor,
        match: meshCbor.toLowerCase() === evoCbor.toLowerCase(),
      };
    } catch (e: any) {
      return {
        name,
        meshCbor: "",
        evoCbor: "",
        match: false,
        error: e?.message ? `${e.message}\n${e.stack ?? ""}` : String(e),
      };
    }
  });

  return {
    props: {
      rows,
      allMatch: rows.length > 0 && rows.every((r) => r.match),
    },
  };
};

export default function DatumCompat({ rows, allMatch }: Props) {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Datum byte-compat · Mesh vs Evolution</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Each fixture is encoded via both adapters, serialized to CBOR hex, and compared.
      </p>

      <div
        style={{
          padding: 12,
          marginBottom: 24,
          border: `2px solid ${allMatch ? "#2F6B4A" : "#8B2C1C"}`,
          background: allMatch ? "#E8F5EC" : "#FDECEC",
          color: allMatch ? "#2F6B4A" : "#8B2C1C",
          borderRadius: 6,
          fontWeight: 600,
        }}
      >
        {allMatch ? "✓ All fixtures match." : "✗ Mismatch — Evolution encoder needs fixing."}
      </div>

      {rows.map((r, i) => (
        <section
          key={i}
          style={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderLeft: `4px solid ${r.match ? "#2F6B4A" : "#8B2C1C"}`,
            padding: 16,
            marginBottom: 16,
            borderRadius: 6,
          }}
        >
          <h2 style={{ fontSize: 15, marginBottom: 8 }}>
            {r.match ? "✓" : "✗"} {r.name}
          </h2>
          {r.error ? (
            <pre style={{ color: "#8B2C1C", whiteSpace: "pre-wrap" }}>{r.error}</pre>
          ) : (
            <>
              <div style={{ marginBottom: 8 }}>
                <div style={{ opacity: 0.6, fontSize: 12 }}>
                  Mesh CBOR ({r.meshCbor.length / 2} bytes)
                </div>
                <div style={{ fontSize: 12, wordBreak: "break-all" }}>{r.meshCbor}</div>
              </div>
              <div>
                <div style={{ opacity: 0.6, fontSize: 12 }}>
                  Evolution CBOR ({r.evoCbor.length / 2} bytes)
                </div>
                <div style={{ fontSize: 12, wordBreak: "break-all" }}>{r.evoCbor}</div>
              </div>
            </>
          )}
        </section>
      ))}
    </div>
  );
}

(DatumCompat as any).standalone = true;
