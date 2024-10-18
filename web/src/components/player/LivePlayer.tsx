import { useCameraActivity } from "@/hooks/use-camera-activity";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { CameraConfig } from "@/types/frigateConfig";
import {
  LivePlayerError,
  LivePlayerMode,
  VideoResolutionType,
} from "@/types/live";
import { getIconForLabel } from "@/utils/iconUtil";
import { capitalizeFirstLetter } from "@/utils/stringUtil";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import {
  DetailedHTMLProps,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GiSpeaker, GiSpeakerOff } from "react-icons/gi";
import { TbExclamationCircle } from "react-icons/tb";
import AutoUpdatingCameraImage from "../camera/AutoUpdatingCameraImage";
import CameraFeatureToggle from "../dynamic/CameraFeatureToggle";
import ActivityIndicator from "../indicators/activity-indicator";
import Chip from "../indicators/Chip";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import JSMpegPlayer from "./JSMpegPlayer";
import MSEPlayer from "./MsePlayer";
import WebRtcPlayer from "./WebRTCPlayer";

type LivePlayerProps = {
  cameraRef?: (ref: HTMLDivElement | null) => void;
  containerRef?: React.MutableRefObject<HTMLDivElement | null>;
  className?: string;
  style?: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  cameraConfig: CameraConfig;
  preferredLiveMode: LivePlayerMode;
  showStillWithoutActivity?: boolean;
  windowVisible?: boolean;
  playAudio?: boolean;
  micEnabled?: boolean; // only webrtc supports mic
  iOSCompatFullScreen?: boolean;
  pip?: boolean;
  autoLive?: boolean;
  overrideLocalAudio?: boolean;
  onClick?: () => void;
  setFullResolution?: React.Dispatch<React.SetStateAction<VideoResolutionType>>;
  onError?: (error: LivePlayerError) => void;
  onResetLiveMode?: () => void;
};

