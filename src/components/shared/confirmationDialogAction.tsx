import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from '@/components/ui/button';
import type * as React from "react"
import type { VariantProps } from "class-variance-authority"
import { isValidElement, useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ConfirmationDialogActionType } from '@/types/general';


export interface ConfirmationDialogActionProps {
  children: React.ReactNode
  title: string
  description: string | React.ReactNode
  cancelText?: string
  confirmText?: string
  confirmVariant?: VariantProps<typeof buttonVariants>["variant"]
  cancelVariant?: VariantProps<typeof buttonVariants>["variant"]
  takeAction?: (arg: ConfirmationDialogActionType, ...rest: any) => void
  onConfirm?: (retValue?: any) => void
  onOpenChange?: (open: boolean) => void
  disableConfirm?: boolean
  extraTakeActionArgs?: any
  autoFocus?: boolean
}

export default function ConfirmationDialogAction(
  props: ConfirmationDialogActionProps,
) {
  const [ isDialogOpen, setDialogState ] = useState<boolean>(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null)


  const setDialogStateWithFocus = useCallback(
    (open: boolean, onOpenChange?: (open: boolean) => void) => {
      setDialogState(() => {
        if (onOpenChange) {
          onOpenChange(open);
        }
        return open;
      })
      if (open && props.autoFocus) {
        setTimeout(() => {
          cancelButtonRef.current?.focus()
        }, 100)
      }
    },
    [setDialogState, props.autoFocus],
  )

  const handleAction = useCallback((action: ConfirmationDialogActionType, ...rest: any) => {
    // if only the confirmation is needed (act or ignore use case), only pass onConfirm to the component
    if (props.takeAction) {
      props.takeAction(action, ...(rest))
    }
    if (props.onConfirm && action === ConfirmationDialogActionType.CONFIRM) {
      props.onConfirm()
    }
  }, [props])

  return (
    <AlertDialog
      open={isDialogOpen}
      onOpenChange={v => setDialogStateWithFocus(v, props.onOpenChange)}
    >
      <AlertDialogTrigger
        onClick={() => setDialogStateWithFocus(true, props.onOpenChange)}
        asChild
      >
        {props.children}
      </AlertDialogTrigger>
      <AlertDialogContent
        onEscapeKeyDown={e => {
          e.preventDefault()
          setDialogState(() => {
            if (props.onOpenChange) {
              props.onOpenChange(false);
            }
            return false;
          })
        }}
        className={"text-foreground bg-background"}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {typeof props.description === "string" && props.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isValidElement(props.description) && (
          <div className="text-sm text-muted-foreground">
            {props.description}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel
            title={props.cancelText ?? "Cancel"}
            onClick={() =>
              handleAction(
                ConfirmationDialogActionType.CANCEL,
                ...(props?.extraTakeActionArgs ?? []),
              )
            }
            className={cn(buttonVariants({ variant: props.cancelVariant }))}
          >
            {props.cancelText ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            ref={cancelButtonRef}
            title={props.confirmText ?? "Confirm"}
            onClick={() =>
              handleAction(
                ConfirmationDialogActionType.CONFIRM,
                ...(props?.extraTakeActionArgs ?? []),
              )
            }
            className={cn(buttonVariants({ variant: props.confirmVariant }))}
            disabled={props.disableConfirm}
            autoFocus={true}
            tabIndex={0}
          >
            {props.confirmText ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
