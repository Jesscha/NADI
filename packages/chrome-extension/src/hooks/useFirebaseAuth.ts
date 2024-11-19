import { useAtom } from "jotai";
import { useEffect } from "react";
import { userIdAtom } from "../atoms";

export const useFirebaseAuth = () => {
  const [userId, setUserId] = useAtom(userIdAtom);

  useEffect(() => {
    // Listen for messages from the background script
    chrome?.runtime?.onMessage?.addListener(async (message) => {
      if (message.type === "auth-success") {
        setUserId(message.authData.user.uid);
        if (message.authData.user) {
          try {
            console.log("User is authenticated. Adding document.");
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        } else {
          console.log("User is not authenticated. Cannot add document.");
        }
      }
    });
  }, [setUserId]);

  const triggerAuth = () => {
    chrome.runtime.sendMessage(
      { type: "trigger-firebase-auth" },
      (response) => {
        console.log("Response from background:", response);
      }
    );
  };

  return { triggerAuth, userId };
};
