import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface IntegrationItem {
  id: string;
  source: "One Drive" | "Dropbox" | "Google Drive";
  email: string;
  files: number | string;
  connected: string;
  status: "Public" | "Private";
}

interface ForwardingItem {
  email: string;
  status: string;
  filesReceived: number | string;
  lastFileReceived: string;
}

interface BotItem {
  name: string;
  icon: string;
  status: string;
  filesReceived: number;
  lastFileReceived: string;
}

interface SubscriptionItem {
  type: "Youtube Channel" | "Author";
  channel: string;
  status: "Subscribed";
}

interface IntegrationCard {
  name: string;
  icon: string;
  description: string;
}

const integrations: IntegrationItem[] = [
  {
    id: "1",
    source: "One Drive",
    email: "steph56@gmail.com",
    files: 12,
    connected: "Today, 5:24 pm",
    status: "Public",
  },
  {
    id: "2",
    source: "Dropbox",
    email: "j.jones@aol.com",
    files: "-",
    connected: "Aug 17, 5:24 pm",
    status: "Private",
  },
  {
    id: "3",
    source: "Google Drive",
    email: "r.rhodes@outlook.com",
    files: 21,
    connected: "Aug 11, 11:44 am",
    status: "Public",
  },
];

const emailForwarding: ForwardingItem[] = [
  {
    email: "steph56@delphisai.com",
    status: "Status Name",
    filesReceived: 12,
    lastFileReceived: "Today, 5:24 pm",
  },
  {
    email: "j.jones@delphisai.com",
    status: "Status Name",
    filesReceived: 312,
    lastFileReceived: "Aug 17, 5:24 pm",
  },
  {
    email: "r.rhodes@delphisai.com",
    status: "Status Name",
    filesReceived: 21,
    lastFileReceived: "Aug 11, 11:44 am",
  },
];

const bots: BotItem[] = [
  {
    name: "Teams",
    icon: "/microsoft-office-teams.svg",
    status: "Status Name",
    filesReceived: 12,
    lastFileReceived: "Today, 5:24 pm",
  },
  {
    name: "Whatsapp",
    icon: "/whatsapp.svg",
    status: "Status Name",
    filesReceived: 312,
    lastFileReceived: "Aug 17, 5:24 pm",
  },
  {
    name: "Telegram",
    icon: "/telegram.svg",
    status: "Status Name",
    filesReceived: 21,
    lastFileReceived: "Aug 11, 11:44 am",
  },
];

const subscriptions: SubscriptionItem[] = [
  {
    type: "Youtube Channel",
    channel: "Alexander McQueen",
    status: "Subscribed",
  },
  {
    type: "Youtube Channel",
    channel: "How it Works",
    status: "Subscribed",
  },
  {
    type: "Youtube Channel",
    channel: "Rick McQueen",
    status: "Subscribed",
  },
  {
    type: "Author",
    channel: "Rick McQueen",
    status: "Subscribed",
  },
  {
    type: "Author",
    channel: "Rick McQueen",
    status: "Subscribed",
  },
];

const podcastIntegrations: IntegrationCard[] = [
  {
    name: "Spotify",
    icon: "/spotify.svg",
    description: "Connect Spotify to Delphis to integrate data.",
  },
  {
    name: "Apple Music",
    icon: "/apple-music.svg",
    description: "Connect Apple Music to Delphis to integrate data.",
  },
  {
    name: "Youtube",
    icon: "/youtube.svg",
    description: "Connect Youtube to Delphis to integrate data.",
  },
];

const storageIntegrations: IntegrationCard[] = [
  {
    name: "Google Drive",
    icon: "/google-drive.svg",
    description: "Connect Google Drive to Delphis to integrate data.",
  },
  {
    name: "One Drive",
    icon: "/one-drive.svg",
    description: "Connect OneDrive to Delphis to integrate data.",
  },
  {
    name: "Dropbox",
    icon: "/dropbox.svg",
    description: "Connect Dropbox to Delphis to integrate data.",
  },
];

