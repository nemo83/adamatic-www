# Cardano recurring payment frontend
This repository contains the frontend for the Cardano Recurring Payment contract found [here](https://github.com/easy1staking-com/cardano-recurring-payment).

The contract aims to facilitate the execution of automated payments. The frontend is a simple web interface that allows users to create and manage the payments.
For more details regarding the contract refer to the contract or to [Easy1Staking](https://easy1staking.com).

### Why we started to build this?
Citation from the contract repository:

"I have a wallet delegated to WRFGS a charity Stake Pool. The wallet I'm using is an hardware wallet. WRFGS is a Stake Pool that is part of the Doggie Bowl and allows delegates to withdraw Hosky tokens at each epoch. In order to collect the rewards, 2 $ada must be sent from the wallet to the doggie bowl.

Remembering to send 2 $ada every 5 days is hard, and using an HW wallet is annoying so, using an automated system to perform payments is ideal.

Doggie bowl is franken address aware, so when tokens are sent back, the backend knows to send them to address that was used to register the stake key with a pool.

For this reason I could set up, with any wallet, the recurring payment bot by sending funds to a mingled address: pkh of the script combined to the stake address of the wallet I want to collect the rewards for, and the set the initial date to let's say 1 day after next epoch, and set frequency to 5 days."


The original idea was to support Hosky payments, but the contract and the frontend can be even used for other recurring payments as well.

Thus we implemented a fixed Hosky mode to support the upper case scenario and a generic mode to support other use cases.

### Todo's
- [ ] Fix tour as fields have been moved around
- [ ] Fix deleting content of row
- [ ] Add documentations including a more complet Readme

## How to run
- copy `.envExample` to `.env` and fill in the values
- run `npm run dev`

A Dev application for `Preprod` is deployed here: [Vercel Deployment](https://cardano-recurring-payment-frontend.vercel.app/)

### Credits
The idea, the contract code and the offchain code is soleley developed by [Easy1Staking](https://easy1staking.com). If you want to support him, consider delegating to his pool: EASY1.
