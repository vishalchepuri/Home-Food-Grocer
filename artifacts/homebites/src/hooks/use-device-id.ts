import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function useDeviceId() {
  const { user } = useAuth();
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    setDeviceId(user ? `user:${user.uid}` : `guest:${crypto.randomUUID()}`);
  }, [user]);

  return deviceId;
}
