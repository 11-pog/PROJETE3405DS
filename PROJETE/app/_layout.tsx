import { Stack } from "expo-router";
import React from "react";
import { useOnlineStatus } from "./hooks/useOnlineStatus";

export default function RootLayout() {
  useOnlineStatus();
  return <Stack />;
}
