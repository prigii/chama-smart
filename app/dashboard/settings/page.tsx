"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { updateUser } from "@/lib/actions";
import { Upload, User, Smartphone, CreditCard, Landmark } from "lucide-react";
import { IntegrationCard } from "@/components/integrations/integration-card";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  // User Profile State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Chama Settings State (Stub)
  const [chamaSettings, setChamaSettings] = useState({
    paybill: "123456",
    accountNumber: "CHAMA_ACC_001",
    tillNumber: "",
  });

  // Initialize profile state from session
  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: (session.user as any).phone || "",
        password: "",
      });
      setProfilePicture((session.user as any).avatarUrl || null);
    }
  }, [session]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!session?.user?.id) {
      toast.error("Session not found");
      setLoading(false);
      return;
    }

    // TODO: Upload profile picture to storage service (e.g., UploadThing)
    // For now, we'll just update the text fields
    if (profilePictureFile) {
      toast.info("Profile picture upload will be implemented with UploadThing");
    }

    // Call update action
    const result = await updateUser(session.user.id, {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      password: profile.password || undefined,
      role: session.user.role as any, // Preserve role
    });

    if (result.success) {
      toast.success("Profile updated successfully");
      setProfile({ ...profile, password: "" }); // Clear password field
      await update(); // Update session
    } else {
      toast.error(String(result.error));
    }
    setLoading(false);
  };

  const handleChamaUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Stub - In production, this would save to database
    toast.success("Chama settings saved (Demo mode)");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isAdmin && <TabsTrigger value="chama">Chama Settings</TabsTrigger>}
          {isAdmin && <TabsTrigger value="integrations">Integrations</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                      {profilePicture ? (
                        <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-10 w-10" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="profile-picture"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('profile-picture')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max. 2MB)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="+254..."
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="password">New Password (Optional)</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={profile.password}
                    onChange={(e) => setProfile({...profile, password: e.target.value})}
                    placeholder="Leave blank to keep current"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="chama" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Chama Configuration</CardTitle>
                <CardDescription>General settings for your group</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChamaUpdate} className="space-y-4 max-w-lg">
                  <div className="space-y-2">
                    <Label htmlFor="paybill">M-Pesa Paybill Number</Label>
                    <Input 
                      id="paybill" 
                      value={chamaSettings.paybill}
                      onChange={(e) => setChamaSettings({...chamaSettings, paybill: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account">Account Name/Number</Label>
                    <Input 
                      id="account" 
                      value={chamaSettings.accountNumber}
                      onChange={(e) => setChamaSettings({...chamaSettings, accountNumber: e.target.value})}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="till">M-Pesa Till Number</Label>
                    <Input 
                      id="till" 
                      value={chamaSettings.tillNumber}
                      onChange={(e) => setChamaSettings({...chamaSettings, tillNumber: e.target.value})}
                      placeholder="Enter Buy Goods Till Number"
                    />
                  </div>

                  <Button type="submit">Save Configurations</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="integrations" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <IntegrationCard 
                title="M-Pesa (Daraja)"
                description="Connect Safaricom M-Pesa for instant payments and STK Push."
                type="MPESA"
                icon={<Smartphone className="w-8 h-8 text-green-600" />}
              />
              <IntegrationCard 
                title="Paystack"
                description="Accept card payments and bank transfers globally."
                type="PAYSTACK"
                icon={<CreditCard className="w-8 h-8 text-blue-600" />}
              />
              <IntegrationCard 
                title="Bank (KCB/Equity)"
                description="Receive automated alerts from your bank account."
                type="BANK"
                icon={<Landmark className="w-8 h-8 text-purple-600" />}
              />
            </div>
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
}
