import RecurringPaymentDatum from "../lib/interfaces/RecurringPaymentDatum";
import {
    Avatar,
    Button, Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField, Tooltip
} from "@mui/material";
import React, {useEffect} from "react";
import {Add} from "@mui/icons-material";
import AssetAmount from "../lib/interfaces/AssetAmount";
import {DateTimePicker} from "@mui/x-date-pickers";
import dayjs, {Dayjs} from "dayjs";
import {CONSTANTS} from "../lib/util/Constants";

export default function UserInput(props: {datumDTO : RecurringPaymentDatum, setDatumDTO :  (userInput: RecurringPaymentDatum) => void, isHoskyInput : boolean}) {

    const { datumDTO, setDatumDTO, isHoskyInput } = props;

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

    function handleClickOpen () {
        setDialogOpen(true);
    }

    function handleClose() {
        setDialogOpen(false);
    }

    useEffect(() => {
        setDatumDTO({...datumDTO, endTime: endTime ? endTime!.unix() * 1000 : undefined, startTime: startTime!.unix() * 1000});
    }, [endTime, startTime]);

    return (
        <>
            Set up a recurring Payment:
            <Stack spacing={1} style={{paddingTop: "10px"}}>
                {/*<DepositAda inputLovelace={inputLovelace} setInputLovelae={setInputLovelae} datumDTO={datumDTO} handleAdaInputChange={handleAdaInputChange} />*/}
                <Tooltip title={"The amount of ADA to deposit into the smart contract"}>
                    <TextField disabled={isHoskyInput} label={"Amount To Deposit"} type={"number"} value={inputLovelace ? datumDTO.amountToDeposit : datumDTO.amountToDeposit / CONSTANTS.ADA_CONVERSION} name={"amountToDeposit"} onChange={handleAdaInputChange}
                               slotProps={{
                                   input: {
                                       endAdornment: <Button onClick={() => setInputLovelae(!inputLovelace)}>{inputLovelace? "Lovelace" : "Ada"}</Button>,
                                   },
                               }}
                    />
                </Tooltip>
                <Tooltip title={"The maximum amount of fees ADA spent for the recurring payments"}>
                    <TextField label={"Max Fees in Lovelace"}  type={"number"} value={inputLovelace ? datumDTO.maxFeesLovelace : datumDTO.maxFeesLovelace / CONSTANTS.ADA_CONVERSION} name={"maxFeesLovelace"} onChange={handleAdaInputChange}
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

                <Tooltip title={"The Time of the first payment"}>
                    <DateTimePicker label={"StartTime"} value={startTime} onChange={(newValue) => setStartTime(newValue)}/>
                </Tooltip>


                <Tooltip title={"The time of the last payment. If empty the payments will continue until there is no ADA left."}>
                    <DateTimePicker label={"Endtime (optional)"} value={endTime} onChange={(newValue) => setEndTime(newValue)}/>
                </Tooltip>

                <div>
                    <Tooltip title={"The interval in hours between the payments"}>
                        <TextField style={{width: "50%"}} label={"Payment Interval Hours"} type={"number"} value={datumDTO.paymentIntervalHours} name={"paymentIntervalHours"} onChange={handleInputChange} />
                    </Tooltip>
                    <Tooltip title={"The maximum delay in hours for a payment to be made."} >
                        <TextField style={{width: "50%"}} label={"Max Payment Delay Hours"} type={"number"} value={datumDTO.maxPaymentDelayHours} name={"maxPaymentDelayHours"} onChange={handleInputChange} />
                    </Tooltip>
                </div>

                <Tooltip title={"The assets to pay each payment."}>
                    <Button disabled={isHoskyInput} variant="outlined" startIcon={<Add/>} onClick={handleClickOpen}>
                        Add Asset
                    </Button>
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