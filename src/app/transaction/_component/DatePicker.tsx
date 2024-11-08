"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DateTime } from "luxon";
import { RxCross2, RxReset } from "react-icons/rx";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { MdCheck } from "react-icons/md";

import { shortDate, superShortDate } from "@/lib/utils/formatter";
import Tooltip from "@/presentation/component/Tooltip";

type Props = {
  activeDateRange: RangeFilter | undefined;
};

export default function DatePicker({ activeDateRange }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [dateFrom, setDateFrom] = useState<string | undefined>(
    activeDateRange ? activeDateRange.from : undefined
  );
  const [dateTo, setDateTo] = useState<string | undefined>(
    activeDateRange ? activeDateRange.to : undefined
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);

  const today = DateTime.now().toISODate();
  const oneMonthBefore = DateTime.now().minus({ month: 1 }).toISODate();
  const twoWeeksBefore = DateTime.now().minus({ week: 2 }).toISODate();

  function createDateFilterQueryString(from: string, to: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", from);
    params.set("to", to);
    return params.toString();
  }

  const removeDateFilterQueryString = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    return params.toString();
  };

  function onApplyDateFilterHandler() {
    if (!(dateFrom && dateTo)) return;
    setIsOpen(false);
    router.push(pathname + "?" + createDateFilterQueryString(dateFrom, dateTo));
    router.refresh();
  }

  function onClearDateFilter() {
    router.push(pathname + "?" + removeDateFilterQueryString());
  }

  function onResetDateSelection() {
    setDateFrom("");
    setDateTo("");
  }

  function oneMonthFilterHandler() {
    setIsOpen(false);
    router.push(
      pathname + "?" + createDateFilterQueryString(oneMonthBefore, today)
    );
    router.refresh();
  }
  function twoWeeksFilterHandler() {
    setIsOpen(false);
    router.push(
      pathname + "?" + createDateFilterQueryString(twoWeeksBefore, today)
    );
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-row w-full">
        <button
          className={` grow border h-8 w-full flex flex-row justify-center items-center gap-3  ${
            activeDateRange
              ? "hover:bg-green-600 bg-green-800 border-gray-400"
              : "hover:bg-gray-600 bg-gray-800 border-gray-600"
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          Filter By Date {isOpen ? <FaAngleUp /> : <FaAngleDown />}
        </button>
        {activeDateRange && (
          <button
            className="group flex flex-row gap-2 items-center  bg-gray-800 h-8 pl-4 border border-gray-500"
            onClick={onClearDateFilter}
          >
            <span className=" text-nowrap">{`${superShortDate(
              activeDateRange.from
            )} - ${superShortDate(activeDateRange.to)}`}</span>
            <RxCross2 className="text-2xl  group-hover:bg-red-600 group-hover:border-2 group-hover:border-white " />
          </button>
        )}
      </div>

      <div
        className={`overflow-hidden transition-height ease-in-out delay-100 flex flex-row items-center w-full justify-between gap-2 text-xs ${
          isOpen ? "h-[80px]" : "h-[0px]"
        }`}
      >
        <button
          className="px-2 border bg-green-600/30 h-10 border-gray-400 "
          onClick={twoWeeksFilterHandler}
        >
          <div>14 Hari</div>
          <div>Terakhir</div>
        </button>
        <button
          className="px-2 border bg-green-600/30 h-10 border-gray-400"
          onClick={oneMonthFilterHandler}
        >
          <div>30 Hari</div>
          <div>Terakhir</div>
        </button>
        <div className="mx-1"></div>
        <div className="group flex flex-row grow relative">
          <input
            className="w-[0px] h-10"
            ref={dateFromRef}
            type="date"
            placeholder=""
            value={dateFrom}
            max={DateTime.now().toISODate()}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setDateTo(e.target.value);
            }}
          />
          <button
            className=" grow border bg-gray-800 border-gray-400 hover:bg-blue-700/30 h-10 px-2"
            onClick={() => dateFromRef.current?.showPicker()}
          >
            {dateFrom ? (
              shortDate(dateFrom)
            ) : (
              <span className="italic text-gray-300">Dari..</span>
            )}
          </button>
          <Tooltip>Dari Tanggal: </Tooltip>
        </div>
        <div className="group relative flex flex-row grow">
          <input
            className="w-[0px] h-10"
            ref={dateToRef}
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom}
          />
          <button
            className=" grow border bg-gray-800 disabled:bg-gray-950 border-gray-500 disabled:border-gray-700 h-10 px-2 disabled:cursor-not-allowed disabled:text-gray-600"
            onClick={() => dateToRef.current?.showPicker()}
            disabled={!dateFrom}
          >
            {dateTo ? (
              shortDate(dateTo)
            ) : (
              <span className="italic text-gray-400">Sampai...</span>
            )}
          </button>
          <Tooltip>Sampai Tanggal</Tooltip>
        </div>
        <div className="group relative">
          <button
            className="h-8 px-2 bg-gray-900"
            onClick={onResetDateSelection}
          >
            <RxReset />
          </button>
          <Tooltip>Atur ulang tanggal</Tooltip>
        </div>
        <button
          className="disabled:cursor-not-allowed disabled:text-gray-400 disabled:bg-gray-800 h-10 aspect-square px-2 border bg-green-800 border-gray-400 disabled:border-gray-600 flex items-center justify-center"
          onClick={onApplyDateFilterHandler}
          disabled={!(dateFrom && dateTo)}
        >
          <MdCheck className="text-xl" />
        </button>
      </div>
    </>
  );
}
