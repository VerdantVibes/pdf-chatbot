import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Mail, Pencil } from "lucide-react";

function DelphisCommandIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M13.3359 2.66699H2.66927C1.93289 2.66699 1.33594 3.26395 1.33594 4.00033V12.0003C1.33594 12.7367 1.93289 13.3337 2.66927 13.3337H13.3359C14.0723 13.3337 14.6693 12.7367 14.6693 12.0003V4.00033C14.6693 3.26395 14.0723 2.66699 13.3359 2.66699Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.66406 2.66699V5.33366" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.33594 5.33301H14.6693" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 2.66699V5.33366" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <g clip-path="url(#clip0_2557_11650)">
            <path d="M9.05704 16.8737C7.69291 16.8737 6.35032 16.5171 5.17445 15.8426L5.11141 15.8065L1.31686 16.8016L2.34148 13.059L2.30397 12.9944C1.60931 11.805 1.24219 10.4441 1.24219 9.05899C1.24219 4.74988 4.74793 1.24414 9.05704 1.24414C13.3661 1.24414 16.8719 4.74988 16.8719 9.05899C16.8719 13.3681 13.3663 16.8737 9.05704 16.8737ZM5.16194 15.4269L5.35071 15.5354C6.47293 16.179 7.75456 16.5194 9.05704 16.5194C13.1706 16.5194 16.5174 13.1726 16.5174 9.05899C16.5174 4.94525 13.1706 1.59841 9.05704 1.59841C4.9433 1.59841 1.59646 4.94525 1.59646 9.05899C1.59646 10.3816 1.94691 11.6806 2.60979 12.8158L2.72267 13.0088L1.82083 16.3032L5.16194 15.4269Z" stroke="black" stroke-width="0.5"/>
            <path d="M11.0734 12.5171C10.8361 12.5171 10.5624 12.4875 10.2677 12.3939C9.95053 12.2934 9.59483 12.1734 9.14273 11.9781C7.51671 11.2759 6.33861 9.82949 5.78109 9.02968C5.7665 9.00867 5.75625 8.9939 5.75052 8.98626C5.50024 8.65227 4.92188 7.78194 4.92188 6.87045C4.92188 5.90598 5.40506 5.39049 5.6114 5.17026L5.64805 5.13083C5.89572 4.86023 6.18282 4.83105 6.29484 4.83105C6.42736 4.83105 6.56023 4.83227 6.67608 4.838C6.68702 4.83852 6.69848 4.83852 6.71012 4.83835C6.90795 4.842 7.10369 4.88993 7.26539 5.27864C7.31923 5.40786 7.39791 5.59943 7.48093 5.8016C7.62839 6.1606 7.83038 6.6523 7.86008 6.7117C7.89273 6.77701 7.99191 6.97587 7.87641 7.20757L7.84948 7.26193C7.79894 7.3651 7.75535 7.4542 7.65826 7.56727C7.62648 7.60443 7.59365 7.64438 7.56065 7.6845C7.49222 7.76787 7.42153 7.85402 7.35709 7.91811C7.25879 8.01606 7.25497 8.02822 7.29926 8.10447C7.43455 8.33651 7.80728 8.92842 8.34657 9.40953C8.94717 9.94534 9.46005 10.1677 9.73551 10.2872C9.79266 10.312 9.83886 10.3321 9.87272 10.349C10.0162 10.4207 10.0379 10.396 10.0857 10.3413C10.2251 10.1819 10.5702 9.77305 10.6876 9.59693C10.9011 9.27649 11.1689 9.37462 11.3292 9.4328C11.5267 9.50471 12.5461 10.0082 12.6763 10.0733L12.7802 10.1242C12.9395 10.2012 13.0544 10.2568 13.1203 10.3665L13.1204 10.3667C13.22 10.5331 13.1765 11.0043 13.0216 11.4392C12.8297 11.9774 11.9733 12.4172 11.5708 12.4773C11.4348 12.4976 11.2662 12.5171 11.0734 12.5171ZM6.29484 5.1786C6.24343 5.1786 6.06315 5.19214 5.9044 5.36548L5.8648 5.40786C5.67149 5.61419 5.26924 6.04337 5.26924 6.87045C5.26924 7.67738 5.79915 8.47181 6.02702 8.77593C6.03571 8.78757 6.04839 8.80546 6.06628 8.83099C6.60278 9.60058 7.73381 10.9913 9.28081 11.6593C9.71867 11.8484 10.0646 11.9649 10.3731 12.0627C10.8381 12.2105 11.25 12.1739 11.5198 12.1334C11.8722 12.0808 12.5671 11.6801 12.6946 11.3223C12.8392 10.9168 12.8344 10.6119 12.8187 10.5409C12.7927 10.5157 12.7027 10.4723 12.6296 10.4369L12.5212 10.3839C12.2699 10.258 11.3701 9.81716 11.2106 9.75898C11.0392 9.69663 11.0321 9.70705 10.977 9.78937C10.8365 10.0006 10.4448 10.4587 10.3476 10.5699C10.1268 10.8226 9.88245 10.742 9.71762 10.6597C9.6881 10.6448 9.64763 10.6274 9.59778 10.6057C9.32545 10.4874 8.7582 10.2415 8.11592 9.66849C7.53946 9.15456 7.14311 8.52565 6.99965 8.27919C6.81711 7.96587 7.01667 7.76718 7.11237 7.67182C7.16448 7.61989 7.22961 7.54069 7.29266 7.46392C7.32704 7.42207 7.36143 7.38003 7.39478 7.34113C7.46304 7.26158 7.49118 7.20392 7.53772 7.10891L7.56569 7.05212C7.59348 6.99637 7.58913 6.94617 7.54953 6.8668C7.51671 6.80097 7.37377 6.45447 7.15979 5.93325C7.07694 5.73178 6.99861 5.54073 6.94494 5.41185C6.85046 5.1845 6.78949 5.1845 6.71238 5.18537C6.69397 5.18572 6.67625 5.18554 6.65906 5.18467C6.54825 5.17964 6.42146 5.1786 6.29484 5.1786Z" stroke="black" stroke-width="0.5"/>
        </g>
        <defs>
            <clipPath id="clip0_2557_11650">
            <rect width="18" height="18" fill="white"/>
            </clipPath>
        </defs>
    </svg>
  )
}

