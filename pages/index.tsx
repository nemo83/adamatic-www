import React, {useEffect, useState} from "react";
import { useWallet} from "@meshsdk/react";
import {
    Data, hexToString,
    Recipient,
    Transaction, UTxO
} from "@meshsdk/core";
import TransactionUtil from "./util/TransactionUtil";
import DatumDTO from "./interfaces/DatumDTO";
import {SCRIPT} from "./util/Constants";
import Navbar from "./components/Navbar";
import UserInput from "./components/UserInput";
import Grid from "@mui/material/Grid2";
import {Button, Stack, Typography} from "@mui/material";
import GetScriptTransactionsResponse from "./interfaces/GetScriptTransactionsResponse";
import {castRawDataToJsonString, deserializePlutusData, toPlutusData} from "@meshsdk/core-csl";
import {fromPlutusData} from "@cardano-sdk/core/dist/cjs/Asset/NftMetadata/fromPlutusData";
import {bytesToString} from "@scure/base";

export default function Home() {

    const { wallet, connected } = useWallet();
    const [ txHash, setTxHash ] = useState("" as string);
    const [datumDTO, setDatumDTO] = useState<DatumDTO>({"assetAmount": {"policyId": "", "assetName": "", "amount": 0}, "payAddress": "", "timingDTO": {"startTime": 0, "endTime": undefined, "paymentIntervalHours": 0, "maxPaymentDelayHours": undefined}, "maxFeesLovelace": 0});
    const [networkID, setNetworkID] = useState(0 as number);
    const [scriptAddress, setScriptAddress] = useState("" as string);

    useEffect(() => {
        if (connected) {
            wallet.getNetworkId().then((id) => {
                setNetworkID(id);

            });
            TransactionUtil.getScriptAddressWithStakeCredential(wallet, SCRIPT).then((address) => {
                setScriptAddress(address);
            });
        }
    }, [wallet]);

    useEffect(() => {
        if(connected) {
            fetch('api/GetScriptUTXOs', {method: "POST", body: scriptAddress}).then(response => response.json()).then(data => {
                console.log("aaaa")
                const utxos : GetScriptTransactionsResponse[] = JSON.parse(data.name);
                utxos.forEach((utxo) => {
                    console.log(utxo.tx_hash);
                    console.log(utxo.tx_datum);
                    const plutusData = deserializePlutusData(utxo.tx_datum);
                    console.log(plutusData);

                    console.log(plutusData.as_constr_plutus_data()?.data().get(9).to_bytes());
                    const s = hexToString(plutusData.as_constr_plutus_data()?.data().get(9).to_hex()!);
                    console.log(s);
                });
            });
                // .then(response => response.json())
                // .then(data => {
                //     console.log(data);
                // });
        }
    }, [scriptAddress]);

    useEffect(() => {


    }, []);


    async function signAndSubmit() {
        if (wallet) {
            const datum : Data = await TransactionUtil.createDatum(
                wallet,
                datumDTO
                );


            const scriptAddress = await TransactionUtil.getScriptAddressWithStakeCredential(wallet, SCRIPT);
            const recipient : Recipient = {
                address: scriptAddress,
                datum: {
                    value: datum,
                    inline: true
                }
            };
            const unsignedTx = await new Transaction({initiator: wallet}).sendLovelace(recipient, "10000000").build();
            const signedTx = await wallet.signTx(unsignedTx);
            setTxHash(await wallet.submitTx(signedTx));
        }
    }


    return (
        <Stack spacing={1} alignContent={"center"}>
            <Navbar />
            <Grid container spacing={2} sx={{paddingTop:'30px'}}>
                <Grid size={1}></Grid>
                <Grid size={5}>
                    <UserInput setDatumDTO={setDatumDTO} datumDTO={datumDTO} />
                </Grid>
                <Grid size={5}>
                    {connected ?
                        <Stack spacing={1}>
                            <div>Wallet Connected - {wallet._walletName}</div>
                            <div>Network: {networkID == 0 ? "Testnet" : "Mainnet"}</div>
                            <div>Script Address: {scriptAddress}</div>
                        </Stack> : <></>
                    }
                </Grid>
                <Grid size={1}></Grid>
            </Grid>
            <Button variant={"outlined"} onClick={() => signAndSubmit()}>Sign & Submit</Button>
            {txHash !== "" ? <p>Transaction Hash: {txHash}</p> : <></>}
        </Stack>
    );
}
