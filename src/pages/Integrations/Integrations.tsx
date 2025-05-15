import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

const integrations: IntegrationItem[] = [
  {
    id: "1",
    source: "One Drive",
    email: "steph56@gmail.com",
    files: 12,
    connected: "Today, 5:24 pm",
    status: "Public"
  },
  {
    id: "2",
    source: "Dropbox",
    email: "j.jones@aol.com",
    files: "-",
    connected: "Aug 17, 5:24 pm",
    status: "Private"
  },
  {
    id: "3",
    source: "Google Drive",
    email: "r.rhodes@outlook.com",
    files: 21,
    connected: "Aug 11, 11:44 am",
    status: "Public"
  }
];

const emailForwarding: ForwardingItem[] = [
  {
    email: "steph56@delphisai.com",
    status: "Status Name",
    filesReceived: 12,
    lastFileReceived: "Today, 5:24 pm"
  },
  {
    email: "j.jones@delphisai.com",
    status: "Status Name",
    filesReceived: 312,
    lastFileReceived: "Aug 17, 5:24 pm"
  },
  {
    email: "r.rhodes@delphisai.com",
    status: "Status Name",
    filesReceived: 21,
    lastFileReceived: "Aug 11, 11:44 am"
  }
];

const bots: BotItem[] = [
  {
    name: "Teams",
    icon: "/microsoft-office-teams.svg",
    status: "Status Name",
    filesReceived: 12,
    lastFileReceived: "Today, 5:24 pm"
  },
  {
    name: "Whatsapp",
    icon: "/whatsapp.svg",
    status: "Status Name",
    filesReceived: 312,
    lastFileReceived: "Aug 17, 5:24 pm"
  },
  {
    name: "Telegram",
    icon: "/telegram.svg",
    status: "Status Name",
    filesReceived: 21,
    lastFileReceived: "Aug 11, 11:44 am"
  }
];

const subscriptions: SubscriptionItem[] = [
  {
    type: "Youtube Channel",
    channel: "Alexander McQueen",
    status: "Subscribed"
  },
  {
    type: "Youtube Channel",
    channel: "How it Works",
    status: "Subscribed"
  },
  {
    type: "Youtube Channel",
    channel: "Rick McQueen",
    status: "Subscribed"
  },
  {
    type: "Author",
    channel: "Rick McQueen",
    status: "Subscribed"
  },
  {
    type: "Author",
    channel: "Rick McQueen",
    status: "Subscribed"
  }
];

function AuthorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M16.5 19.25C16.5 17.7913 15.9205 16.3924 14.8891 15.3609C13.8576 14.3295 12.4587 13.75 11 13.75C9.54131 13.75 8.14236 14.3295 7.11091 15.3609C6.07946 16.3924 5.5 17.7913 5.5 19.25" stroke="#BCC0C4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11.0026 13.7503C13.0276 13.7503 14.6693 12.1087 14.6693 10.0837C14.6693 8.05861 13.0276 6.41699 11.0026 6.41699C8.97756 6.41699 7.33594 8.05861 7.33594 10.0837C7.33594 12.1087 8.97756 13.7503 11.0026 13.7503Z" stroke="#BCC0C4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17.4167 2.75H4.58333C3.57081 2.75 2.75 3.57081 2.75 4.58333V17.4167C2.75 18.4292 3.57081 19.25 4.58333 19.25H17.4167C18.4292 19.25 19.25 18.4292 19.25 17.4167V4.58333C19.25 3.57081 18.4292 2.75 17.4167 2.75Z" stroke="#BCC0C4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
}

