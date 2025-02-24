import { v4 as uuidv4 } from "uuid";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { userInfoAtom } from "../atoms";

export const useAuth = () => {
  const [userId, setUserId] = useAtom(userInfoAtom);

  const userIdRef = useRef(userId);


  useEffect(() => {
    chrome?.runtime?.onMessage?.addListener(async (message) => {
      if (message.type === "auth-success") {
        setUserId({ location: "google", userId: message.authData.user.uid });
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

  const triggerGoogleAuth = () => {
    chrome.runtime.sendMessage(
      { type: "trigger-firebase-auth" },
      (response) => {
        console.log("Response from background:", response);
      }
    );
  };

  


  const triggerLocalAuth = () => {
    const uuid = uuidv4();
    setUserId({ location: "local", userId: uuid });
  };


  // TMP until solve permissions issue
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  useEffect(() => {
    setTimeout(() => {
      if (!userIdRef.current) {
        triggerLocalAuth();
      }
    }, 1000);
  }, []);
    

  return { triggerGoogleAuth, triggerLocalAuth, userId };
};
