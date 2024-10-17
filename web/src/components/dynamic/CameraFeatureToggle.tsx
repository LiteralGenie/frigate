import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MouseEvent } from "react";
import { isDesktop } from "react-device-detect";
import { IconType } from "react-icons";

const variants = {
  primary: {
    active: "font-bold text-white bg-selected rounded-lg",
    inactive: "text-secondary-foreground bg-secondary rounded-lg",
  },
  overlay: {
    active: "font-bold text-white bg-selected rounded-full",
    inactive:
      "text-primary rounded-full bg-gradient-to-br from-gray-400 to-gray-500 bg-gray-500",
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
  },
};

type CameraFeatureToggleProps = {
  className?: string;
  variant?: "primary" | "overlay" | "ghost";
  isActive: boolean;
  Icon: IconType;
  title: string;
  onClick?: (ev?: MouseEvent) => void;
};

export default function CameraFeatureToggle({
  className = "",
  variant = "primary",
  isActive,
  Icon,
  title,
  onClick,
}: CameraFeatureToggleProps) {
  const content = (
    <div
      onClick={onClick}
      className={cn(
        className,
        "flex flex-col items-center justify-center",
        variants[variant][isActive ? "active" : "inactive"],
      )}
      style={
        variant === "ghost"
          ? isActive
            ? variants["ghost"]["activeStyle"]
            : variants["ghost"]["inactiveStyle"]
          : {}
      }
    >
      <Icon
        className={`size-5 md:m-[6px] ${isActive ? "text-white" : "text-secondary-foreground"}`}
      />
    </div>
  );

  if (isDesktop) {
    return (
      <Tooltip>
        <TooltipTrigger>{content}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
