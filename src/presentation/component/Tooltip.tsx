import { PropsWithChildren } from "react";

/** Put `group` and `relative tag on parent element classname */

export default function Tooltip({ children }: PropsWithChildren) {
  return (
    <p className="transition-opacity duration-200 ease-in-out delay-200 group-hover:opacity-100 opacity-0 pointer-events-none right-0 absolute bg-yellow-300 text-yellow-900 px-2 rounded-sm -translate-y-5 text-sm">
      {children}
    </p>
  );
}
