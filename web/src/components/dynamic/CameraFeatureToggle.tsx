import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import ActivityIndicator from "../indicators/activity-indicator";
import { MouseEvent } from "react";
import { isDesktop } from "react-device-detect";
import { IconType } from "react-icons";

const variants = {
  primary: {
    active: "font-bold text-white bg-selected rounded-lg",
    inactive: "text-secondary-foreground bg-secondary rounded-lg",
    disabled:
      "text-secondary-foreground bg-secondary rounded-lg cursor-not-allowed opacity-50",
  },
  overlay: {
    active: "font-bold text-white bg-selected rounded-full",
    inactive:
      "text-primary rounded-full bg-gradient-to-br from-gray-400 to-gray-500 bg-gray-500",
    disabled:
      "bg-gradient-to-br from-gray-400 to-gray-500 bg-gray-500 rounded-full cursor-not-allowed opacity-50",
  },
  ghost: {
    active: "font-bold text-white rounded-lg",
    activeStyle: {
      backgroundColor: "hsl(var(--selected) / 50%)",
    },
    inactive: "text-secondary-foreground rounded-lg",
    inactiveStyle: {
      backgroundColor: "hsl(var(--secondary) / 30%)",
    },
    disabled: ""
  },
};

type CameraFeatureToggleProps = {
  className?: string;
  variant?: "primary" | "overlay" | "ghost";
  isActive: boolean;
  Icon: IconType;
  title: string;
  onClick?: (ev?: MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function CameraFeatureToggle({
  className = "",
  variant = "primary",
  isActive,
  Icon,
  title,
  onClick,
  disabled = false,
  loading = false,
}: CameraFeatureToggleProps) {
  const content = (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        "flex flex-col items-center justify-center",
        disabled
          ? variants[variant].disabled
          : variants[variant][isActive ? "active" : "inactive"],
        className,
      )}
      style={
        variant === "ghost"
          ? isActive
            ? variants["ghost"]["activeStyle"]
            : variants["ghost"]["inactiveStyle"]
          : {}
      }
    >
      {loading ? (
        <ActivityIndicator className="size-5 md:m-[6px]" />
      ) : (
        <Icon
          className={cn(
            "size-5 md:m-[6px]",
            disabled
              ? "text-gray-400"
              : isActive
                ? "text-white"
                : "text-secondary-foreground",
          )}
        />
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Tooltip>
        <TooltipTrigger disabled={disabled}>{content}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