export default function LivePlayer({
  cameraRef = undefined,
  containerRef,
  className,
  style,
  cameraConfig,
  preferredLiveMode,
  showStillWithoutActivity = true,
  windowVisible = true,
  playAudio = true,
  micEnabled = false,
  iOSCompatFullScreen = false,
  pip,
  autoLive = true,
  overrideLocalAudio = false,
  onClick,
  setFullResolution,
  onError,
  onResetLiveMode,
}: LivePlayerProps) {
  const internalContainerRef = useRef<HTMLDivElement | null>(null);
  // camera activity

  const { activeMotion, activeTracking, objects, offline } =
    useCameraActivity(cameraConfig);

  const LOCAL_AUDIO_KEY = `${cameraConfig.name}_audio`;
  const [localAudio, setLocalAudio] = useLocalStorage(
    LOCAL_AUDIO_KEY,
    playAudio,
  );

  const audio = useMemo(
    () => (overrideLocalAudio ? playAudio : localAudio),
    [overrideLocalAudio, playAudio, localAudio],
  );

  // const cameraActive = useMemo(
  //   () =>
  //     !showStillWithoutActivity ||
  //     (windowVisible && (activeMotion || activeTracking)),
  //   [activeMotion, activeTracking, showStillWithoutActivity, windowVisible],
  // );
  const cameraActive = true;

  // camera live state

  const [liveReady, setLiveReady] = useState(false);

  const liveReadyRef = useRef(liveReady);
  const cameraActiveRef = useRef(cameraActive);

  // Hack to mitigate browser not allowing audio to autoplay
  // Reloads the audio on browser interaction
  // YouTube doesn't have to do this bullshit because it's whitelisted :^)
  useEffect(() => {
    const listener = () => {
      setTimeout(() => {
        const v = localAudio;
        setLocalAudio(!v);
        setTimeout(() => setLocalAudio(v), 1);
      }, 100);

      document.removeEventListener("mousedown", listener);
    };

    document.addEventListener("mousedown", listener);

    return () => document.removeEventListener("mousedown", listener);
  }, []);

  useEffect(() => {
    liveReadyRef.current = liveReady;
    cameraActiveRef.current = cameraActive;
  }, [liveReady, cameraActive]);

  useEffect(() => {
    if (!autoLive || !liveReady) {
      return;
    }

    if (!cameraActive) {
      const timer = setTimeout(() => {
        if (liveReadyRef.current && !cameraActiveRef.current) {
          setLiveReady(false);
          onResetLiveMode?.();
        }
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
    // live mode won't change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLive, cameraActive, liveReady]);

  // camera still state

  const stillReloadInterval = useMemo(() => {
    if (!windowVisible || offline || !showStillWithoutActivity) {
      return -1; // no reason to update the image when the window is not visible
    }

    if (liveReady && !cameraActive) {
      return 300;
    }

    if (liveReady) {
      return 60000;
    }

    if (activeMotion || activeTracking) {
      if (autoLive) {
        return 200;
      } else {
        return 59000;
      }
    }

    return 30000;
  }, [
    autoLive,
    showStillWithoutActivity,
    liveReady,
    activeMotion,
    activeTracking,
    offline,
    windowVisible,
    cameraActive,
  ]);

  useEffect(() => {
    setLiveReady(false);
  }, [preferredLiveMode]);

  const playerIsPlaying = useCallback(() => {
    setLiveReady(true);
  }, []);

  if (!cameraConfig) {
    return <ActivityIndicator />;
  }

  let player;
  if (!autoLive) {
    player = null;
  } else if (preferredLiveMode == "webrtc") {
    player = (
      <WebRtcPlayer
        className={`size-full rounded-lg md:rounded-2xl ${liveReady ? "" : "hidden"}`}
        camera={cameraConfig.live.stream_name}
        playbackEnabled={cameraActive || liveReady}
        audioEnabled={audio}
        microphoneEnabled={micEnabled}
        iOSCompatFullScreen={iOSCompatFullScreen}
        onPlaying={playerIsPlaying}
        pip={pip}
        onError={onError}
      />
    );
  } else if (preferredLiveMode == "mse") {
    if ("MediaSource" in window || "ManagedMediaSource" in window) {
      player = (
        <MSEPlayer
          className={`size-full rounded-lg md:rounded-2xl ${liveReady ? "" : "hidden"}`}
          camera={cameraConfig.live.stream_name}
          playbackEnabled={cameraActive || liveReady}
          audioEnabled={audio}
          onPlaying={playerIsPlaying}
          pip={pip}
          setFullResolution={setFullResolution}
          onError={onError}
        />
      );
    } else {
      player = (
        <div className="w-5xl text-center text-sm">
          iOS 17.1 or greater is required for this live stream type.
        </div>
      );
    }
  } else if (preferredLiveMode == "jsmpeg") {
    if (cameraActive || !showStillWithoutActivity || liveReady) {
      player = (
        <JSMpegPlayer
          className="flex justify-center overflow-hidden rounded-lg md:rounded-2xl"
          camera={cameraConfig.name}
          width={cameraConfig.detect.width}
          height={cameraConfig.detect.height}
          playbackEnabled={
            cameraActive || !showStillWithoutActivity || liveReady
          }
          containerRef={containerRef ?? internalContainerRef}
          onPlaying={playerIsPlaying}
        />
      );
    } else {
      player = null;
    }
  } else {
    player = <ActivityIndicator />;
  }

  return (
    <div
      ref={cameraRef ?? internalContainerRef}
      data-camera={cameraConfig.name}
      className={cn(
        "relative flex w-full cursor-pointer justify-center outline",
        activeTracking &&
          ((showStillWithoutActivity && !liveReady) || liveReady)
          ? "outline-3 rounded-lg shadow-severity_alert outline-severity_alert md:rounded-2xl"
          : "outline-0 outline-background",
        "transition-all duration-500",
        className,
      )}
      onClick={onClick}
      style={style}
    >
      {((showStillWithoutActivity && !liveReady) || liveReady) && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[30%] w-full rounded-lg bg-gradient-to-b from-black/20 to-transparent md:rounded-2xl"></div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[10%] w-full rounded-lg bg-gradient-to-t from-black/20 to-transparent md:rounded-2xl"></div>
        </>
      )}
      {player}
      {!offline && !showStillWithoutActivity && !liveReady && (
        <ActivityIndicator />
      )}

      {((showStillWithoutActivity && !liveReady) || liveReady) &&
        objects.length > 0 && (
          <div className="absolute left-0 top-2 z-40">
            <Tooltip>
              <div className="flex">
                <TooltipTrigger asChild>
                  <div className="mx-3 pb-1 text-sm text-white">
                    <Chip
                      className={`z-0 flex items-start justify-between space-x-1 bg-gray-500 bg-gradient-to-br from-gray-400 to-gray-500`}
                    >
                      {[
                        ...new Set([
                          ...(objects || []).map(({ label }) => label),
                        ]),
                      ]
                        .map((label) => {
                          return getIconForLabel(label, "size-3 text-white");
                        })
                        .sort()}
                    </Chip>
                  </div>
                </TooltipTrigger>
              </div>
              <TooltipPortal>
                <TooltipContent className="capitalize">
                  {[
                    ...new Set([
                      ...(objects || []).map(({ label, sub_label }) =>
                        label.endsWith("verified") ? sub_label : label,
                      ),
                    ]),
                  ]
                    .filter((label) => label?.includes("-verified") == false)
                    .map((label) => capitalizeFirstLetter(label))
                    .sort()
                    .join(", ")
                    .replaceAll("-verified", "")}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </div>
        )}

      <div
        className={cn(
          "absolute inset-0 w-full",
          showStillWithoutActivity && !liveReady ? "visible" : "invisible",
        )}
      >
        <AutoUpdatingCameraImage
          className="size-full"
          camera={cameraConfig.name}
          showFps={false}
          reloadInterval={stillReloadInterval}
          cameraClasses="relative size-full flex justify-center"
        />
      </div>

      {offline && !showStillWithoutActivity && (
        <div className="flex size-full flex-col items-center">
          <p className="mb-5">
            {capitalizeFirstLetter(cameraConfig.name)} is offline
          </p>
          <TbExclamationCircle className="mb-3 size-10" />
          <p>No frames have been received, check error logs</p>
        </div>
      )}

      <div className="absolute right-2 top-2">
        {!overrideLocalAudio && (
          <CameraFeatureToggle
            className="p-2 md:p-0"
            variant="ghost"
            Icon={audio ? GiSpeaker : GiSpeakerOff}
            isActive={audio ?? false}
            title={`${audio ? "Disable" : "Enable"} Camera Audio`}
            onClick={(ev) => {
              ev?.stopPropagation();
              setLocalAudio(!audio);
            }}
          />
        )}
        {offline && showStillWithoutActivity && (
          <Chip
            className={`z-0 flex items-start justify-between space-x-1 bg-gray-500 bg-gradient-to-br from-gray-400 to-gray-500 text-xs capitalize`}
          >
            {cameraConfig.name.replaceAll("_", " ")}
          </Chip>
        )}
      </div>
    </div>
  );
}
