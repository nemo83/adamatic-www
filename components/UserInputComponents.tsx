import {Button, TextField, Tooltip} from "@mui/material";
import {CONSTANTS} from "../lib/util/Constants";
import React from "react";
import RecurringPaymentDatum from "../lib/interfaces/RecurringPaymentDatum";
import {DateTimePicker} from "@mui/x-date-pickers";


export function DepositAda (props : {inputLovelace : boolean, setInputLovelae : (inputLovelace : boolean) => void, datumDTO : any, handleAdaInputChange : (event: React.ChangeEvent<HTMLInputElement>) => void}) {

    const { inputLovelace, setInputLovelae, datumDTO, handleAdaInputChange } = props;

    return (
        <Tooltip title={"The amount of ADA to deposit into the smart contract"}>
            <TextField label={"Amount To Deposit"} type={"number"} value={inputLovelace ? datumDTO.amountToDeposit : datumDTO.amountToDeposit / CONSTANTS.ADA_CONVERSION} name={"amountToDeposit"} onChange={handleAdaInputChange}
                       slotProps={{
                           input: {
                               endAdornment: <Button onClick={() => setInputLovelae(!inputLovelace)}>{inputLovelace? "Lovelace" : "Ada"}</Button>,
                           },
                       }}
            />
        </Tooltip>
    )
}

export function MaxFeesAda (props : {inputLovelace : boolean, setInputLovelae : (inputLovelace : boolean) => void, datumDTO : any, handleAdaInputChange : (event: React.ChangeEvent<HTMLInputElement>) => void}) {

    const { inputLovelace, setInputLovelae, datumDTO, handleAdaInputChange } = props;

    return (
        <Tooltip title={"The maximum amount of fees ADA spent for the recurring payments"}>
            <TextField label={"Max Fees in Lovelace"}  type={"number"} value={inputLovelace ? datumDTO.maxFeesLovelace : datumDTO.maxFeesLovelace / CONSTANTS.ADA_CONVERSION} name={"maxFeesLovelace"} onChange={handleAdaInputChange}
                       slotProps={{
                           input: {
                               endAdornment: <Button onClick={() => setInputLovelae(!inputLovelace)}>{inputLovelace? "Lovelace" : "Ada"}</Button>,
                           },
                       }}
            />
        </Tooltip>
    );
}

export function PayeeAddress(props: {datumDTO : RecurringPaymentDatum, handleInputChange : (event: React.ChangeEvent<HTMLInputElement>) => void}) {

    const { datumDTO, handleInputChange } = props;

    return (
        <Tooltip title={"The address of the payee. This address will receive the payments."}>
            <TextField label={"Payee Address"} value={datumDTO.payAddress} name={"payAddress"} onChange={handleInputChange}/>
        </Tooltip>
    );
}

export function StartTime(props: {startTime : any, setStartTime : (startTime : any) => void}) {

    const { startTime, setStartTime } = props;

    return (
        <Tooltip title={"The Time of the first payment"}>
            <DateTimePicker label={"StartTime"} value={startTime} onChange={(newValue) => setStartTime(newValue)}/>
        </Tooltip>
    );
}

export function EndTime(props: {endTime : any, setEndTime : (endTime : any) => void}) {

    const { endTime, setEndTime } = props;

    return (
        <Tooltip title={"The time of the last payment. If empty the payments will continue until there is no ADA left."}>
            <DateTimePicker label={"Endtime (optional)"} value={endTime} onChange={(newValue) => setEndTime(newValue)}/>
        </Tooltip>
    );
}

export function PaymentIntervalHours(props: {datumDTO : RecurringPaymentDatum, handleInputChange : (event: React.ChangeEvent<HTMLInputElement>) => void}) {

    const { datumDTO, handleInputChange } = props;

    return (
        <div>
            <Tooltip title={"The interval in hours between the payments"}>
                <TextField style={{width: "50%"}} label={"Payment Interval Hours"} type={"number"} value={datumDTO.paymentIntervalHours} name={"paymentIntervalHours"} onChange={handleInputChange} />
            </Tooltip>
        </div>
    );
}

export function MaxPaymentDelayHours(props: {datumDTO : RecurringPaymentDatum, handleInputChange : (event: React.ChangeEvent<HTMLInputElement>) => void}) {

    const { datumDTO, handleInputChange } = props;

    return (
        <div>
            <Tooltip title={"The maximum delay in hours for a payment to be made."} >
                <TextField style={{width: "50%"}} label={"Max Payment Delay Hours"} type={"number"} value={datumDTO.maxPaymentDelayHours} name={"maxPaymentDelayHours"} onChange={handleInputChange} />
            </Tooltip>
        </div>
    );
}

