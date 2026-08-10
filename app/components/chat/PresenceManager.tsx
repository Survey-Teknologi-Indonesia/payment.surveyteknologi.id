"use client";

import { useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { updateLastSeen, getCurrentUserId } from "@/app/lib/actions/chatActions";

export default function PresenceManager() {
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;
    let channel: any;

    async function initPresence() {
      const userId = await getCurrentUserId();
      if (!isMounted || !userId) return;

      // Update last seen immediately on load
      await updateLastSeen();
      if (!isMounted) return;

      // Update last seen every 1 minute
      interval = setInterval(() => {
        updateLastSeen();
      }, 60000);

      // Join global presence channel
      channel = supabase.channel("global_presence", {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const online = new Set<string>();
        for (const id in state) {
          const presences = state[id] as any[];
          if (presences.length > 0 && presences[0].user_id) {
            online.add(presences[0].user_id);
          }
        }
        window.dispatchEvent(new CustomEvent("presence_sync", { detail: online }));
      });

      channel.subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: userId,
          });
        }
      });
    }

    initPresence();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
      if (channel) supabase.removeChannel(channel);
      // Try to update one last time on unmount
      updateLastSeen();
    };
  }, []);

  return null; // Invisible component
}
