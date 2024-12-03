"use client";

import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { MdDelete } from "react-icons/md";
import { deletePlanAction } from "../_action/deletePlan.action";

type Props = {
  planId: string;
};

export default function PlanDeleteDialog(props: Props) {
  let [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <Button
        onClick={open}
        className="h-8 border border-white/50 px-2 bg-red-950 rounded-sm text-white focus:outline-none data-[hover]:bg-red-800 data-[focus]:outline-1 data-[focus]:outline-white flex flex-row justify-center items-center gap-3"
      >
        <MdDelete />
        <div>Delete Plan</div>
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Panel closeDialog={close} {...props} />
          </div>
        </div>
      </Dialog>
    </>
  );
}

type PanelProps = Props & {
  closeDialog: () => void;
};

function Panel({ closeDialog, planId }: PanelProps) {
  const router = useRouter();

  const [formAction, isPending] = useServerAction(
    deletePlanAction,
    (msg) => {
      toast.success(msg);
      //   setTimeout(() => router.push("/plan"), 500);
      router.push("/plan");
    },
    (err) => {
      toast.error(err);
    }
  );

  function onDeleteHandler() {
    const form = new FormData();
    form.append("plan-id", planId);
    formAction(form);
  }

  return (
    <DialogPanel
      transition
      className=" rounded-sm border border-gray-300/70 bg-gray-800 p-6 duration-200 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 flex flex-col items-center"
    >
      <DialogTitle as="h3" className="text-lg font-bold text-white">
        Hapus Plan?
      </DialogTitle>

      <div className="mt-4 flex flex-row gap-3">
        <Button
          className="inline-flex items-center gap-2 rounded-sm bg-red-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-red-500 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
          onClick={onDeleteHandler}
        >
          Hapus
        </Button>
        <Button
          className="inline-flex items-center gap-2 rounded-sm bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
          onClick={closeDialog}
        >
          Batal
        </Button>
      </div>
    </DialogPanel>
  );
}