export function Integrations() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split('/').pop() || 'podcasts';
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

  return (
    <div >
      <div>
        <h2 className="text-[#09090B] text-[24px] font-semibold leading-[32px] tracking-[-0.4px] font-sans">Connected Integrations</h2>
        <p className="text-[#71717A] text-base font-normal leading-6 font-sans">Description subtext will go here</p>
      </div>

      <div className="mt-8">
        <h3 className="text-[#09090B] text-[20px] font-semibold leading-[32px] tracking-[-0.4px] font-sans mb-4">
          {getHeadingText(activeMainTab)}
        </h3>
        
        <div className="space-y-6">
          <Tabs defaultValue="active" className="w-full" onValueChange={setActiveMainTab}>
            <TabsList className="bg-[#F4F4F5] p-1 mb-6">
              <TabsTrigger 
                value="active" 
                className="text-sm data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-3.5 py-1"
              >
                Active Integrations
              </TabsTrigger>
              <TabsTrigger 
                value="forwarding" 
                className="text-sm data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-3.5 py-1"
              >
                Forwarding
              </TabsTrigger>
              <TabsTrigger 
                value="subscriptions" 
                className="text-sm data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-3.5 py-1"
              >
                Subscriptions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <div className="space-y-8">
                <div className="rounded-lg border border-[#E4E4E7]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E4E4E7]">
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Source</th>
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">E-mail</th>
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Files</th>
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Connected</th>
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Status</th>
                        <th className="w-[50px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {integrations.map((item) => (
                        <tr key={item.id} className="border-b border-[#E4E4E7] last:border-0">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={`/${item.source.toLowerCase().replace(" ", "-")}.svg`}
                                alt={item.source}
                                className="w-5 h-5"
                              />
                              <span className="text-sm font-medium">{item.source}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm">{item.email}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm">{item.files}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm">{item.connected}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs px-2 py-1 rounded bg-[#18181B] text-white">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-[#09090B] text-[20px] font-semibold leading-[32px] tracking-[-0.4px] font-sans mb-4">Available Integrations</h3>
                  <Tabs value={currentPath} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="bg-[#F4F4F5] p-1 mb-6">
                      <TabsTrigger 
                        value="podcasts" 
                        className="text-sm data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-3.5 py-1"
                      >
                        Podcasts
                      </TabsTrigger>
                      <TabsTrigger 
                        value="storage" 
                        className="text-sm data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-3.5 py-1"
                      >
                        Storage
                      </TabsTrigger>
                      <TabsTrigger 
                        value="news" 
                        className="text-sm data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm px-3.5 py-1"
                      >
                        News
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Card className="border rounded-xl shadow-md">
                      <CardContent className="p-5">
                        <div className="w-8 h-8 mb-2">
                          <img src="/google-drive.svg" alt="Google Drive" className="w-full h-full" />
                        </div>
                        <h4 className="text-base font-semibold mb-3">Google Drive</h4>
                        <p className="text-sm text-[#71717A] mb-3">Connect Google Drive to Delphis to integrate data.</p>
                        <Button variant="outline" size="sm" className="w-fit">
                          Connect
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border rounded-xl shadow-md">
                      <CardContent className="p-5">
                        <div className="w-8 h-8 mb-2">
                          <img src="/one-drive.svg" alt="One Drive" className="w-full h-full" />
                        </div>
                        <h4 className="text-base font-semibold mb-3">One Drive</h4>
                        <p className="text-sm text-[#71717A] mb-3">Connect OneDrive to Delphis to integrate data.</p>
                        <Button variant="outline" size="sm" className="w-fit">
                          Connect
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border rounded-xl shadow-md">
                      <CardContent className="p-5">
                        <div className="w-8 h-8 mb-2">
                          <img src="/dropbox.svg" alt="Dropbox" className="w-full h-full" />
                        </div>
                        <h4 className="text-base font-semibold mb-3">Dropbox</h4>
                        <p className="text-sm text-[#71717A] mb-3">Connect Dropbox to Delphis to integrate data.</p>
                        <Button variant="outline" size="sm" className="w-fit">
                          Connect
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="forwarding">
              <div className="space-y-8">
                {/* Email Forwarding Table */}
                <div className="rounded-lg border border-[#E4E4E7]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E4E4E7]">
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">E-mail</th>
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Status</th>
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Files Received</th>
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Last File Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailForwarding.map((item, index) => (
                        <tr key={index} className="border-b border-[#E4E4E7] last:border-0">
                          <td className="py-4 px-4">
                            <span className="text-sm">{item.email}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs px-2 py-1 rounded bg-[#18181B] text-white">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm">{item.filesReceived}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm">{item.lastFileReceived}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bots Section */}
                <div>
                  <h3 className="text-[#09090B] text-[20px] font-semibold leading-[32px] tracking-[-0.4px] font-sans mb-4">Bots</h3>
                  <div className="rounded-lg border border-[#E4E4E7]">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#E4E4E7]">
                          <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Bot</th>
                          <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Status</th>
                          <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Files Received</th>
                          <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Last File Received</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bots.map((bot, index) => (
                          <tr key={index} className="border-b border-[#E4E4E7] last:border-0">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <img src={bot.icon} alt={bot.name} className="w-5 h-5" />
                                <span className="text-sm">{bot.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-xs px-2 py-1 rounded bg-[#18181B] text-white">
                                {bot.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm">{bot.filesReceived}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm">{bot.lastFileReceived}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscriptions">
              <div className="mt-8">
                <h3 className="text-[#09090B] text-[20px] font-semibold leading-[32px] tracking-[-0.4px] font-sans mb-4">Subscriptions</h3>
                
                <div className="rounded-lg border border-[#E4E4E7]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E4E4E7]">
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Customer</th>
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Channel</th>
                        <th className="text-left py-3 px-4 text-[#71717A] font-normal text-sm">Status</th>
                        <th className="w-[50px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((item, index) => (
                        <tr key={index} className="border-b border-[#E4E4E7] last:border-0">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {item.type === "Youtube Channel" ? (
                                <img src="/youtube.svg" alt="YouTube" className="w-5 h-5" />
                              ) : (
                                <AuthorIcon />
                              )}
                              <span className="text-sm">{item.type}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm">{item.channel}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs px-2 py-1 rounded bg-[#18181B] text-white">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 