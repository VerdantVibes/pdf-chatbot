import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Transaction {
  id: string;
  customer: string;
  billedSeats: number;
  status: string;
  date: string;
  billedAddress: string;
  amount: string;
  email: string;
}

const transactions: Transaction[] = [
  {
    id: "1",
    customer: "Stephanie Sharkey",
    billedSeats: 2,
    status: "Badge",
    date: "Jul 31, 2024 6:12 am",
    billedAddress: "Senrab Street 71, E10OF, London, UK.",
    amount: "$2,708.37",
    email: "stephanie.sharkey@gmail.com",
  },
  {
    id: "2",
    customer: "Joshua Jones",
    billedSeats: 3,
    status: "Badge",
    date: "Aug 17, 2024 5:24 pm",
    billedAddress: "Senrab Street 71, E10OF, London, UK.",
    amount: "$3,091.05",
    email: "joshua.jones@gmail.com",
  },
  {
    id: "3",
    customer: "Rhonda Rhodes",
    billedSeats: 5,
    status: "Badge",
    date: "Aug 11, 2024 11:44 am",
    billedAddress: "Senrab Street 71, E10OF, London, UK.",
    amount: "$1,422.04",
    email: "rhonda.rhodes@gmail.com",
  },
  {
    id: "4",
    customer: "James Hall",
    billedSeats: 1,
    status: "Badge",
    date: "Aug 2, 2024 7:30 pm",
    billedAddress: "Senrab Street 71, E10OF, London, UK.",
    amount: "$7,063.79",
    email: "james.hall@gmail.com",
  },
  {
    id: "5",
    customer: "James Hall",
    billedSeats: 2,
    status: "Badge",
    date: "Jul 23, 2024 4:36 pm",
    billedAddress: "Senrab Street 71, E10OF, London, UK.",
    amount: "$7,063.79",
    email: "james.hall@gmail.com",
  },
];

export function PlanBilling() {
  return (
    <div className="mt-8">
      <div className="rounded-lg border p-6 flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Your Plan: Starter</h2>
            <p className="text-secondary-foreground/60 text-xs">
              Your next payment is set to be proceeded on: 21 August 2025
            </p>
          </div>
          <Button variant="outline">Change your Plan</Button>
        </div>
      </div>

      <div className="mt-8 rounded-lg border p-6 flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Billing: Monthly</h2>
            <p className="text-secondary-foreground/60 text-xs tracking-wide">
              Your billing address is:{" "}
              <span className="underline text-secondary-foreground/80">Senrab St, E10OF, London, United Kingdom</span>
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">Change Address</Button>
            <Button>Change Billing Cycle</Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-12">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-bold">Transactions</h2>
            <p className="text-secondary-foreground/50 text-sm">Recent transactions from your store.</p>
          </div>
          <Button>Download Invoices</Button>
        </div>

        <div className="rounded-md border-b">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="p-2 font-medium text-muted-foreground">Customer</TableHead>
                <TableHead className="p-2 font-medium text-muted-foreground">Billed Seats</TableHead>
                <TableHead className="p-2 font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="p-2 font-medium text-muted-foreground">Date</TableHead>
                <TableHead className="p-2 font-medium text-muted-foreground">Billed Address</TableHead>
                <TableHead className="p-2 font-medium text-muted-foreground text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/5">
                  <TableCell className="py-3 px-2 font-medium">
                    <div className="flex flex-col justify-center gap-x-2">
                      <span>{transaction.customer}</span>
                      <span className="text-secondary-foreground/50 text-sm">{transaction.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-2">{transaction.billedSeats}</TableCell>
                  <TableCell className="py-3 px-2">
                    <Badge className="rounded-md px-3 bg-[#020817] text-white font-thin hover:bg-[#020817]/90">
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-2 text-secondary-foreground/90">{transaction.date}</TableCell>
                  <TableCell className="py-3 px-2 text-secondary-foreground/90">{transaction.billedAddress}</TableCell>
                  <TableCell className="py-3 px-2 font-medium text-right">{transaction.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
