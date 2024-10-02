import TransactionNavigation from "./_component/TransactionNav";

type Links = {
  href: string;
  label: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <TransactionNavigation />
      {children}
    </section>
  );
}
