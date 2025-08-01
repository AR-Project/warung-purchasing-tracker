import { flag } from "@/lib/flag";

export default async function Home() {
  const registrationUserStatus = await flag.userRegistration();

  return (
    <main className=" flex min-h-screen flex-col p-2 h-full max-w-md mx-auto ">
      <div className="mb-10">
        <h1 className="text-3xl font-black py-10">
          Warung <br /> Purchasing Tracker
        </h1>
        <p className="text-lg">
          Track your expense using simple yet buff-up form. While creating
          purchase, creating item as you go. You can manage later.
        </p>
      </div>

      <h3 className="text-xl font-bold py-2">Buff-up tracking form</h3>
      <p className="mb-2 text-sm">
        All-in-One page for tracking and save your purchase. Track existing item
        OR instantly create new Item as you go, wile inputing your purchase.
        Pro-tips: Receipt images is optional, but it will increase your
        productivity.
      </p>
      <h3 className="text-xl font-bold py-2">Plan</h3>
      <p className="mb-2 text-sm">
        Using your own data purchase, the app will track each item latest price
        for predict total price of your planned purchase.
      </p>
      <div className="italic text-xs text-center py-20">
        User Registration Status: {registrationUserStatus ? "OPEN" : "CLOSED"}
      </div>
    </main>
  );
}
