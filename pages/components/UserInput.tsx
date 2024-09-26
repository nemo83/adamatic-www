import DatumDTO from "../interfaces/DatumDTO";
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
import AssetAmount from "../interfaces/AssetAmount";
import {DateTimePicker} from "@mui/x-date-pickers";
import dayjs, {Dayjs} from "dayjs";

export default function UserInput(props: {datumDTO : DatumDTO, setDatumDTO :  (userInput: DatumDTO) => void}) {

    const { datumDTO, setDatumDTO } = props;
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [assetAmounts, setAssetAmounts] = React.useState<AssetAmount[]>([]);
    const [startTime, setStartTime] = React.useState<Dayjs | null>(dayjs());
    const [endTime, setEndTime] = React.useState<Dayjs | null>(null);

    useEffect(() => {
        setAssetAmounts(datumDTO.assetAmounts)
    }, [datumDTO]);

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setDatumDTO({...datumDTO, [name]: value});
    }

    function handleClickOpen () {
        setDialogOpen(true);
    }

    function handleClose() {
        setDialogOpen(false);
    }

    useEffect(() => {
        setDatumDTO({...datumDTO, startTime: startTime!.unix() * 1000});
    }, [startTime]);

    useEffect(() => {
        setDatumDTO({...datumDTO, endTime: endTime ? endTime!.unix() * 1000 : undefined});
    }, [endTime]);




    return (
        <>
            Set up a recurring Payment:
            <Stack spacing={1} style={{paddingTop: "10px"}}>
                <Tooltip title={"The amount of ADA to deposit into the smart contract"}>
                <TextField label={"Amount To Deposit"} type={"number"} value={datumDTO.amountToDeposit} name={"amountToDeposit"} onChange={handleInputChange}/>
                </Tooltip>
                <Tooltip title={"The maximum amount of fees ADA spent for the recurring payments"}>
                    <TextField label={"Max Fees in Lovelace"}  type={"number"} value={datumDTO.maxFeesLovelace} name={"maxFeesLovelace"} onChange={handleInputChange}/>
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
                    <Button variant="outlined" startIcon={<Add/>} onClick={handleClickOpen}>
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
                                amount: formJson.amount
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
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit">Add</Button>
                    </DialogActions>
                </Dialog>
                <div style={{minHeight: "100px"}}>
                    {datumDTO.assetAmounts.map((asset, index) => (
                        <Chip variant={"outlined"} color={"primary"} style={{height: "100%", maxWidth: "fit-content"}}
                              avatar={<Avatar src={"/img/cardano-starburst-white.svg"}/>}
                              label={(
                                  <section >
                                      <div className={"assetChip"}>{asset.assetName}</div>
                                      <div className={"assetChip"}>{asset.amount / 1000000} ADA</div>
                                  </section>
                              )}
                            onDelete={() => {
                                const arr = datumDTO.assetAmounts;
                                arr.splice(index, 1);
                                setDatumDTO({...datumDTO, assetAmounts: arr});
                            }}
                        />
                    ))}
                </div>
            </Stack>
        </>
    )
}