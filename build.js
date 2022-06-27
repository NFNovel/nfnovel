const path = require("path");
const { execSync } = require("child_process");
const { cp, rm, mkdir } = require("fs/promises");


const ROOT_PATH = process.cwd();
const EVM_PATH = path.join(ROOT_PATH, "evm");
const CLIENT_PATH = path.join(ROOT_PATH, "client");

const CLIENT_EVM_PATH = path.join(CLIENT_PATH, "evm");

async function cleanClientEvm() {
  try {
    await rm(CLIENT_EVM_PATH, { recursive: true, force: true });
  } catch (error) {
    console.error("error removing client EVM dir", error);
  } finally {
    await mkdir(CLIENT_EVM_PATH);
    console.log("client EVM dir created at", CLIENT_EVM_PATH);
  }
}

async function copyEvmToClient() {
  await Promise.all(["artifacts", "deployments", "typechain"].map(async artifactDir => {

    const evmArtifactDirPath = path.join(EVM_PATH, artifactDir);
    const clientArtifactDirPath = path.join(CLIENT_EVM_PATH, artifactDir);

    await cp(evmArtifactDirPath, clientArtifactDirPath, { recursive: true });

    console.log("copied artifact dir", artifactDir);
  }));
}

async function build() {
  const evmBuildOut = execSync("npm run build:evm");
  console.log(evmBuildOut.toString("ascii"));

  console.log("cleaning client EVM dir")
  await cleanClientEvm();

  console.log("copying EVM artifacts to client dir");
  await copyEvmToClient();

  const clientBuildOut = execSync("npm run build:client");
  console.log(clientBuildOut.toString("ascii"));
}

build();