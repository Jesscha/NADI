import { useAuth } from "../hooks/useAuth";
import { TypingModal } from "./common/TypingModal";
export const LoginModal = () => {
  const { userId, triggerGoogleAuth, triggerLocalAuth } = useAuth();

  return (
    <TypingModal
      isOpen={userId === null}
      onClose={() => {}}
      topArea={
        <>
          <h1 className="text-2xl font-bold mb-[16px]">
            Start your journey with...
          </h1>
          <p className="text-sm text-gray-500 mb-[8px]">
            <b>Connect</b> will remember you any time any where
          </p>
          <p className="text-sm text-gray-500 mb-[8px]">
            <b>Try out</b> will remember you on this browser
          </p>
          <p className="text-[12px] text-gray-400 mb-[12px]">
            (migration feature will be added later)
          </p>
        </>
      }
      firstWord="CONNECT"
      secondWord="TRY OUT"
      placeholder="CONNECT OR TRY OUT"
      firstAction={triggerGoogleAuth}
      secondAction={triggerLocalAuth}
    />
  );
};
