import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";

export function Profile() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState("Alexander McQueen");
  const [email, setEmail] = useState("alexander.mcqueen@gmail.com");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
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
    <div>
      {!isEditMode ? (
        <div className="mt-4 md:mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Profile Settings</h2>
            <Button variant="outline" onClick={handleEditClick} className="hidden md:block">
              Edit Profile Settings
            </Button>
          </div>

          <div className="md:mt-6 mt-4">
            <div className="border rounded-lg shadow-sm px-4 pt-6 pb-5 md:px-0 md:py-0 md:border-none md:shadow-none md:rounded-none">
              <div>
                <h3 className="text-sm font-medium mb-2">Profile Photo</h3>
                <div className="w-14 h-14 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Profile"
                    className="h-10 w-10 object-cover rounded-md"
                  />
                </div>
              </div>

              <div className="flex items-start gap-x-52 gap-y-5 md:gap-y-0 flex-wrap md:my-4 text-sm">
                <div className="md:mb-4">
                  <h3 className="font-medium md:mb-1">Your Name</h3>
                  <p className="font-semibold text-secondary-foreground/80">{name}</p>
                </div>

                <div className="md:mb-4">
                  <h3 className="font-medium md:mb-1">Your Email</h3>
                  <p className="font-semibold text-secondary-foreground/80">{email}</p>
                </div>

                <div className="md:mb-4">
                  <h3 className="font-medium md:mb-1">Your Password</h3>
                  <p className="font-semibold text-secondary-foreground/80">******************</p>
                </div>
              </div>
            </div>

            <div className="mt-5 md:mt-0 border rounded-lg shadow-sm px-4 pt-6 pb-4 md:px-0 md:py-0 md:border-none md:shadow-none md:rounded-none">
              <div className="md:mb-8 mb-6 md:mt-5">
                <h3 className="text-base font-medium mb-3">2 Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <span className="text-sm">
                    <span className="hidden md:block">2 Factor Authentication</span>
                    <span className="md:hidden">Enable 2FA</span>
                  </span>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>
              </div>

              <div className="md:mb-8 mb-6">
                <h3 className="text-base font-medium mb-3">Delete User</h3>
                <div className="flex items-center justify-between md:p-4 md:border rounded-lg bg-card">
                  <p className="text-sm hidden md:block">Delete your User by using this button</p>
                  <Button variant="destructiveStrong" size="sm" className="w-full md:w-auto text-sm md:text-xs">
                    Delete User
                  </Button>
                </div>
              </div>

              <div className="md:mb-8 mb-0">
                <h3 className="text-base font-medium mb-3">Your Password</h3>
                <div className="flex items-center justify-between md:p-4 md:border rounded-lg bg-card">
                  <p className="text-sm hidden md:block">To change your password proceed with the corresponding flow</p>
                  <Button variant="default" size="sm" className="w-full md:w-auto text-sm md:text-xs">
                    Change Your Password
                  </Button>
                </div>
              </div>
            </div>
            <div className="w-full md:hidden mt-5">
              <Button variant="outline" onClick={handleEditClick} className="w-full">
                Edit Profile Settings
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 md:mt-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Profile Settings</h2>
            <div className="hidden md:flex space-x-2">
              <Button variant="outline" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </div>
          </div>

          <div className="md:mt-6 mt-4 space-y-6">
            <div className="space-y-2 border p-4 rounded-lg shadow-sm md:rounded-none md:border-none md:shadow-none md:px-0 md:py-0">
              <h3 className="text-sm font-medium">Profile Picture</h3>
              <div className="md:border md:rounded-lg md:px-4 md:py-2">
                <div className="flex flex-col gap-y-3 md:gap-y-0 md:flex-row md:items-center justify-between">
                  <p className="text-sm">Browse files to upload a new profile picture</p>
                  <Input type="file" className="hidden" ref={fileInputRef} accept="image/*" />
                  <Button variant="default" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-5 border p-4 rounded-lg shadow-sm md:rounded-none md:border-none md:shadow-none md:px-0 md:py-0">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Your Name</h3>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Input your name"
                  className="placeholder:text-muted-foreground/80 text-sm"
                />
                <p className="text-sm text-muted-foreground/80">
                  This is your public display name. It can be your real name or a pseudonym.
                </p>
              </div>

              <div className="space-y-2 md:mt-6">
                <h3 className="text-sm font-medium">Email</h3>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Input your email address"
                  className="placeholder:text-muted-foreground/80 text-sm"
                />
                <p className="text-sm text-muted-foreground/80">
                  You can manage verified email addresses in your email settings.
                </p>
              </div>
            </div>

            <div className="md:hidden flex flex-col gap-y-4">
              <Button variant="outline" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
