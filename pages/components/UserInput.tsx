import DatumDTO from "../interfaces/DatumDTO";
import {Stack, TextField} from "@mui/material";
import {useEffect} from "react";

export default function UserInput(props: {datumDTO : DatumDTO, setDatumDTO :  (userInput: DatumDTO) => void}) {

    const { datumDTO, setDatumDTO } = props;



    return (
        <>
            Set up a recurring Payment:
            <Stack spacing={1}>
                <TextField label={"Policy ID"} value={datumDTO.assetAmount.policyId} onChange={(e) => setDatumDTO({...datumDTO, assetAmount: {...datumDTO.assetAmount, policyId: e.target.value}})} />
                <TextField label={"Asset Name"} value={datumDTO.assetAmount.assetName} onChange={(e) => setDatumDTO({...datumDTO, assetAmount: {...datumDTO.assetAmount, assetName: e.target.value}})} />
                <TextField label={"Amount"} value={datumDTO.assetAmount.amount} onChange={(e) => setDatumDTO({...datumDTO, assetAmount: {...datumDTO.assetAmount, amount: e.target.value}})} />
                <TextField label={"Payee Address"} value={datumDTO.payAddress} onChange={(e) => setDatumDTO({...datumDTO, payAddress: e.target.value})} />
                <TextField label={"Start Time"} value={datumDTO.timingDTO.startTime} onChange={(e) => setDatumDTO({...datumDTO, timingDTO: {...datumDTO.timingDTO, startTime: e.target.value}})} />
                <TextField label={"End Time"} value={datumDTO.timingDTO.endTime} onChange={(e) => setDatumDTO({...datumDTO, timingDTO: {...datumDTO.timingDTO, endTime: e.target.value}})} />
                <TextField label={"Payment Interval Hours"} value={datumDTO.timingDTO.paymentIntervalHours} onChange={(e) => setDatumDTO({...datumDTO, timingDTO: {...datumDTO.timingDTO, paymentIntervalHours: e.target.value}})} />
                <TextField label={"Max Payment Delay Hours"} value={datumDTO.timingDTO.maxPaymentDelayHours} onChange={(e) => setDatumDTO({...datumDTO, timingDTO: {...datumDTO.timingDTO, maxPaymentDelayHours: e.target.value}})} />
                <TextField label={"Max Fees Lovelace"} value={datumDTO.maxFeesLovelace} onChange={(e) => setDatumDTO({...datumDTO, maxFeesLovelace: e.target.value})} />
            </Stack>
        </>
    )
}