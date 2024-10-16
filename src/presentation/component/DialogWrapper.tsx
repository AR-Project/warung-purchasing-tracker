"use client";

import { Button, Dialog, DialogBackdrop } from "@headlessui/react";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { MdEdit } from "react-icons/md";

type ContextObject = {
  closePanel: () => void;
  openPanel: () => void;
};

const DialogContext = createContext<ContextObject | undefined>(undefined);

/** Wrap your component to be displayed inside pop up Dialog from headlessui/react
 * exposing function from context to close dialog.
 * Your component top element must be DialogPanel.
 *
 * @example
 * <DialogWrapper>
 *  ... // your component here
 * </DialogWrapper>
 *
 */
function DialogWrapper({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);

  function closePanel() {
    setIsOpen(false);
  }
  function openPanel() {
    setIsOpen(true);
  }

  return (
    <DialogContext.Provider value={{ closePanel, openPanel }}>
      <button
        className={`rounded-sm bg-red-900 px-2 h-8 flex flex-row items-center justify-center text-sm gap-2 focus:outline-none data-[hover]:border data-[hover]:border-white data-[focus]:outline-1 data-[focus]:outline-white text-gray-200 data-[hover]:text-gray-100`}
        onClick={() => setIsOpen(true)}
      >
        <MdEdit /> Delete this transaction
      </button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={closePanel}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {children}
          </div>
        </div>
      </Dialog>
    </DialogContext.Provider>
  );
}

function useDialogContext() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error(
      "useDialogContext must be use inside DialogWrapper Component"
    );
  }
  return [context.closePanel, context.openPanel] as const;
}

export { DialogWrapper, useDialogContext };
