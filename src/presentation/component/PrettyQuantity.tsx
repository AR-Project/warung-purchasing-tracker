const hundredsToString = (number: number) => {
  if (number % 100 === 0) return (number / 100).toString();
  return (number / 100).toFixed(2);
};

export const PrettyQuantity = ({ number }: { number: number }) => {
  const quantity = hundredsToString(number).split(".");
  return (
    <div className="flex flex-row items-baseline min-w-9">
      <div className="">{quantity[0]}</div>
      {quantity.length > 1 && <div className="">,{quantity[1]}</div>}
    </div>
  );
};
