import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DashboardSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
      <p className="text-muted-foreground mb-8">Update your profile, email, and password.</p>
      
      <div className="space-y-8">
        <section className="border rounded-lg p-6 bg-card/80">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <form className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" placeholder="Your display name" />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" />
            </div>
            <Button>Update Profile</Button>
          </form>
        </section>

        <section className="border rounded-lg p-6 bg-card/80">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button>Change Password</Button>
          </form>
        </section>
      </div>
    </div>
  )
}
