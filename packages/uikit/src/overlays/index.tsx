import { useState, type ReactNode } from "react";
import {
  Tooltip as NativeTooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@gpuix/react/tooltip";
import { useFocusTarget } from "../core/focus";
import { useTheme } from "../core/theme";
import { controlSizes } from "../core/tokens";
import { Button, Text, type ButtonProps } from "../base";
export function Tooltip({
  content,
  children,
  testId,
  open,
}: {
  content: string;
  children: ReactNode;
  testId: string;
  open?: boolean;
}) {
  const { colors: c } = useTheme();
  const [visible, setVisible] = useState(false);
  const focus = useFocusTarget();
  return (
    <TooltipProvider delayDuration={400}>
      <NativeTooltip open={open ?? visible} onOpenChange={setVisible}>
        <TooltipTrigger
          ref={focus.ref}
          testId={`${testId}-trigger`}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "escape" && visible) setVisible(false);
            else {
              focus.onKeyDown(event);
              if (event.key === "enter" || event.key === "space")
                setVisible(true);
              if (event.key === "tab") setVisible(false);
            }
          }}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent
          testId={testId}
          side="top"
          sideOffset={6}
          style={{
            padding: 8,
            backgroundColor: c.elevated,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <Text size={12}>{content}</Text>
        </TooltipContent>
      </NativeTooltip>
    </TooltipProvider>
  );
}
export function IconButton({
  label,
  icon,
  size = "md",
  ...props
}: Omit<ButtonProps, "children" | "leading" | "trailing"> & {
  label: string;
  icon: ReactNode;
}) {
  return (
    <Tooltip content={label} testId={`${props.testId}-tooltip`}>
      <Button
        {...props}
        size={size}
        style={{
          width: controlSizes[size].height,
          paddingLeft: 0,
          paddingRight: 0,
          ...props.style,
        }}
        leading={icon}
      />
    </Tooltip>
  );
}
export type { ModalSurfaceProps as DialogProps } from "../components/modal/surface";
export { ModalSurface as Dialog } from "../components/modal/surface";
