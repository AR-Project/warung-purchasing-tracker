import { useState, ReactNode } from "react";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import { useServerAction } from "@/presentation/hooks/useServerAction";

type ServerAction = (formdata: FormData) => Promise<FormState<any>>;
type WrappedAction = (formdata: FormData) => void;

type ModalRenderProps = {
  action: WrappedAction;
  close: () => void;
};

type ModalProps<T> = {
  serverAction: ServerAction;
  modalTitle: string;
  children: (opts: ModalRenderProps) => ReactNode;
  onSuccess?: (message: string, data: T) => void;
  onError?: (message: string) => void;
  onOpen?: () => void;
  triggerLabel?: string;
};

export default function Modal<T = any>({
  serverAction,
  onSuccess = () => {},
  onError = () => {},
  onOpen = () => {},
  triggerLabel = "Open",
  modalTitle,
  children,
}: ModalProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const [wrappedAction] = useServerAction(
    serverAction,
    (message, data) => {
      if (data) {
        onSuccess(message, data);
        setIsOpen(false);
      }
    },
    (err) => onError(err)
  );

  function openModal() {
    onOpen();
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <>
      <Button onClick={openModal}>{triggerLabel}</Button>
      <Dialog open={isOpen} onClose={closeModal} as="div">
        <DialogPanel>
          <DialogTitle>{modalTitle}</DialogTitle>

          {/* always children-as-function */}
          {children({ action: wrappedAction, close: () => closeModal() })}
        </DialogPanel>
      </Dialog>
    </>
  );
}

// Usage example:
// import Modal from './Modal';
//
// <Modal onSuccess={handleSuccess} triggerLabel="Create Item">
//   {({ action, close }) => (
//     <form action={action}>
//       <input
//         name="name"
//         placeholder="Item name"
//         required
//       />
//       <div className="flex gap-2 mt-4">
//         <button type="submit">Save</button>
//         <button type="button" onClick={close}>Cancel</button>
//       </div>
//     </form>
//   )}
// </Modal>
