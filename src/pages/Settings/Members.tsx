import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

interface Member {
  id: string;
  customer: string;
  seats: number;
  role: "Admin" | "Member";
  date: string;
  status: "Invited" | "Member";
  email: string;
}

const members: Member[] = [
  {
    id: "1",
    customer: "Stephanie Sharkey",
    seats: 5,
    role: "Admin",
    date: "Jul 31, 2024 6:12 am",
    status: "Invited",
    email: "steph56@gmail.com",
  },
  {
    id: "2",
    customer: "Joshua Jones",
    seats: 3,
    role: "Member",
    date: "Aug 17, 2024 5:24 pm",
    status: "Member",
    email: "j.jones@aol.com",
  },
  {
    id: "3",
    customer: "Rhonda Rhodes",
    seats: 5,
    role: "Admin",
    date: "Aug 11, 2024 11:44 am",
    status: "Invited",
    email: "r.rhodes@outlook.com",
  },
  {
    id: "4",
    customer: "James Hall",
    seats: 2,
    role: "Admin",
    date: "Aug 2, 2024 7:30 pm",
    status: "Invited",
    email: "j.hall367@outlook.com",
  },
  {
    id: "5",
    customer: "Rhonda Rhodes",
    seats: 2,
    role: "Member",
    date: "Aug 2, 2024 7:30 pm",
    status: "Member",
    email: "mc.coy@aol.com",
  },
];

export function Members() {
  return (
    <div>
      <h1 className="text-lg font-bold mb-4 mt-5 md:mb-5 md:mt-11">Members Settings</h1>

      <div className="rounded-md border-b">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-2 font-medium text-muted-foreground">Customer</TableHead>
              <TableHead className="p-2 font-medium text-muted-foreground">Seats</TableHead>
              <TableHead className="p-2 font-medium text-muted-foreground">Role</TableHead>
              <TableHead className="p-2 font-medium text-muted-foreground">Date</TableHead>
              <TableHead className="p-2 font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="p-2 font-medium text-muted-foreground">E-mail</TableHead>
              <TableHead className="w-8 p-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="hover:bg-muted/5">
                <TableCell className="py-3 px-2 font-medium text-nowrap">{member.customer}</TableCell>
                <TableCell className="py-3 px-2 text-nowrap">{member.seats}</TableCell>
                <TableCell className="py-3 px-2 text-nowrap">
                  <span
                    className={`inline-flex items-center justify-center rounded-md px-2.5 text-xs font-medium ${
                      member.role === "Admin" ? "border bg-white text-black" : "bg-secondary text-black"
                    }`}
                  >
                    {member.role}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-2 text-secondary-foreground/90 text-nowrap">{member.date}</TableCell>
                <TableCell className="py-3 px-2">
                  <Badge className="rounded-md px-3 bg-[#020817] text-white font-thin hover:bg-[#020817]/90">
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 px-2 text-secondary-foreground/50">{member.email}</TableCell>
                <TableCell className="py-3 px-2 text-center">
                  <Button variant="outline" size={"sm"} className="shrink-0 px-2">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
