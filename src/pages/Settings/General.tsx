import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";

export function General() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [companyName, setCompanyName] = useState("Delphis AI");
  const [companyLogo, setCompanyLogo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
  };

  const handleSaveChanges = () => {
    setIsEditMode(false);
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">General Settings</h2>
        {!isEditMode ? (
          <Button className="hidden md:block" variant="outline" onClick={handleEditClick}>
            Edit General Settings
          </Button>
        ) : (
          <div className="hidden md:flex justify-end gap-x-2">
            <Button variant="outline" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        )}
      </div>

      {isEditMode ? (
        <>
          <div className="space-y-5 md:space-y-10">
            <div className="space-y-2 border p-4 rounded-lg shadow-sm md:rounded-none md:border-none md:shadow-none md:px-0 md:py-0">
              <h3 className="text-sm font-medium">Company Logo</h3>
              <div className="md:border md:rounded-lg md:px-4 md:py-2">
                <div className="flex flex-col gap-y-3 md:gap-y-0 md:flex-row md:items-center justify-between">
                  <p className="text-sm">Browse files to upload a logotype for your company</p>
                  <Input type="file" className="hidden" ref={fileInputRef} accept="image/*" />
                  <Button
                    variant="default"
                    size={"sm"}
                    className="shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 md:space-y-2 border p-4 rounded-lg shadow-sm md:rounded-none md:border-none md:shadow-none md:px-0 md:py-0">
              <h3 className="text-sm font-medium">Company Name</h3>
              <Input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Input your company name"
                className="placeholder:text-muted-foreground/80 text-sm"
              />
              <p className="text-sm text-muted-foreground/80">
                Please set your company name here. A longer description line goes here.
              </p>
            </div>
            <div className="flex flex-col gap-y-4 md:hidden">
              <Button variant="outline" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-y-4 items-start md:gap-x-28 flex-wrap border px-4 py-6 rounded-lg shadow-sm md:rounded-none md:border-none md:shadow-none md:px-0 md:py-0">
            <div className="space-y-2">
              <h3 className="text-base font-medium">Company Logo</h3>
              <div className="w-32 h-12 flex items-center">
                <img src={companyLogo || "/slack-logo.png"} alt="Company Logo" className="h-8" />
              </div>
            </div>

            <div className="space-y-1 md:space-y-2">
              <h3 className="text-base font-medium">Company Name</h3>
              <p className="font-semibold text-secondary-foreground/80 text-base">{companyName}</p>
            </div>
          </div>

          <div className="border px-4 pt-6 pb-4 rounded-lg shadow-sm md:rounded-none md:border-none md:shadow-none md:px-0 md:py-0">
            <div className="space-y-3">
              <h3 className="text-base font-medium">Single Sign On</h3>
              <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
                <label htmlFor="sso-toggle" className="font-medium text-sm">
                  Enable Single Sign On
                </label>
                <Switch id="sso-toggle" />
              </div>
            </div>

            <div className="space-y-3 mt-5 md:mt-8">
              <h3 className="text-base font-medium">Delete Organization</h3>
              <div className="bg-card md:border rounded-lg md:p-4 flex items-center justify-between">
                <p className="text-sm hidden md:block">Delete your Organization by using this button</p>
                <Button variant="destructiveStrong" size="sm" className="w-full text-sm md:w-auto md:text-xs">
                  Delete Organization
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 border px-4 pt-6 pb-4 rounded-lg shadow-sm md:rounded-none md:border-none md:shadow-none md:px-0 md:py-0">
            <h3 className="text-base font-medium">Support Information</h3>
            <div className="md:space-y-2 space-y-4">
              <p className="flex flex-col md:flex-row gap-y-1 md:gap-y-0 md:items-center justify-center md:justify-start">
                <span className="font-medium mr-2">Email Address:</span>
                <a href="mailto:support@delphisai.com" className="text-muted-foreground/80 underline hover:underline">
                  support@delphisai.com
                </a>
              </p>
              <p className="flex flex-col md:flex-row gap-y-1 md:gap-y-0 md:items-center justify-center md:justify-start">
                <span className="font-medium mr-2">Help Center:</span>
                <a
                  href="https://delphisai.com/help-center"
                  className="text-muted-foreground/80 underline hover:underline"
                >
                  https://delphisai.com/help-center
                </a>
              </p>
            </div>
          </div>

          <div className="w-full md:hidden">
            <Button className="w-full" variant="outline" onClick={handleEditClick}>
              Edit General Settings
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
