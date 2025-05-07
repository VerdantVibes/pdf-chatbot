import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Plus, Copy, Upload, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  position: z.string().optional(),
});

const companyFormSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  investorType: z.string({
    required_error: "Please select an investor type.",
  }),
  marketsOfInterest: z.string().optional(),
});

const inviteFormSchema = z.object({
  colleagueEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const positions = ["Option 1", "Option 2"];

const investorTypes = ["Option 1", "Option 2"];

const assetClasses = ["Option 1", "Option 2"];

const slideContent = [
  {
    title: "Create an account",
    subtitle: "Let's set up your account with Delphis AI",
  },
  {
    title: "Company Setup",
    subtitle: "Let's set up your account with Delphis AI",
  },
  {
    title: "Invite teammates",
    subtitle: "Let's set up your account with Delphis AI",
  },
  {
    title: "Let's forward files to Delphis",
    subtitle: "Forward all the research papers, documents and files that you would like to see in your knowledge base",
  },
  {
    title: "Upload Files to Delphis AI",
    subtitle: "Forward all the research papers, documents and files that you would like to see in your knowledge base",
  },
  {
    title: "Set up workspace",
    subtitle: "Configure your workspace settings",
  },
  {
    title: "Let's connect you with some apps",
    subtitle: "Forward all the research papers, documents and files that you would like to see in your knowledge base",
  },
];

interface UploadedFile {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "success";
}

export function SignUpBeta() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 7;
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "sample1",
      name: "auctions.pdf",
      progress: 79,
      status: "uploading",
    },
    {
      id: "sample2",
      name: "auctions.pdf",
      progress: 100,
      status: "success",
    },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("podcasts");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      position: "",
    },
  });

  const companyForm = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "",
      investorType: "",
      marketsOfInterest: "",
    },
  });

  const inviteForm = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      colleagueEmail: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    if (currentPage === 0) {
      nextPage();
    }
  }

  function onCompanySubmit(values: z.infer<typeof companyFormSchema>) {
    console.log(values);
    if (currentPage === 1) {
      nextPage();
    }
  }

  function onInviteSubmit(values: z.infer<typeof inviteFormSchema>) {
    console.log(values);
    setInvitedEmails([...invitedEmails, values.colleagueEmail]);
    inviteForm.reset();
  }

  function onContinueInvite() {
    if (currentPage === 2) {
      nextPage();
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploadedFiles([...uploadedFiles, ...newFiles]);

    newFiles.forEach((file) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadedFiles((prevFiles) =>
            prevFiles.map((f) => (f.id === file.id ? { ...f, progress: 100, status: "success" } : f))
          );
        } else {
          setUploadedFiles((prevFiles) => prevFiles.map((f) => (f.id === file.id ? { ...f, progress } : f)));
        }
      }, 500);
    });
  };

  const deleteFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
  };

  return (
    <div className={`${currentPage === 6 ? "grid grid-cols-1" : "grid md:grid-cols-3 grid-cols-1"} min-h-screen`}>
      {/* Mobile Logo */}
      <div className="md:hidden fixed top-0 left-0 right-0 flex justify-center pt-8 bg-background z-10">
        <div className="flex items-center gap-2">
          <img 
            src="/delphis.svg" 
            alt="Delphis AI"
            className="w-5 h-5" 
          />
          <span className="text-[14px] leading-none font-semibold text-[#18181B] font-sans">
            Delphis AI
          </span>
        </div>
      </div>

      {currentPage !== 6 && (
        <div className="bg-[#f2f2f2] col-span-1 hidden md:flex items-center justify-center" />
      )}

      <div
        className={`${
          currentPage === 6 ? "col-span-1" : "md:col-span-2 col-span-1"
        } min-h-[inherit] flex items-center justify-center relative md:pt-0 pt-16`}
      >
        <div className="hidden md:flex items-center justify-center max-w-sm mx-auto absolute top-5 left-0 right-0">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="w-8 h-8 flex items-center justify-center mr-2"
            aria-label="Previous page"
          >
            <ArrowLeft className={`w-5 h-5 ${currentPage === 0 ? "text-neutral-400/75" : "text-black"}`} />
          </button>

          <div className="flex items-center space-x-2 mx-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={`h-[0.2088rem] w-8 ${
                  index <= currentPage ? "bg-black" : "bg-[#E5E5E5]"
                } rounded-full transition-all duration-300`}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className="w-8 h-8 flex items-center justify-center ml-2"
            aria-label="Next page"
          >
            <ArrowRight
              className={`w-5 h-5 ${currentPage === totalPages - 1 ? "text-neutral-400/75" : "text-black"}`}
            />
          </button>
        </div>
        <div className="w-full max-w-4xl absolute top-[52.5%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentPage === 0 ? (
                  <div className="max-w-sm mx-auto">
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-semibold mb-1">Create an account</h1>
                      <p className="text-neutral-500 text-sm">Let's set up your account with Delphis AI</p>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Input your name"
                                  className="rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="@usernameavailable"
                                  className="rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">E-mail Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Input your e-mail address"
                                  className="rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Your Position</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="rounded-md focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Select position (optional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {positions.map((position) => (
                                    <SelectItem key={position} value={position}>
                                      {position}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-6">
                          <Button type="submit" className="w-full">
                            Sign Up
                          </Button>
                        </div>
                      </form>
                    </Form>

                    <p className="text-xs text-center text-neutral-500 mt-4 max-w-52 mx-auto">
                      By clicking continue, you agree to our{" "}
                      <Link to="/terms" className="underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                ) : currentPage === 1 ? (
                  <div className="max-w-sm mx-auto">
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-semibold mb-1">Company Setup</h1>
                      <p className="text-neutral-500 text-sm">Let's set up your account with Delphis AI</p>
                    </div>

                    <Form {...companyForm}>
                      <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-2.5">
                        <FormField
                          control={companyForm.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Company Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Input company name"
                                  className="rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={companyForm.control}
                          name="investorType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Investor Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="rounded-md focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Select your investor type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {investorTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={companyForm.control}
                          name="marketsOfInterest"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Markets of Interest</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="rounded-md focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Select asset class (optional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {assetClasses.map((assetClass) => (
                                    <SelectItem key={assetClass} value={assetClass}>
                                      {assetClass}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-6">
                          <Button type="submit" className="w-full">
                            Continue with Sign Up
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                ) : currentPage === 2 ? (
                  <div className="max-w-sm mx-auto">
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-semibold mb-1">Invite teammates</h1>
                      <p className="text-neutral-500 text-sm">Let's set up your account with Delphis AI</p>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-sm font-medium">Input E-mail Address</label>
                        <Form {...inviteForm}>
                          <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="flex space-x-2 mt-1">
                            <FormField
                              control={inviteForm.control}
                              name="colleagueEmail"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      placeholder="Input your colleague's email address"
                                      className="rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" variant={"outline"} className="whitespace-nowrap">
                              Invite
                            </Button>
                          </form>
                        </Form>
                      </div>

                      <button
                        className="flex items-center text-sm font-medium"
                        onClick={() => inviteForm.setFocus("colleagueEmail")}
                      >
                        <Plus className="h-3 w-3 mr-0.5" />
                        <span className="underline">Invite more people</span>
                      </button>

                      {invitedEmails.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {invitedEmails.map((email, index) => (
                            <div key={index} className="text-sm bg-neutral-50 p-2 rounded-md">
                              {email}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-6">
                        <Button onClick={onContinueInvite} className="w-full">
                          Continue with Sign Up
                        </Button>
                        <Button variant={"ghost"} onClick={nextPage} className="w-full text-neutral-500 text-sm mt-2">
                          Setup Later
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : currentPage === 3 ? (
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-semibold mb-1">Let's forward files to Delphis</h1>
                      <p className="text-neutral-500 text-sm mx-auto max-w-sm">
                        Forward all the research papers, documents and files that you would like to see in your
                        knowledge base
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <div className="relative">
                        <div className="text-center pb-2">
                          <button
                            className="text-black text-2xl font-semibold underline flex items-center justify-center mx-auto"
                            onClick={() => copyToClipboard("Andrey@Delphis-AI.com")}
                          >
                            Andrey@Delphis-AI.com
                            <Copy className={`h-4 w-4 ml-2 ${copied ? "text-green-500" : "text-gray-400"}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex md:grid md:grid-cols-3 gap-4 pt-4 overflow-x-auto px-4 md:px-0">
                        <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                          <CardContent className="px-5 pt-1 pb-5 flex flex-col">
                            <div className="w-6 h-6 flex items-center justify-center text-blue-600 mb-1.5 mt-3">
                              <img src="/microsoft-office-teams.svg" alt="Microsoft Teams" className="aspect-square" />
                            </div>
                            <p className="text-sm font-semibold mb-3">Microsoft Teams</p>
                            <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                              Connect
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                          <CardContent className="px-5 pt-1 pb-5 flex flex-col">
                            <div className="w-6 h-6 flex items-center justify-center text-green-600 mb-1.5 mt-3">
                              <img src="/whatsapp.svg" alt="WhatsApp" className="aspect-square" />
                            </div>
                            <p className="text-sm font-semibold mb-3">WhatsApp</p>
                            <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                              Connect
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                          <CardContent className="px-5 pt-1 pb-5 flex flex-col">
                            <div className="w-6 h-6 flex items-center justify-center text-blue-500 mb-1.5 mt-3">
                              <img src="/telegram.svg" alt="Telegram" className="aspect-square" />
                            </div>
                            <p className="text-sm font-semibold mb-3">Telegram</p>
                            <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                              Connect
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="pt-6 max-w-sm mx-auto">
                        <Button onClick={nextPage} className="w-full">
                          Continue with Sign Up
                        </Button>
                        <Button variant="ghost" onClick={nextPage} className="w-full text-neutral-500 text-sm mt-2">
                          Setup Later
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : currentPage === 4 ? (
                  <div className="max-w-sm mx-auto">
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-semibold mb-1">Upload Files to Delphis AI</h1>
                      <p className="text-neutral-500 text-sm">
                        Forward all the research papers, documents and files that you would like to see in your
                        knowledge base
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div className="pb-3">
                        <div
                          className={`border shadow-sm bg-neutral-50 rounded-lg p-6 text-center ${
                            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Upload className="h-6 w-6 text-neutral-600 mb-4" />
                            <p className="font-semibold text-neutral-800 text-sm">
                              Drop File or Browse your local Computer
                            </p>
                            <p className="text-neutral-500 text-xs">Formats: PDF, TXT, DOC,</p>
                            <Button variant="outline" size="sm" className="mt-5" onClick={handleBrowseFiles}>
                              Browse Files
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.txt,.doc,.docx"
                              className="hidden"
                              onChange={handleFileInputChange}
                              multiple
                            />
                          </div>
                        </div>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className={`space-y-3 max-h-48 ${uploadedFiles.length > 2 ? "overflow-y-auto pr-1" : ""}`}>
                          {uploadedFiles.map((file) => (
                            <div key={file.id} className="border rounded-lg p-4 bg-white shadow-sm">
                              <div className="flex items-start">
                                <div className="mr-3 mt-0.5">
                                  <img
                                    src="/src/assets/pdficon.svg"
                                    alt="PDF Icon"
                                    className="contrast-200 saturate-50"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-neutral-900">Actionable Auctions</p>
                                  <p className="text-sm text-neutral-500 -mb-1">auctions.pdf</p>

                                  {file.status === "uploading" ? (
                                    <div className="flex items-center justify-between gap-8">
                                      <div className="w-full bg-[#D4EBE9] rounded-full h-2 overflow-hidden mt-1">
                                        <div
                                          className="bg-[#2DA395] h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${file.progress}%` }}
                                        ></div>
                                      </div>
                                      <div className="flex justify-end mt-1">
                                        <span className="text-sm text-[#2DA395]">{file.progress}%</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between mt-1.5">
                                      <span className="text-sm text-[#2DA395]">Upload Successful</span>
                                      <button
                                        onClick={() => deleteFile(file.id)}
                                        className="text-[#FF0000] hover:text-[#FF0000]/80 transition-colors"
                                      >
                                        <div className="flex items-center">
                                          <Trash2 className="h-4 w-4" />
                                          <span className="ml-1 text-sm font-semibold">Delete File</span>
                                        </div>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-4">
                        <Button onClick={nextPage} className="w-full">
                          Continue with Sign Up
                        </Button>
                        <Button variant="ghost" onClick={nextPage} className="w-full text-neutral-500 text-sm mt-2">
                          Setup Later
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : currentPage === 5 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-2xl font-semibold mb-1">{slideContent[currentPage].title}</h2>
                    <p className="text-neutral-500 text-sm">{slideContent[currentPage].subtitle}</p>

                    <div className="mt-12 text-center">
                      <p className="text-neutral-700">This is page {currentPage + 1} of the signup flow</p>
                      <p className="text-sm text-neutral-500 mt-2">Placeholder content for this step</p>
                    </div>

                    <div className="mt-12 max-w-sm w-full">
                      <Button onClick={nextPage} className="w-full">
                        Continue with Sign Up
                      </Button>
                      <Button variant="ghost" onClick={nextPage} className="w-full text-neutral-500 text-sm mt-2">
                        Setup Later
                      </Button>
                    </div>
                  </div>
                ) : currentPage === 6 ? (
                  <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-semibold mb-1">Let's connect you with some apps</h1>
                      <p className="text-neutral-500 text-sm max-w-md mx-auto">
                        Forward all the research papers, documents and files that you would like to see in your
                        knowledge base
                      </p>
                    </div>

                    <div className="mt-10">
                      <div className="flex justify-center mb-10">
                        <div className="bg-gray-100 rounded-lg p-1 inline-flex">
                          <button
                            onClick={() => setActiveTab("podcasts")}
                            className={`px-3.5 py-1 rounded-lg text-sm font-medium transition-colors ${
                              activeTab === "podcasts" ? "bg-white shadow-sm" : "text-gray-600"
                            }`}
                          >
                            Podcasts
                          </button>
                          <button
                            onClick={() => setActiveTab("storage")}
                            className={`px-3.5 py-1 rounded-lg text-sm font-medium transition-colors ${
                              activeTab === "storage" ? "bg-white shadow-sm" : "text-gray-600"
                            }`}
                          >
                            Storage
                          </button>
                          <button
                            onClick={() => setActiveTab("news")}
                            className={`px-3.5 py-1 rounded-lg text-sm font-medium transition-colors ${
                              activeTab === "news" ? "bg-white shadow-sm" : "text-gray-600"
                            }`}
                          >
                            News
                          </button>
                        </div>
                      </div>

                      <div className="mt-6">
                        {activeTab === "podcasts" && (
                          <div className="flex md:grid md:grid-cols-3 items-center gap-5 overflow-x-auto px-4 md:px-0">
                            <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                              <CardContent className="px-5 pt-3 flex flex-col">
                                <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2 mt-3">
                                  <img src="/spotify.svg" alt="Spotify" className="aspect-square" />
                                </div>
                                <p className="text-base font-semibold mb-3">Spotify</p>
                                <p className="text-sm text-neutral-500 mb-3">
                                  Connect Spotify to Delphis to integrate data.
                                </p>
                                <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                                  Connect
                                </Button>
                              </CardContent>
                            </Card>

                            <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                              <CardContent className="px-5 pt-3 flex flex-col">
                                <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2 mt-3">
                                  <img src="/apple-music.svg" alt="Apple Music" className="aspect-square" />
                                </div>
                                <p className="text-base font-semibold mb-3">Apple Music</p>
                                <p className="text-sm text-neutral-500 mb-3">
                                  Connect Apple Music to Delphis to integrate data.
                                </p>
                                <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                                  Connect
                                </Button>
                              </CardContent>
                            </Card>

                            <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                              <CardContent className="px-5 pt-3 flex flex-col">
                                <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2 mt-3">
                                  <img src="/youtube.svg" alt="Youtube" className="aspect-square" />
                                </div>
                                <p className="text-base font-semibold mb-3">Youtube</p>
                                <p className="text-sm text-neutral-500 mb-3">
                                  Connect Youtube to Delphis to integrate data.
                                </p>
                                <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                                  Connect
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {activeTab === "storage" && (
                          <div className="flex md:grid md:grid-cols-3 items-center gap-5 overflow-x-auto px-4 md:px-0">
                            <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                              <CardContent className="px-5 pt-3 flex flex-col">
                                <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2 mt-3">
                                  <img src="/google-drive.svg" alt="Google Drive" className="aspect-square" />
                                </div>
                                <p className="text-base font-semibold mb-3">Google Drive</p>
                                <p className="text-sm text-neutral-500 mb-3">
                                  Connect Google Drive to Delphis to integrate data.
                                </p>
                                <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                                  Connect
                                </Button>
                              </CardContent>
                            </Card>

                            <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                              <CardContent className="px-5 pt-3 flex flex-col">
                                <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2 mt-3">
                                  <img src="/one-drive.svg" alt="OneDrive" className="aspect-square" />
                                </div>
                                <p className="text-base font-semibold mb-3">OneDrive</p>
                                <p className="text-sm text-neutral-500 mb-3">
                                  Connect OneDrive to Delphis to integrate data.
                                </p>
                                <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                                  Connect
                                </Button>
                              </CardContent>
                            </Card>

                            <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                              <CardContent className="px-5 pt-3 flex flex-col">
                                <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2 mt-3">
                                  <img src="/dropbox.svg" alt="Dropbox" className="aspect-square" />
                                </div>
                                <p className="text-base font-semibold mb-3">Dropbox</p>
                                <p className="text-sm text-neutral-500 mb-3">
                                  Connect Dropbox to Delphis to integrate data.
                                </p>
                                <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                                  Connect
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {activeTab === "news" && (
                          <div className="flex md:grid md:grid-cols-3 items-center gap-5 overflow-x-auto px-4 md:px-0">
                            <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                              <CardContent className="px-5 pt-3 flex flex-col">
                                <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2 mt-3">
                                  <img src="/financial-times.svg" alt="Financial Times" className="aspect-square" />
                                </div>
                                <p className="text-base font-semibold mb-3">Financial Times</p>
                                <p className="text-sm text-neutral-500 mb-3">
                                  Connect Financial Times to Delphis to integrate data.
                                </p>
                                <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                                  Connect
                                </Button>
                              </CardContent>
                            </Card>

                            <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                              <CardContent className="px-5 pt-3 flex flex-col">
                                <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2 mt-3">
                                  <img src="/bloomberg.svg" alt="Bloomberg" className="aspect-square" />
                                </div>
                                <p className="text-base font-semibold mb-3">Bloomberg</p>
                                <p className="text-sm text-neutral-500 mb-3">
                                  Connect Bloomberg to Delphis to integrate data.
                                </p>
                                <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                                  Connect
                                </Button>
                              </CardContent>
                            </Card>

                            <Card className="border rounded-xl shadow-md overflow-hidden min-w-[250px] md:min-w-0">
                              <CardContent className="px-5 pt-3 flex flex-col">
                                <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2 mt-3">
                                  <img src="/telegraph.svg" alt="Telegraph" className="aspect-square" />
                                </div>
                                <p className="text-base font-semibold mb-3">Telegraph</p>
                                <p className="text-sm text-neutral-500 mb-3">
                                  Connect Telegraph to Delphis to integrate data.
                                </p>
                                <Button variant="outline" size="sm" className="w-fit md:w-fit w-full">
                                  Connect
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-12 max-w-sm mx-auto">
                      <Button onClick={nextPage} className="w-full">
                        Continue with Sign Up
                      </Button>
                      <div className="text-center mt-3">
                        <button className="text-neutral-500 text-sm hover:underline">Setup Later</button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
