"use client";

import { Center, Text } from "@chakra-ui/react";
import { APIProvider } from "@vis.gl/react-google-maps";

const GoogleMapsProvider = ({ children }: { children: React.ReactNode }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Center w={"100%"} h="100%">
        <Text color="red.500" fontSize="xl">
          Google Maps API key is not provided.
        </Text>
      </Center>
    );
  }
  return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
};

export default GoogleMapsProvider;
