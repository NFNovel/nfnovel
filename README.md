# NFNovel MVP

## structure

monorepo including the client (frontend and API) and evm components

```sh
<project>/
  client/ <-- [web2] client / api using next.js
  evm/ <-- [web3] contract code / tests / tasks using hardhat and ethers.js
  package.json <-- scripts to control each component or together as a system
```

## usage

### setup

in `.vscode/` there are some recommended workspace extensions and settings. you can install those to get the best experience working with the codebase:

1. on the sidebar open the extensions panel (4 squares symbol)
2. search for `@recommended`
3. install all of them
4. find `prettier-eslint` in the list, click the extension and select `Switch to Pre-Release Version`
5. install dependencies (from the top level) run `npm install` (this will install the monorepo, client and evm deps)
6. close and reopen VSCode (you must do this or some extensions wont work)

### client

the client `client/tsconfig.json` has aliases set up for importing:

- `@styles/*`: any CSS in the `client/styles/` dir
- `@contracts/*`: any contract ABI in `evm/artifacts/contracts/<ContractName.sol>/<ContractName>.json`

> example

```ts
// global
import "@styles/globals.css";
// CSS module
import styles from "@styles/Home.module.css";
// contract ABI
import GreeterABI from "@contracts/Greeter.sol/Greeter.json";
```


### scripts

the top-level `package.json` contains scripts to run the `client/` and `evm/` scripts individually or as a system

- individual: `npm run client: -- <script>` or `npm run evm: -- <script>`
- together: top-level scripts (below)

> run these from the project root

1. install (installs deps for monorepo, client and evm components)

```sh
npm install
```

2. run dev mode (compiles evm and runs next.js dev mode)
- starts a local hardhat node
- compiles and deploys the contracts (`evm/scripts/deploy.ts`) and stores their deployment records in `evm/deployments/<Contract>.json`
- starts the client next.js dev server

```sh
npm run dev
```

3. compile both for prod

```sh
npm run build
```

4. run tests for evm and client

```sh
npm test
```