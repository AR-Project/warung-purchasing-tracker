const hundredsToString = (number: number) => {
  if (number % 100 === 0) return (number / 100).toString();
  return (number / 100).toFixed(2);
};

export const PrettyQuantity = ({ number }: { number: number }) => {
  const quantity = hundredsToString(number).split(".");
  return (
    <div className="flex flex-row items-baseline min-w-10">
      <div className=" font-black text-xl">{quantity[0]}</div>
      {quantity.length > 1 && (
        <div className=" text-xs text-white/40">,{quantity[1]}</div>
      )}
    </div>
  );
};
