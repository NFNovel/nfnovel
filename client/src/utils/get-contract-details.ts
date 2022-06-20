import NFNovelDeployment from "@evm/deployments/NFNovel.json";
import NFNovelContract from "@evm/contracts/NFNovel/NFNovel.sol/NFNovel.json";

const getContractDetails = () => {
  const NODE_ENV = process.env.NODE_ENV;

  const deployment = (NFNovelDeployment as any)[NODE_ENV];

  return {
    deployment,
    interface: NFNovelContract.abi,
  };
};

export default getContractDetails;
