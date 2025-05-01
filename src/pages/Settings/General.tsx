import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";

export function General() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [companyName, setCompanyName] = useState("");
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">General Settings</h2>
        {!isEditMode ? (
          <Button variant="outline" onClick={handleEditClick}>
            Edit General Settings
          </Button>
        ) : (
          <div className="flex justify-end gap-x-2">
            <Button variant="outline" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        )}
      </div>

      {isEditMode ? (
        <>
          <div className="space-y-10">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Company Logo</h3>
              <div className="border rounded-lg px-4 py-2">
                <div className="flex items-center justify-between">
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

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Company Name</h3>
              <Input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Input your company name"
                className="placeholder:text-muted-foreground/80"
              />
              <p className="text-sm text-muted-foreground/80">
                Please set your company name here. A longer description line goes here.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start gap-x-28 flex-wrap">
            <div className="space-y-2">
              <h3 className="text-base font-medium">Company Logo</h3>
              <div className="w-32 h-12 flex items-center">
                <img src={companyLogo || "/slack-logo.png"} alt="Company Logo" className="h-8" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-medium">Company Name</h3>
              <p>{companyName}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-medium">Single Sign On</h3>
            <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
              <label htmlFor="sso-toggle" className="font-medium text-sm">
                Enable Single Sign On
              </label>
              <Switch id="sso-toggle" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-medium">Delete Organization</h3>
            <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
              <p className="text-sm">Delete your Organization by using this button</p>
              <Button variant="destructiveStrong" size="sm">
                Delete Organization
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-medium">Support Information</h3>
            <div className="space-y-2">
              <p className="flex items-center">
                <span className="font-medium mr-2">Email Address:</span>
                <a href="mailto:support@delphisai.com" className="text-primary hover:underline">
                  support@delphisai.com
                </a>
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">Help Center:</span>
                <a href="https://delphisai.com/help-center" className="text-primary hover:underline">
                  https://delphisai.com/help-center
                </a>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
