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
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Profile Settings</h2>
            <Button variant="outline" onClick={handleEditClick}>
              Edit Profile Settings
            </Button>
          </div>

          <div className="mt-6">
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

            <div className="flex items-start gap-x-52 flex-wrap my-4 text-sm">
              <div className="mb-4">
                <h3 className="font-medium mb-1">Your Name</h3>
                <p className="font-semibold text-secondary-foreground/80">{name}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-1">Your Email</h3>
                <p className="font-semibold text-secondary-foreground/80">{email}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-1">Your Password</h3>
                <p className="font-semibold text-secondary-foreground/80">******************</p>
              </div>
            </div>

            <div className="mb-8 mt-5">
              <h3 className="text-base font-medium mb-3">2 Factor Authentication</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <span className="text-sm">2 Factor Authentication</span>
                <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-base font-medium mb-3">Delete User</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <p className="text-sm">Delete your User by using this button</p>
                <Button variant="destructiveStrong" size="sm">
                  Delete User
                </Button>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-base font-medium mb-3">Your Password</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <p className="text-sm">To change your password proceed with the corresponding flow</p>
                <Button variant="default" size="sm" className="bg-black text-white hover:bg-black/90">
                  Change Your Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Profile Settings</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Profile Picture</h3>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Browse files to upload a new profile picture</p>
                  <Input type="file" className="hidden" ref={fileInputRef} accept="image/*" />
                  <Button variant="default" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Your Name</h3>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Input your name"
                className="placeholder:text-muted-foreground/80"
              />
              <p className="text-sm text-muted-foreground/80">
                This is your public display name. It can be your real name or a pseudonym.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Email</h3>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Input your email address"
                className="placeholder:text-muted-foreground/80"
              />
              <p className="text-sm text-muted-foreground/80">
                You can manage verified email addresses in your email settings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