const newsIntegrations: IntegrationCard[] = [
  {
    name: "Financial Times",
    icon: "/financial-times.svg",
    description: "Connect Financial Times to Delphis to integrate data.",
  },
  {
    name: "Bloomberg",
    icon: "/bloomberg.svg",
    description: "Connect Bloomberg to Delphis to integrate data.",
  },
  {
    name: "Telegraph",
    icon: "/telegraph.svg",
    description: "Connect Telegraph to Delphis to integrate data.",
  },
];

function AuthorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M16.5 19.25C16.5 17.7913 15.9205 16.3924 14.8891 15.3609C13.8576 14.3295 12.4587 13.75 11 13.75C9.54131 13.75 8.14236 14.3295 7.11091 15.3609C6.07946 16.3924 5.5 17.7913 5.5 19.25"
        stroke="#BCC0C4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.0026 13.7503C13.0276 13.7503 14.6693 12.1087 14.6693 10.0837C14.6693 8.05861 13.0276 6.41699 11.0026 6.41699C8.97756 6.41699 7.33594 8.05861 7.33594 10.0837C7.33594 12.1087 8.97756 13.7503 11.0026 13.7503Z"
        stroke="#BCC0C4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.4167 2.75H4.58333C3.57081 2.75 2.75 3.57081 2.75 4.58333V17.4167C2.75 18.4292 3.57081 19.25 4.58333 19.25H17.4167C18.4292 19.25 19.25 18.4292 19.25 17.4167V4.58333C19.25 3.57081 18.4292 2.75 17.4167 2.75Z"
        stroke="#BCC0C4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Integrations() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split("/").pop() || "podcasts";
  const [activeMainTab, setActiveMainTab] = useState<string>("active");

  const handleTabChange = (value: string) => {
    navigate(`/integrations/${value}`);
  };

  const getHeadingText = (tab: string) => {
    switch (tab) {
      case "active":
        return "Active Integrations";
      case "forwarding":
        return "E-mail Forwarding";
      case "subscriptions":
        return "Subscriptions";
      default:
        return "Active Integrations";
    }
  };

  const renderIntegrationCards = (integrations: IntegrationCard[]) => {
    return (
      <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto">
        {integrations.map((integration, index) => (
          <Card key={index} className="border rounded-xl shadow-md min-w-56">
            <CardContent className="p-5 pb-6">
              <div className="w-8 h-8 mb-2">
                <img src={integration.icon} alt={integration.name} className="w-full h-full" />
              </div>
              <h4 className="text-base font-semibold mb-3">{integration.name}</h4>
              <p className="text-sm text-[#71717A] mb-3">{integration.description}</p>
              <Button variant="outline" size="sm" className="w-fit font-medium">
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="py-2">
      <div>
        <h2 className="text-2xl font-semibold leading-8">Connected Integrations</h2>
        <p className="text-secondary-foreground/50 text-base font-normal leading-6">Description subtext will go here</p>
      </div>

      <div className="mt-6 md:mt-8">
        <h3 className="text-xl font-semibold leading-8 mb-4 md:mb-2 tracking-tight">{getHeadingText(activeMainTab)}</h3>

        <div className="space-y-6">
          <Tabs defaultValue="active" className="w-full" onValueChange={setActiveMainTab}>
            <TabsList className="bg-[#F4F4F5] p-1 mb-4 md:mb-5 w-full md:w-fit">
              <TabsTrigger
                value="active"
                className="text-xs md:text-sm w-full md:w-fit data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-2 md:px-3.5 py-1.5 md:py-1"
              >
                Active Integrations
              </TabsTrigger>
              <TabsTrigger
                value="forwarding"
                className="text-xs md:text-sm w-full md:w-fit data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-2 md:px-3.5 py-1.5 md:py-1"
              >
                Forwarding
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className="text-xs md:text-sm w-full md:w-fit data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-2 md:px-3.5 py-1.5 md:py-1"
              >
                Subscriptions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <div className="space-y-8">
                <div className="w-full md:w-5/6 border-b border-neutral-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#E4E4E7]">
                        <TableHead className="text-left py-2 px-0 md:px-2 text-[#71717A] font-normal text-sm">Source</TableHead>
                        <TableHead className="text-left py-2 px-4 text-[#71717A] font-normal text-sm">E-mail</TableHead>
                        <TableHead className="text-left py-2 px-4 text-[#71717A] font-normal text-sm">Files</TableHead>
                        <TableHead className="text-left py-2 px-4 text-[#71717A] font-normal text-sm">Connected</TableHead>
                        <TableHead className="text-left py-2 px-4 text-[#71717A] font-normal text-sm">Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {integrations.map((item) => (
                        <TableRow key={item.id} className="border-b border-[#E4E4E7] last:border-0">
                          <TableCell className="py-3 md:py-2.5 px-2 pr-8 md:pr-2">
                            <div className="flex items-center gap-3">
                              <img
                                src={`/${item.source.toLowerCase().replace(" ", "-")}.svg`}
                                alt={item.source}
                                className="w-5 h-5"
                              />
                              <span className="text-sm font-semibold text-nowrap">{item.source}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 md:py-2.5 px-4">
                            <span className="text-sm text-muted-foreground text-nowrap">{item.email}</span>
                          </TableCell>
                          <TableCell className="py-3 md:py-2.5 px-4">
                            <span className="text-sm text-nowrap">{item.files}</span>
                          </TableCell>
                          <TableCell className="py-3 md:py-2.5 px-4">
                            <span className="text-sm text-nowrap">{item.connected}</span>
                          </TableCell>
                          <TableCell className="py-3 md:py-2.5 px-4">
                            <span className="text-xs text-nowrap px-3 py-1 rounded-md bg-[#18181B] text-gray-200">
                              {item.status}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 md:py-2.5 px-4">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="md:pt-2 pb-6 md:pb-0">
                  <h3 className="text-[#09090B] text-xl font-semibold leading-8 tracking-tight mb-4 md:mb-2">
                    Available Integrations
                  </h3>
                  <Tabs value={currentPath} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="bg-[#F4F4F5] p-1 mb-5 w-full md:w-fit">
                      <TabsTrigger
                        value="podcasts"
                        className="text-sm w-full md:w-fit data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-3.5 py-1"
                      >
                        Podcasts
                      </TabsTrigger>
                      <TabsTrigger
                        value="storage"
                        className="text-sm w-full md:w-fit data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-3.5 py-1"
                      >
                        Storage
                      </TabsTrigger>
                      <TabsTrigger
                        value="news"
                        className="text-sm w-full md:w-fit data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-3.5 py-1"
                      >
                        News
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="podcasts">
                      {renderIntegrationCards(podcastIntegrations)}
                    </TabsContent>

                    <TabsContent value="storage">
                      {renderIntegrationCards(storageIntegrations)}
                    </TabsContent>

                    <TabsContent value="news">
                      {renderIntegrationCards(newsIntegrations)}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="forwarding">
              <div className="space-y-8">
                <div className="border-b border-[#E4E4E7]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#E4E4E7]">
                        <TableHead className="text-left py-2 px-0 md:px-2 text-[#71717A] font-normal text-sm text-nowrap">E-mail</TableHead>
                        <TableHead className="text-left py-2 px-4 text-[#71717A] font-normal text-sm text-nowrap">Status</TableHead>
                        <TableHead className="text-left py-2 px-4 text-[#71717A] font-normal text-sm text-nowrap">Files Received</TableHead>
                        <TableHead className="text-left py-2 px-4 text-[#71717A] font-normal text-sm text-nowrap">Last File Received</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailForwarding.map((item, index) => (
                        <TableRow key={index} className="border-b border-[#E4E4E7] last:border-0">
                          <TableCell className="py-3 md:py-2.5 pl-0 pr-6 md:px-2">
                            <span className="text-sm text-muted-foreground text-nowrap">{item.email}</span>
                          </TableCell>
                          <TableCell className="py-3 md:py-2.5 px-4">
                            <span className="text-xs px-2.5 py-1 rounded-md bg-[#18181B] text-gray-200 text-nowrap">{item.status}</span>
                          </TableCell>
                          <TableCell className="py-3 md:py-2.5 px-4">
                            <span className="text-sm text-nowrap">{item.filesReceived}</span>
                          </TableCell>
                          <TableCell className="py-3 md:py-2.5 px-4">
                            <span className="text-sm text-nowrap">{item.lastFileReceived}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-[#09090B] text-xl font-semibold leading-8 tracking-tight mb-4">Bots</h3>
                  <div className="border-b border-[#E4E4E7]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-[#E4E4E7]">
                          <TableHead className="text-nowrap text-left py-2 px-0 md:px-2 text-[#71717A] font-normal text-sm">Bot</TableHead>
                          <TableHead className="text-nowrap text-left py-2 px-4 text-[#71717A] font-normal text-sm">Status</TableHead>
                          <TableHead className="text-nowrap text-left py-2 px-4 text-[#71717A] font-normal text-sm">Files Received</TableHead>
                          <TableHead className="text-nowrap text-left py-2 px-4 text-[#71717A] font-normal text-sm">Last File Received</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bots.map((bot, index) => (
                          <TableRow key={index} className="border-b border-[#E4E4E7] last:border-0">
                            <TableCell className="py-3 md:py-2.5 pl-0 pr-12 md:px-2 text-nowrap">
                              <div className="flex items-center gap-2">
                                <img src={bot.icon} alt={bot.name} className="w-5 h-5" />
                                <span className="text-sm font-medium">{bot.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 md:py-2.5 px-4 text-nowrap">
                              <span className="text-xs px-2.5 py-1 rounded-md bg-[#18181B] text-gray-200">{bot.status}</span>
                            </TableCell>
                            <TableCell className="py-3 md:py-2.5 px-4 text-nowrap">
                              <span className="text-sm">{bot.filesReceived}</span>
                            </TableCell>
                            <TableCell className="py-3 md:py-2.5 px-4 text-nowrap">
                              <span className="text-sm">{bot.lastFileReceived}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscriptions">
              <div>
                <div className="border-b border-[#E4E4E7]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#E4E4E7]">
                        <TableHead className="text-nowrap text-left py-2 px-0 md:px-2 text-[#71717A] font-normal text-sm">Customer</TableHead>
                        <TableHead className="text-nowrap text-left py-2 px-4 text-[#71717A] font-normal text-sm">Channel</TableHead>
                        <TableHead className="text-nowrap text-left py-2 px-4 text-[#71717A] font-normal text-sm">Status</TableHead>
                        <TableHead className="text-nowrap w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((item, index) => (
                        <TableRow key={index} className="border-b border-[#E4E4E7] last:border-0">
                          <TableCell className="py-3 md:py-2.5 pl-0 pr-12 md:px-2 text-nowrap">
                            <div className="flex items-center gap-2">
                              {item.type === "Youtube Channel" ? (
                                <img src="/youtube.svg" alt="YouTube" className="w-5 h-5" />
                              ) : (
                                <AuthorIcon />
                              )}
                              <span className="text-sm">{item.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 md:py-2.5 px-4 text-nowrap">
                            <span className="text-xs border border-neutral-200 rounded-md px-2 py-0.5">{item.channel}</span>
                          </TableCell>
                          <TableCell className="py-3 md:py-2.5 px-4 text-nowrap">
                            <span className="text-xs px-2.5 py-1 rounded bg-[#18181B] text-gray-200">{item.status}</span>
                          </TableCell>
                          <TableCell className="py-3 md:py-2.5 px-4 text-nowrap">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
