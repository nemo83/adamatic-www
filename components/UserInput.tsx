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
import React, {useEffect} from "react";
import {Add} from "@mui/icons-material";
import AssetAmount from "../lib/interfaces/AssetAmount";
import {DateTimePicker} from "@mui/x-date-pickers";
import dayjs, {Dayjs} from "dayjs";
import {CONSTANTS} from "../lib/util/Constants";
import TransactionUtil from "../lib/util/TransactionUtil";

export default function UserInput(props: {datumDTO : RecurringPaymentDatum, setDatumDTO :  (userInput: RecurringPaymentDatum) => void, isHoskyInput : boolean}) {

    const { datumDTO, setDatumDTO, isHoskyInput } = props;
    const [currentEpochStart, setCurrentEpochStart] = React.useState<Dayjs>(dayjs());
    const [currentEpochNumber, setCurrentEpochNumber] = React.useState<number>(0);
    const [paymentIntervalEpochs, setPaymentIntervalEpochs] = React.useState<number>(1);

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [startTime, setStartTime] = React.useState<Dayjs | null>(dayjs());
    const [endTime, setEndTime] = React.useState<Dayjs | null>(null);
    const [inputLovelace, setInputLovelae] = React.useState<boolean>(true)

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setDatumDTO({...datumDTO, [name]: value});
    }

    function handleAdaInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setDatumDTO({...datumDTO, [name]: inputLovelace ? Number(value) : Number(value) * CONSTANTS.ADA_CONVERSION})
    }

    function handlePaymentInterval(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target;
        setPaymentIntervalEpochs(Number(value));
        setDatumDTO({...datumDTO, paymentIntervalHours: Number(value) * CONSTANTS.HOURS_PER_EPOCH});
        const numPayments = Math.floor(Number(datumDTO.amountToDeposit) / CONSTANTS.COSTS_PER_EPOCH);
        setEndTime(startTime!.add(numPayments * 5 * Number(value), 'days'));
    }

    useEffect(() => {
        if(isHoskyInput) {
            const numPayments = Math.floor(Number(datumDTO.amountToDeposit) / CONSTANTS.COSTS_PER_EPOCH);
            setEndTime(startTime!.add(numPayments * 5, 'days'));
            const suggestedFees = numPayments * (CONSTANTS.SUGGESTED_TX_FEE + CONSTANTS.CUT);
            setDatumDTO({...datumDTO, maxFeesLovelace: suggestedFees});
        }
    }, [datumDTO.amountToDeposit]);


    function handleEpochChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        if(name === 'startEpoch') {
            setStartTime(epochToTime(Number(value)));
            if (isHoskyInput) {
                const numPayments = Math.floor(Number(datumDTO.amountToDeposit) / CONSTANTS.COSTS_PER_EPOCH);
                setEndTime(epochToTime(Number(value)).add(numPayments * 5 * paymentIntervalEpochs, 'days'));
            }
        }
        if (name === 'endEpoch') {
            setEndTime(epochToTime(Number(value)));
        }
    }

    function handleClickOpen () {
        setDialogOpen(true);
    }

    function handleClose() {
        setDialogOpen(false);
    }

    function timeToEpoch(time: Dayjs | null) {
        if(time == null) {
            return null;
        }
        let difference = Math.floor(time!.diff(currentEpochStart, 'days') / 5);
        // need this special case because how difference is calculated for days
        // I could calculate it with minutes, it would be more precise
        if(difference == 0 && time?.isBefore(currentEpochStart)) {
            difference = -1;
        }
        return currentEpochNumber + difference;
    }

    function epochToTime(epoch: number | null) {
        return currentEpochStart.add((epoch! - currentEpochNumber) * 5, 'days');
    }

    useEffect(() => {
        fetch('api/GetCurrentEpoch').then(response => response.json()).then(data => {
            setCurrentEpochNumber(data.epoch);
            setCurrentEpochStart(dayjs.unix(Number(data.startTimestamp)));
        });
    }, []);

    useEffect(() => {
        setDatumDTO({...datumDTO, endTime: endTime ? endTime!.unix() * 1000 : undefined, startTime: startTime!.unix() * 1000});
    }, [endTime, startTime]);

    return (
        <>
            Set up a recurring Payment:
            <Stack spacing={1} style={{paddingTop: "10px"}}>
                {/*<DepositAda inputLovelace={inputLovelace} setInputLovelae={setInputLovelae} datumDTO={datumDTO} handleAdaInputChange={handleAdaInputChange} />*/}
                <Tooltip title={"The amount of ADA to deposit into the smart contract"}>
                    <TextField label={"Amount To Deposit"} type={"number"} value={inputLovelace ? datumDTO.amountToDeposit : datumDTO.amountToDeposit / CONSTANTS.ADA_CONVERSION} name={"amountToDeposit"} onChange={handleAdaInputChange}
                               slotProps={{
                                   input: {
                                       endAdornment: <Button onClick={() => setInputLovelae(!inputLovelace)}>{inputLovelace? "Lovelace" : "Ada"}</Button>,
                                   },
                               }}
                    />
                </Tooltip>
                <Tooltip title={"The maximum amount of fees ADA spent for the recurring payments"}>
                    <TextField disabled={isHoskyInput} label={"Max Fees in Lovelace"}  type={"number"} value={inputLovelace ? datumDTO.maxFeesLovelace : datumDTO.maxFeesLovelace / CONSTANTS.ADA_CONVERSION} name={"maxFeesLovelace"} onChange={handleAdaInputChange}
                               slotProps={{
                                   input: {
                                       endAdornment: <Button onClick={() => setInputLovelae(!inputLovelace)}>{inputLovelace? "Lovelace" : "Ada"}</Button>,
                                   },
                               }}
                    />
                </Tooltip>

                <Tooltip title={"The address of the payee. This address will receive the payments."}>
                    <TextField label={"Payee Address"} value={datumDTO.payAddress} name={"payAddress"} onChange={handleInputChange}/>
                </Tooltip>
                {
                    isHoskyInput ?
                        <Tooltip title={"The address of the owner of the smart contract. This address will be able to cancel the smart contract."}>
                            <TextField type={"number"} label={"Start Epoch"} value={timeToEpoch(startTime)} name={"startEpoch"} onChange={handleEpochChange}

                                       slotProps={{
                                           input: {
                                               endAdornment: <InputAdornment position="end">{startTime!.format('DD.MM.YYYY HH:mm')}</InputAdornment>,
                                           },
                                       }}
                            />
                        </Tooltip>
                        :
                        <Tooltip title={"The Time of the first payment"}>
                            <DateTimePicker label={"StartTime"} value={startTime} onChange={(newValue) => setStartTime(newValue)}/>
                        </Tooltip>
                }


                {
                    isHoskyInput ?
                        <Tooltip title={"The address of the owner of the smart contract. This address will be able to cancel the smart contract."}>
                            <TextField disabled={true} type={"number"} label={"Endtime (optional)"} value={endTime ? timeToEpoch(endTime) : ''} name={"endEpoch"} onChange={handleEpochChange}
                                       slotProps={{
                                           input: {
                                               endAdornment: <InputAdornment position="end">{endTime ? endTime!.format('DD.MM.YYYY HH:mm') : ''}</InputAdornment>,
                                           },
                                       }}
                            />
                        </Tooltip>
                        :
                        <Tooltip title={"The time of the last payment. If empty the payments will continue until there is no ADA left."}>
                            <DateTimePicker label={"Endtime (optional)"} value={endTime} onChange={(newValue) => setEndTime(newValue)}/>
                        </Tooltip>
                }


                <div>
                    {isHoskyInput ?
                            <Tooltip title={"The interval in epochs between the payments"}>
                                <TextField style={{width: "50%"}} label={"Payment Interval Epochs"} type={"number"} value={paymentIntervalEpochs} name={"paymentIntervalHours"} onChange={handlePaymentInterval} />
                            </Tooltip>
                        :
                            <Tooltip title={"The interval in hours between the payments"}>
                                <TextField style={{width: "50%"}} label={"Payment Interval Hours"} type={"number"} value={datumDTO.paymentIntervalHours} name={"paymentIntervalHours"} onChange={handleInputChange} />
                            </Tooltip>
                    }
                    <Tooltip title={"The maximum delay in hours for a payment to be made."} >
                        <TextField style={{width: "50%"}} label={"Max Payment Delay Hours"} type={"number"} value={datumDTO.maxPaymentDelayHours} name={"maxPaymentDelayHours"} onChange={handleInputChange} />
                    </Tooltip>
                </div>

                <Tooltip title={"The assets to pay each payment."}>
                    <span> {/*I need to add a span to make the tooltip work eventhough the button is disabled. Mui is listening to events, which aren't triggered on disabled buttons.*/}
                        <Button disabled={isHoskyInput} variant="outlined" startIcon={<Add/>} onClick={handleClickOpen}>
                            Add Asset
                        </Button>
                    </span>
                </Tooltip>
                <Dialog open={dialogOpen} onClose={handleClose}
                    PaperProps={{
                        component: 'form',
                        onSubmit: (event : React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries((formData as any).entries());
                            const asset : AssetAmount = {
                                policyId: formJson.policyId,
                                assetName: formJson.assetName ? formJson.assetName : "lovelace",
                                amount: inputLovelace ? Number(formJson.amount) : Number(formJson.amount) * 1000000
                            };
                            const arr = datumDTO.assetAmounts;
                            arr.push(asset);
                            setDatumDTO({...datumDTO, assetAmounts: arr});
                            handleClose();
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
                                    endAdornment: <Button onClick={() => setInputLovelae(!inputLovelace)}>{inputLovelace? "Lovelace" : "Ada"}</Button>,
                                },
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit">Add</Button>
                    </DialogActions>
                </Dialog>
                <div style={{minHeight: "100px"}}>
                    {datumDTO.assetAmounts.map((asset, index) => (
                        <Chip key={asset.policyId} disabled={isHoskyInput} variant={"outlined"} color={"primary"} style={{height: "100%", maxWidth: "fit-content"}}
                              avatar={<Avatar src={"/img/cardano-starburst-white.svg"}/>}
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
                                    const arr = datumDTO.assetAmounts;
                                    arr.splice(index, 1);
                                    setDatumDTO({...datumDTO, assetAmounts: arr});
                                }
                            }}
                        />
                    ))}
                </div>
            </Stack>
        </>
    )
}