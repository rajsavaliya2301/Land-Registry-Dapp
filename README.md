# Land Registry DApp (Solidity + Truffle + Ganache)

This project implements a simple land registry system on Ethereum using:
- Solidity smart contract
- Truffle for compile, test, deploy
- Ganache local blockchain
- Web UI with HTML, CSS, JavaScript, Web3.js

## Features

- Register a land record (ID, location, area)
- Transfer ownership of registered land
- Verify land ownership by address
- Fetch one land record details
- View all registered lands in a table

## Project Structure

- `contracts/LandRegistry.sol`: Main smart contract
- `migrations/`: Truffle deployment scripts
- `test/landRegistry.test.js`: Contract unit tests
- `client/index.html`: DApp UI
- `client/styles.css`: UI styles
- `client/app.js`: Web3 and contract interaction logic

## Prerequisites

- Node.js 18+
- Ganache (GUI or CLI)
- MetaMask browser extension

## Install

```bash
npm install
```

## Start Ganache

Use Ganache GUI with:
- RPC Server: `http://127.0.0.1:7545`
- Network ID: `5777`

## Compile Contract

```bash
npm run compile
```

## Deploy to Ganache

```bash
npm run migrate
```

After deployment, Truffle generates `build/contracts/LandRegistry.json` with ABI and network address used by the web app.

## Run Tests

```bash
npm test
```

## Run Web UI

```bash
npm run dev
```

Then open the shown local URL (Lite Server starts with `client/index.html`).

## MetaMask Setup

1. Add Ganache network in MetaMask:
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337` or `5777` (match your Ganache workspace)
2. Import one Ganache account using its private key.
3. Click **Connect Wallet** in the UI.

## Usage Flow

1. Connect Wallet
2. Register a land record
3. Transfer ownership to another address
4. Verify ownership
5. Refresh and view all lands

## Notes

- Only the current owner can transfer a land record.
- Duplicate land IDs are not allowed.
- If UI shows contract not deployed on current network, re-run migrate on the same Ganache network MetaMask is connected to.
