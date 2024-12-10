import RecurringPaymentDatum from "../lib/interfaces/RecurringPaymentDatum";
import {
    Avatar,
    Button, Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, InputAdornment,
    Stack,
    TextField, Tooltip
} from "@mui/material";
import React, { useEffect } from "react";
import { Add } from "@mui/icons-material";
import AssetAmount from "../lib/interfaces/AssetAmount";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ADAMATIC_HOST, CONSTANTS } from "../lib/util/Constants";
import { useWallet } from "@meshsdk/react";
import { Address, AddressType, NetworkId, Credential } from "@meshsdk/core-cst";

export default function UserInput(props: {
    deposit: number,
    setDeposit: (deposit: number) => void,
    walletFrom: string,
    setWalletFrom: (walletFrom: string) => void,
    datumDTO: RecurringPaymentDatum,
    setDatumDTO: (userInput: RecurringPaymentDatum) => void,
    isHoskyInput: boolean
}) {

    const { deposit, setDeposit, walletFrom, setWalletFrom, datumDTO, setDatumDTO, isHoskyInput } = props;

    const [dialogOpen, setDialogOpen] = React.useState(false);

    const { wallet, connected } = useWallet();

    const [owner, setOwner] = React.useState<string>("");
    const [payee, setPayee] = React.useState<string>("");
    const [maxFeesLovelace, setMaxFeesLovelace] = React.useState<number>(500_000);
    const [startTime, setStartTime] = React.useState<Dayjs | null>(dayjs());
    const [endTime, setEndTime] = React.useState<Dayjs | null>(null);
    const [paymentIntervalEpochs, setPaymentIntervalEpochs] = React.useState<number>(1);
    const [paymentIntervalHours, setPaymentIntervalHours] = React.useState<number>(1);
    const [inputLovelace, setInputLovelace] = React.useState<boolean>(false)

    const [epochStart, setEpochStart] = React.useState<number>(0);
    const [epochEnd, setEpochEnd] = React.useState<number>(0);

    const [numPulls, setNumPulls] = React.useState<number>(1);

    useEffect(() => {

        if (connected) {
            wallet.getUsedAddress().then((address) => {
                const userWallet = address.asBase()!.toAddress().toBech32().toString();
                setOwner(userWallet);
                if (!walletFrom) {
                    setWalletFrom(userWallet);
                }
            });
        } else {
            setWalletFrom("");
        }


    }, [connected])

    useEffect(() => {
        if (isHoskyInput) {
            fetch(ADAMATIC_HOST + '/recurring_payments/template/hosky')
                .then(response => response.json())
                .then(data => {
                    setEpochStart(data.epoch_start);
                    setEpochEnd(data.epoch_end);
                    setPaymentIntervalEpochs(data.epoch_frequency);

                    const numPulls = Math.floor((data.epoch_end - data.epoch_start) / data.epoch_frequency);
                    setNumPulls(numPulls)

                    setDeposit(data.suggested_deposit[0].amount);
                    setPayee(data.payee_address);
                    setStartTime(dayjs(data.start_time_timestamp));
                    setEndTime(dayjs(data.end_time_timestamp));

                    setPaymentIntervalHours(data.payment_interval_hours);

                })
        }
    }, [isHoskyInput]);

    const updateStuff = async (epochStart: number, numPulls: number, epochFrequency: number) => {
        let baseRequest = {
            epoch_start: epochStart.toString(),
            num_pulls: numPulls.toString(),
            epoch_frequency: epochFrequency.toString()
        };
        
        if (isHoskyInput) {
            fetch(ADAMATIC_HOST + '/recurring_payments/template/hosky?' + new URLSearchParams(baseRequest).toString())
                .then(response => response.json())
                .then(data => {
                    
                    setEpochStart(data.epoch_start);
                    setEpochEnd(data.epoch_end);

                    setDeposit(data.suggested_deposit[0].amount);
                    setPayee(data.payee_address);
                    setStartTime(dayjs(data.start_time_timestamp));
                    setEndTime(dayjs(data.end_time_timestamp));

                    setPaymentIntervalEpochs(data.epoch_frequency);

                })
        }
    }

    useEffect(() => {

        const newDatumDTO = {
            ...datumDTO,
            ownerPaymentPubKeyHash: owner ? Address.fromBech32(owner).asBase()!.getPaymentCredential().hash.toString() : "",
            amountToSend: [{ policyId: "", assetName: "", amount: 2000000 }],
            payee,
            startTime: startTime!.valueOf(),
            endTime: endTime?.valueOf(),
            paymentIntervalHours: paymentIntervalHours,
            maxFeesLovelace: maxFeesLovelace,
        }
        setDatumDTO(newDatumDTO);

    }, [owner, payee, walletFrom])

    const updateWalletFrom = (newWalletFrom: string) => {
        if (newWalletFrom) {
            setWalletFrom(newWalletFrom);
        } else {
            setWalletFrom(owner);
        }
    }

    return (
        <Stack spacing={1} style={{ paddingTop: "10px" }}>
            <Tooltip title={"Address for which collecting rewards"}>
                <TextField required={true} label={"Reward address"} value={walletFrom} name={"addressFrom"} onChange={(e) => setWalletFrom(e.target.value)}
                    onBlur={(e) => updateWalletFrom(e.target.value)}
                    data-tut="step-1"
                />
            </Tooltip>
            <Tooltip title={"The amount of ADA to deposit into the smart contract"}>
                <TextField disabled={true} label={"Amount To Deposit"} type={"number"} value={inputLovelace ? deposit : deposit / CONSTANTS.ADA_CONVERSION} name={"amountToDeposit"}
                    slotProps={{
                        input: {
                            endAdornment: <Button onClick={() => setInputLovelace(!inputLovelace)}>{inputLovelace ? "Lovelace" : "Ada"}</Button>,
                        },
                    }}
                    data-tut="step-2"
                />
            </Tooltip>
            <Tooltip title={"The maximum amount of fees ADA spent for the recurring payments"}>
                <TextField disabled={isHoskyInput} label={"Max Fees"} type={"number"} value={inputLovelace ? maxFeesLovelace : maxFeesLovelace / CONSTANTS.ADA_CONVERSION} name={"maxFeesLovelace"}
                    slotProps={{
                        input: {
                            endAdornment: <Button onClick={() => setInputLovelace(!inputLovelace)}>{inputLovelace ? "Lovelace" : "Ada"}</Button>,
                        },
                        htmlInput: { min: 0.5 }
                    }}
                    data-tut="step-3"
                    onChange={(event) => { setMaxFeesLovelace(inputLovelace ? Number(event.target.value) : Number(event.target.value) * CONSTANTS.ADA_CONVERSION) }}
                />
            </Tooltip>

            <Tooltip title={"Hosky Dogbowl Address."}>
                <TextField disabled={isHoskyInput} label={"Payee Address"} value={payee} name={"payAddress"} data-tut="step-4" />
            </Tooltip>
            {
                isHoskyInput ?
                    <Tooltip title={"Epoch of the first rewards being pulled."}>
                        <TextField type={"number"} label={"Start Epoch"} value={epochStart} name={"startEpoch"} onChange={(event) => updateStuff(parseInt(event.target.value), Math.floor((epochEnd - epochStart) / paymentIntervalEpochs), paymentIntervalEpochs)}
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">{startTime!.format('DD.MM.YYYY HH:mm')}</InputAdornment>,
                                },
                            }}
                            data-tut="step-5"
                        />
                    </Tooltip>
                    :
                    <Tooltip title={"The Time of the first payment"}>
                        <DateTimePicker label={"StartTime"} value={startTime} onChange={(newValue) => setStartTime(newValue)} />
                    </Tooltip>
            }


            {
                isHoskyInput ?
                    <Tooltip title={"Epoch of the last rewards being pulled."}>
                        <TextField disabled={isHoskyInput} type={"number"} label={"Endtime (optional)"} value={epochEnd} name={"endEpoch"}
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">{endTime ? endTime!.format('DD.MM.YYYY HH:mm') : ''}</InputAdornment>,
                                },
                            }}
                            data-tut="step-6"
                        />
                    </Tooltip>
                    :
                    <Tooltip title={"The time of the last payment. If empty the payments will continue until there is no ADA left."}>
                        <DateTimePicker label={"Endtime (optional)"} value={endTime} onChange={(newValue) => setEndTime(newValue)} />
                    </Tooltip>
            }


            <div>
                {isHoskyInput ?

                    <Tooltip title={"Number or Hosky Rewards pull"}>
                        <TextField style={{ width: "50%" }}
                            label={"Number of Rewards pulls"}
                            type={"number"}
                            // inputProps={{ inputProps: { min: 1, max: 10 } }}
                            slotProps={{ htmlInput: { min: 1, max: 10 } }}
                            value={numPulls}
                            name={"numPulls"}
                            onChange={(event) => { setNumPulls(parseInt(event.target.value)); updateStuff(epochStart, parseInt(event.target.value), paymentIntervalEpochs) }}
                            data-tut="step-7"
                        />
                    </Tooltip>


                    : <Tooltip title={"The maximum delay in hours for a payment to be made."} >
                        <TextField style={{ width: "50%" }} label={"Max Payment Delay Hours"} type={"number"} value={datumDTO.maxPaymentDelayHours} name={"maxPaymentDelayHours"} />
                    </Tooltip>
                }

                <Tooltip title={"The interval in epochs between the payments"}>
                    <TextField style={{ width: "50%" }} label={"Payment Interval Epochs"} type={"number"} value={paymentIntervalEpochs} name={"paymentIntervalHours"}
                        onChange={(event) => { updateStuff(epochStart, numPulls, parseInt(event.target.value)) }}
                        data-tut="step-8"
                    />
                </Tooltip>
            </div>

            {isHoskyInput ? null :
                <>
                    <Tooltip title={"The assets to pay each payment."}>
                        <span> {/*I need to add a span to make the tooltip work eventhough the button is disabled. Mui is listening to events, which aren't triggered on disabled buttons.*/}
                            <Button disabled={isHoskyInput} variant="outlined" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                                Add Asset
                            </Button>
                        </span>
                    </Tooltip>

                    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}
                        PaperProps={{
                            component: 'form',
                            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                                event.preventDefault();
                                const formData = new FormData(event.currentTarget);
                                const formJson = Object.fromEntries((formData as any).entries());
                                const asset: AssetAmount = {
                                    policyId: formJson.policyId,
                                    assetName: formJson.assetName ? formJson.assetName : "lovelace",
                                    amount: inputLovelace ? Number(formJson.amount) : Number(formJson.amount) * 1000000
                                };
                                const arr = datumDTO.amountToSend;
                                arr.push(asset);
                                setDatumDTO({ ...datumDTO, amountToSend: arr });
                                setDialogOpen(false);
                            },
                        }}>
                        <DialogTitle>Add Assets</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Add the policy ID, asset name, and amount of the asset to pay each payment.
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin={"dense"}
                                id={"policyId"}
                                name={"policyId"}
                                label={"Policy ID"}
                                type={"text"}
                                fullWidth
                                variant={"standard"}
                            />
                            <TextField
                                margin={"dense"}
                                id={"assetName"}
                                name={"assetName"}
                                label={"Asset Name"}
                                type={"text"}
                                fullWidth
                                variant={"standard"}
                            />
                            <TextField
                                required
                                margin={"dense"}
                                id={"amount"}
                                name={"amount"}
                                label={"Amount"}
                                type={"number"}
                                fullWidth
                                variant={"standard"}
                                slotProps={{
                                    input: {
                                        endAdornment: <Button onClick={() => setInputLovelace(!inputLovelace)}>{inputLovelace ? "Lovelace" : "Ada"}</Button>,
                                    },
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Add</Button>
                        </DialogActions>
                    </Dialog>
                    <div style={{ minHeight: "100px" }}>
                        {datumDTO.amountToSend.map((asset, index) => (
                            <Chip key={asset.policyId} disabled={isHoskyInput} variant={"outlined"} color={"primary"} style={{ height: "100%", maxWidth: "fit-content" }}
                                avatar={<Avatar src={"/img/cardano-starburst-white.svg"} />}
                                label={(
                                    <section>
                                        <div className={"assetChip"}>{asset.assetName}</div>
                                        <div className={"assetChip"}>{
                                            asset.policyId ?
                                                <>{asset.amount}</> :
                                                inputLovelace ?
                                                    <>{asset.amount} Lovelace</> :
                                                    <>{asset.amount / CONSTANTS.ADA_CONVERSION} ADA</>
                                        }
                                        </div>
                                    </section>
                                )}
                                onDelete={() => {
                                    if (!isHoskyInput) {
                                        const arr = datumDTO.amountToSend;
                                        arr.splice(index, 1);
                                        setDatumDTO({ ...datumDTO, amountToSend: arr });
                                    }
                                }}
                            />
                        ))}
                    </div>
                </>}
        </Stack>

    )
}