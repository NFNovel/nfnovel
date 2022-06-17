import { Text, ThemingProps, Center, Badge } from "@chakra-ui/react";

import useIpfs, { UseIpfsOutput } from "src/hooks/use-ipfs";

const ipfsStatusColors: {
  [key in UseIpfsOutput["status"]]: {
    colorScheme: ThemingProps<"Badge">["colorScheme"];
    // icon: React.ReactNode;
  };
} = {
  error: {
    colorScheme: "red",
  },
  connected: {
    colorScheme: "green",
  },
  connecting: {
    colorScheme: "yellow",
  },
};

const IPFSStatus = () => {
  const { status } = useIpfs();

  const statusDisplay = ipfsStatusColors[status];

  return (
    <Center>
      <Text fontWeight="bold">
        IPFS
        <Badge
          ml={2}
          variant="subtle"
          colorScheme={statusDisplay.colorScheme}
        >
          {status.toUpperCase()}
        </Badge>
      </Text>
    </Center>
  );
};

export default IPFSStatus;
