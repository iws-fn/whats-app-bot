import { useEffect, useState } from "react";

const events = new Map<string, EventSource>();

const base_url = "http://localhost:3004";

const subs: Record<string, string[]> = {};

export const useSSE = <T>(
  eventName: string,
  cb?: () => void,
  enabled: boolean = true
) => {
  const eventWithUrl = `${base_url}/${eventName}`;
  const [payload, setPayload] = useState<T>(null);

  const sub = () => {
    if (!enabled) {
      return;
    }

    if (subs[eventName]) {
      subs[eventName].push(eventName);
    } else {
      subs[eventName] = [eventName];
    }

    if (events.get(eventName)) {
      return;
    }

    const event = new EventSource(eventWithUrl);

    event.onmessage = (payload) => {
      if (cb) cb();
      console.log(payload);
      const data =
        typeof payload.data === "string"
          ? payload.data
          : JSON.stringify(payload.data);
      if (data) {
        setPayload(data);
      }
    };

    events.set(eventName, event);
  };

  const unSub = () => {
    const sub = subs[eventName];
    sub.pop();
    const event = events.get(eventName);
    if (sub.length === 0) {
      event?.close();
    }
  };

  useEffect(() => {
    sub();

    return () => {
      console.log("unsub");
      unSub();
    };
  }, [eventName]);

  return payload;
};