export function Reports() {
  return (
    <div>
      <div>
        <h2 className="text-[#09090B] text-[24px] font-semibold leading-[32px] tracking-[-0.4px] font-sans">Automated Reports</h2>
        <p className="text-[#71717A] text-base font-normal leading-6 font-sans">Description subtext will go here</p>
      </div>

      <div className="mt-6">
        <h3 className="text-[#09090B] text-[20px] font-semibold leading-[32px] tracking-[-0.4px] font-sans mb-4">New Automation</h3>
        
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#D5D7DA] bg-white shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] p-4">
          <div className="flex-[1_0_180px]">
            <Select defaultValue="summarize">
              <SelectTrigger className="w-full rounded-[6px] border border-[#E4E4E7] bg-white">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent className="rounded-[6px] border border-[#E4E4E7] bg-white">
                <SelectItem value="summarize" className="text-[#18181B] text-sm font-semibold leading-5 font-sans">Summarize Content</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-sm text-[#71717A] whitespace-nowrap">on the topic of</span>

          <div className="flex-[1_0_180px]">
            <Select defaultValue="european">
              <SelectTrigger className="w-full rounded-[6px] border border-[#E4E4E7] bg-white">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent className="rounded-[6px] border border-[#E4E4E7] bg-white">
                <SelectItem value="european" className="text-[#18181B] text-sm font-semibold leading-5 font-sans">European Equities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-sm text-[#71717A] whitespace-nowrap">from</span>

          <div className="flex-[1_0_180px]">
            <Select defaultValue="gavekal">
              <SelectTrigger className="w-full rounded-[6px] border border-transparent bg-[#18181B] text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent className="rounded-[6px] border border-[#E4E4E7] bg-white">
                <SelectItem value="gavekal" className="text-[#18181B] text-sm font-semibold leading-5 font-sans">Gavekal Research</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-sm text-[#71717A] whitespace-nowrap">since</span>

          <div className="flex-[1_0_140px]">
            <Select defaultValue="lastWeek">
              <SelectTrigger className="w-full rounded-[6px] border border-[#E4E4E7] bg-white">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="rounded-[6px] border border-[#E4E4E7] bg-white">
                <SelectItem value="lastWeek" className="text-[#18181B] text-sm font-semibold leading-5 font-sans">Last Week</SelectItem>
                <SelectItem value="lastMonth" className="text-[#18181B] text-sm font-semibold leading-5 font-sans">Last Month</SelectItem>
                <SelectItem value="today" className="text-[#18181B] text-sm font-semibold leading-5 font-sans">Today</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-sm text-[#71717A] whitespace-nowrap">and send to</span>

          <div className="flex-[1_0_140px]">
            <Select defaultValue="email">
              <SelectTrigger className="w-full rounded-[6px] border border-[#E4E4E7] bg-white">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent className="rounded-[6px] border border-[#E4E4E7] bg-white">
                <SelectItem value="email" className="text-[#18181B] text-sm font-semibold leading-5 font-sans">Email</SelectItem>
                <SelectItem value="delphisAI" className="text-[#18181B] text-sm font-semibold leading-5 font-sans">Delphis AI</SelectItem>
                <SelectItem value="whatsapp" className="text-[#18181B] text-sm font-semibold leading-5 font-sans">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="bg-[#18181B] text-white hover:bg-[#27272A] whitespace-nowrap">
            Set Automation
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-[#09090B] text-[20px] font-semibold leading-[32px] tracking-[-0.4px] font-sans mb-4">Existing Reports</h3>
        
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px] text-[#71717A]">Report</TableHead>
                <TableHead className="text-[#71717A]">Topic</TableHead>
                <TableHead className="text-[#71717A]">Source</TableHead>
                <TableHead className="text-[#71717A]">Timeline</TableHead>
                <TableHead className="text-[#71717A]">Notification Type</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-neutral-50">
                  <TableCell className="font-medium">Summarize Content</TableCell>
                  <TableCell>European Equities</TableCell>
                  <TableCell>
                    <span className="rounded-[6px] border border-transparent bg-[#18181B] text-white text-xs px-2 py-1 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
                      Gavekal Research
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="rounded-[6px] border border-transparent bg-[#F4F4F5] px-2">Today</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {i % 3 === 0 ? (
                        <>
                          <Mail className="h-4 w-4" />
                          <span>E-mail Address</span>
                        </>
                      ) : i % 2 === 0 ? (
                        <>
                          <DelphisCommandIcon className="h-4 w-4 text-[#4E5255]" />
                          <span>Delphis AI</span>
                        </>
                      ) : (
                        <>
                          <WhatsappIcon className="h-4 w-4 text-[#4E5255]" />
                          <span>WhatsApp</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="hidden md:flex items-center justify-between px-2 p-4">
        <div className="flex text-sm text-muted-foreground">
            0 of 100 row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
            <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
            </Button>
            <Button
            variant="outline"
            className="h-8 w-8 p-0"
            >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
            </Button>
            <Button
            variant="outline"
            className="h-8 w-8 p-0"
            >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
            </Button>
            <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
            </Button>
        </div>
        <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select defaultValue="10">
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
} 