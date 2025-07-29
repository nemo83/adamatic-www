import RecurringPaymentDatum from "../lib/interfaces/RecurringPaymentDatum";
import {
    Avatar,
    Button, Checkbox, Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, FormControlLabel, FormGroup, InputAdornment,
    Stack,
    TextField, Tooltip, Box, IconButton, Divider, Typography
} from "@mui/material";
import React, { useEffect } from "react";
import { Add, Delete } from "@mui/icons-material";
import AssetAmount from "../lib/interfaces/AssetAmount";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ADAMATIC_HOST, CONSTANTS } from "../lib/util/Constants";
import { useWallet } from "@meshsdk/react";
import { Address, AddressType, NetworkId, Credential } from "@meshsdk/core-cst";
import { HoskyTemplate } from "../lib/interfaces/AdaMaticTypes";

const MAX_PULLS = 50;

export default function UserInput(props: {
    deposit: number,
    setDeposit: (deposit: number) => void,
    walletFromList: string[],
    setWalletFromList: (walletFromList: string[]) => void,
    acceptRisk: boolean,
    setAcceptRisk: (acceptRisk: boolean) => void,
    acceptFees: boolean,
    setAcceptFees: (acceptFees: boolean) => void,
    datumDTO: RecurringPaymentDatum,
    setDatumDTO: (userInput: RecurringPaymentDatum) => void,
    isDelegatedToHosky: boolean,
    setIsDelegatedToHosky: (isDelegatedHosky: boolean) => void,
    isHoskyInput: boolean
}) {

    const { deposit, setDeposit, walletFromList, setWalletFromList, acceptRisk, setAcceptRisk, acceptFees, setAcceptFees, datumDTO, setDatumDTO, isDelegatedToHosky, setIsDelegatedToHosky, isHoskyInput } = props;

    const [dialogOpen, setDialogOpen] = React.useState(false);

    const { wallet, connected } = useWallet();

    const [owner, setOwner] = React.useState<string>("");
    const [payee, setPayee] = React.useState<string>("");
    const [maxFeesLovelace, setMaxFeesLovelace] = React.useState<number>(1_000_000);
    const [startTime, setStartTime] = React.useState<Dayjs | null>(dayjs());
    const [endTime, setEndTime] = React.useState<Dayjs | null>(null);
    const [paymentIntervalEpochs, setPaymentIntervalEpochs] = React.useState<number>(1);
    const [paymentIntervalHours, setPaymentIntervalHours] = React.useState<number>(1);
    const [inputLovelace, setInputLovelace] = React.useState<boolean>(false)

    const [epochStart, setEpochStart] = React.useState<number>(0);
    const [epochEnd, setEpochEnd] = React.useState<number>(0);

    const [numPulls, setNumPulls] = React.useState<number>(1);

    const [lockEndTime, setLockEndTime] = React.useState<boolean>(false);

    // Track delegation status for each wallet address
    const [delegationStatus, setDelegationStatus] = React.useState<{ [address: string]: boolean }>({});

    // Track validation status for each wallet address
    const [validationStatus, setValidationStatus] = React.useState<{ [address: string]: { isValid: boolean, error: string } }>({});

    // Validate Cardano address format
    const validateCardanoAddress = (address: string): { isValid: boolean, error: string } => {

        if (!address || address.trim() === "") {
            return { isValid: false, error: "" }; // Empty is not an error, just not valid
        }

        try {
            // Use MeshSDK to validate the address format
            const parsedAddress = Address.fromBech32(address.trim());
            const addressType = parsedAddress.getType();

            // Check if it's a valid base address or enterprise address (common for staking)
            if (addressType === AddressType.BasePaymentKeyStakeKey ||
                addressType === AddressType.BasePaymentScriptStakeKey ||
                addressType === AddressType.BasePaymentKeyStakeScript ||
                addressType === AddressType.BasePaymentScriptStakeScript ||
                addressType === AddressType.RewardKey ||
                addressType === AddressType.RewardScript) {
                return { isValid: true, error: "" };
            } else {
                return { isValid: false, error: "Unsupported address type" };
            }
        } catch (error) {
            return { isValid: false, error: "Invalid Cardano address format" };
        }
    };

    // Initialize with at least one empty address field
    useEffect(() => {
        if (walletFromList.length === 0) {
            setWalletFromList([""]);
        }
    }, []);

    useEffect(() => {
        // Check validation and delegation status for all wallet addresses
        const checkDelegationForAllAddresses = async () => {
            const newDelegationStatus: { [address: string]: boolean } = {};
            const newValidationStatus: { [address: string]: { isValid: boolean, error: string } } = {};
            let allDelegated = true;
            let allValid = true;

            for (const address of walletFromList) {
                console.log('checking validation and delegation for: ' + address);

                // First validate the address format
                const validation = validateCardanoAddress(address);
                newValidationStatus[address] = validation;

                if (!validation.isValid && address !== "") {
                    allValid = false;
                    allDelegated = false;
                    newDelegationStatus[address] = false;
                    continue;
                }

                // Only check delegation if address is valid and not empty
                if (address && validation.isValid) {
                    try {
                        const response = await fetch(ADAMATIC_HOST + `/hosky/${address}/is_delegated_to_hosky`);
                        const isDelegated = await response.json();
                        newDelegationStatus[address] = isDelegated;
                        if (!isDelegated) {
                            allDelegated = false;
                        }
                    } catch (error) {
                        console.error(`Error checking delegation for ${address}:`, error);
                        newDelegationStatus[address] = false;
                        allDelegated = false;
                    }
                } else {
                    newDelegationStatus[address] = false;
                    if (address !== "") {
                        allDelegated = false;
                    }
                }
            }

            setValidationStatus(newValidationStatus);
            setDelegationStatus(newDelegationStatus);
            setIsDelegatedToHosky(allDelegated && allValid && walletFromList.length > 0 && walletFromList.some(addr => addr !== ""));
        };

        if (walletFromList.length > 0) {
            checkDelegationForAllAddresses();
        }
    }, [walletFromList, setIsDelegatedToHosky])

    useEffect(() => {
        if (connected) {
            wallet.getUsedAddresses().then((addresses) => {
                const address = Address.fromBech32(addresses[0])
                const userWallet = address.asBase()!.toAddress().toBech32().toString();
                setOwner(userWallet);
                if (walletFromList.length > 0 && walletFromList[0] === "") {
                    const newWalletFromList = [userWallet, ...walletFromList.slice(1)];
                    setWalletFromList(newWalletFromList);
                }
            });
        }
    }, [connected])

    useEffect(() => {
        if (isHoskyInput) {
            fetch(ADAMATIC_HOST + '/recurring_payments/template/hosky')
                .then(response => response.json())
                .then((data: HoskyTemplate) => updateForm(data));
        }
    }, [isHoskyInput]);

    const updateStuff = async (maxFees: number, epochStart: number, numPulls: number, epochFrequency: number) => {

        console.log('maxFees: ' + maxFees);

        if (maxFees == null || isNaN(maxFees)
            || epochStart == null || isNaN(epochStart)
            || numPulls == null || isNaN(numPulls)
            || epochFrequency == null || isNaN(epochFrequency)) {
            return;
        }

        let baseRequest = {
            max_fees: maxFees.toString(),
            epoch_start: epochStart.toString(),
            num_pulls: numPulls.toString(),
            epoch_frequency: epochFrequency.toString()
        };

        console.log('baseRequest: ' + JSON.stringify(baseRequest));

        if (isHoskyInput) {
            fetch(ADAMATIC_HOST + '/recurring_payments/template/hosky?' + new URLSearchParams(baseRequest).toString())
                .then(response => response.json())
                .then((data: HoskyTemplate) => updateForm(data));
        }
    }

    const updateForm = (data: HoskyTemplate) => {
        setEpochStart(data.epoch_start);
        setEpochEnd(data.epoch_end);

        const numPulls = Math.floor((data.epoch_end - data.epoch_start) / data.epoch_frequency);
        setNumPulls(numPulls)

        setDeposit(data.suggested_deposit[0].amount);
        setPayee(data.payee_address);
        setStartTime(dayjs(data.start_time_timestamp));
        setEndTime(dayjs(data.end_time_timestamp));

        setPaymentIntervalHours(data.payment_interval_hours);
        setPaymentIntervalEpochs(data.epoch_frequency);

        setMaxFeesLovelace(data.max_fee_lovelaces);
        setLockEndTime(data.lock_end_time);
    }

    useEffect(() => {

        const newDatumDTO = {
            ...datumDTO,
            ownerPaymentPubKeyHash: owner ? Address.fromBech32(owner).asBase()!.getPaymentCredential().hash.toString() : "",
            amountToSend: [{ policyId: "", assetName: "", amount: 2000000 }],
            payee,
            startTime: startTime!.valueOf(),
            endTime: lockEndTime ? endTime?.valueOf() : undefined,
            paymentIntervalHours: paymentIntervalHours,
            maxFeesLovelace: maxFeesLovelace,
        }
        setDatumDTO(newDatumDTO);

    }, [owner, payee, startTime, endTime, paymentIntervalHours, maxFeesLovelace])

    const addWalletAddress = () => {
        console.log('walletFromList: ' + JSON.stringify(walletFromList));
        const newList = [...walletFromList, ""];
        console.log('newList: ' + JSON.stringify(newList));
        setWalletFromList(newList);
    };

    const removeWalletAddress = (index: number) => {
        if (walletFromList.length > 1) {
            const newList = walletFromList.filter((_, i) => i !== index);
            setWalletFromList(newList);
        }
    };

    const updateWalletAddress = (index: number, newAddress: string) => {
        const currentList = walletFromList.length > 0 ? walletFromList : [""];
        const newList = [...currentList];

        // if (index == 0) {
            // newList[index] = newAddress || (owner || "");
        // } else {
            newList[index] = newAddress || "";
        // }

        setWalletFromList(newList);
    };

    return (
        <Stack spacing={1} style={{ paddingTop: "10px" }}>
            {/* Multiple Wallet Addresses Section */}
            <Box>
                <Tooltip title="Payment or Staking addresses delegated to Hosky Pools for collecting rewards">
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Payment or Staking addresses delegated to Hosky Pools
                    </Typography>
                </Tooltip>

                {/* Render at least one address field, even if walletFromList is empty */}
                {(walletFromList.length > 0 ? walletFromList : [""]).map((address, index) => {
                    const validation = validationStatus[address];
                    const isDelegated = delegationStatus[address];

                    // Determine error state and message
                    let hasError = false;
                    let errorMessage = "";

                    if (address !== "") {
                        if (validation && !validation.isValid) {
                            hasError = true;
                            errorMessage = validation.error;
                        } else if (validation && validation.isValid && !isDelegated) {
                            hasError = true;
                            errorMessage = "Address not delegated to any Hosky Pool";
                        }
                    }

                    return (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <TextField
                                required={true}
                                fullWidth
                                label={`Address ${index + 1}`}
                                value={address}
                                name={`addressFrom-${index}`}
                                onChange={(e) => updateWalletAddress(index, e.target.value)}
                                error={hasError}
                                helperText={hasError ? errorMessage : null}
                                data-tut={index === 0 ? "step-1" : undefined}
                                sx={{ flex: 1 }}
                            />
                            {walletFromList.length > 1 && (
                                <Tooltip title="Remove this address">
                                    <IconButton
                                        onClick={() => removeWalletAddress(index)}
                                        size="small"
                                        sx={{
                                            color: 'error.main',
                                            '&:hover': { backgroundColor: 'error.light', color: 'white' }
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    );
                })}

                {/* Add Address Section with Divider */}
                <Box sx={{ mt: 2, mb: 2 }}>
                    <Divider>
                        <Tooltip title="Add another address">
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    cursor: 'pointer',
                                    px: 2,
                                    py: 1,
                                    borderRadius: '16px',
                                    transition: 'all 0.2s ease-in-out',
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                        transform: 'scale(1.02)'
                                    }
                                }}
                                onClick={addWalletAddress}
                            >
                                <IconButton
                                    size="small"
                                    sx={{
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        width: 24,
                                        height: 24,
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                            transform: 'scale(1.1)'
                                        }
                                    }}
                                >
                                    <Add fontSize="small" />
                                </IconButton>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Add Address
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Divider>
                </Box>
            </Box>
            <Tooltip title={"Max amount of fees the user is willing to pay to cover for AdaMatic and Cardano Transaction fees."}>
                <TextField label={"Max Fees"} type={"number"} value={inputLovelace ? maxFeesLovelace : maxFeesLovelace / CONSTANTS.ADA_CONVERSION} name={"maxFeesLovelace"}
                    slotProps={{
                        input: {
                            endAdornment: <Button onClick={() => setInputLovelace(!inputLovelace)}>{inputLovelace ? "Lovelace" : "Ada"}</Button>,
                        },
                        htmlInput: { min: inputLovelace ? 200_000 : 0.2, max: inputLovelace ? 1_500_000 : 1.5, step: inputLovelace ? 100000 : 0.1 }
                    }}
                    data-tut="step-3"
                    onChange={(event) => { updateStuff(inputLovelace ? Number(event.target.value) : Number(event.target.value) * CONSTANTS.ADA_CONVERSION, epochStart, numPulls, paymentIntervalEpochs) }}
                />
            </Tooltip>

            {
                isHoskyInput ?
                    <Tooltip title={"Epoch of the first rewards being pulled."}>
                        <TextField type={"number"} label={"First Epoch"} value={epochStart} name={"startEpoch"} onChange={(event) => updateStuff(maxFeesLovelace, parseInt(event.target.value), Math.floor((epochEnd - epochStart) / paymentIntervalEpochs), paymentIntervalEpochs)}
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
                        <TextField disabled={isHoskyInput} type={"number"} label={"Last Epoch (optional)"} value={epochEnd} name={"endEpoch"}
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
                            slotProps={{
                                input: {
                                    endAdornment: <Button onClick={() => { updateStuff(maxFeesLovelace, epochStart, MAX_PULLS, paymentIntervalEpochs) }}>MAX</Button>,
                                },
                                htmlInput: { min: 1, max: MAX_PULLS }
                            }}
                            value={numPulls}
                            name={"numPulls"}
                            onChange={(event) => { updateStuff(maxFeesLovelace, epochStart, parseInt(event.target.value), paymentIntervalEpochs) }}
                            data-tut="step-7"
                        />
                    </Tooltip>


                    : <Tooltip title={"The maximum delay in hours for a payment to be made."} >
                        <TextField style={{ width: "50%" }} label={"Max Payment Delay Hours"} type={"number"} value={datumDTO.maxPaymentDelayHours} name={"maxPaymentDelayHours"} />
                    </Tooltip>
                }

                <Tooltip title={"The interval in epochs between the payments"}>
                    <TextField style={{ width: "50%" }} label={"Payment Interval Epochs"} type={"number"} value={paymentIntervalEpochs} name={"paymentIntervalHours"}
                        onChange={(event) => { updateStuff(maxFeesLovelace, epochStart, numPulls, parseInt(event.target.value)) }}
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