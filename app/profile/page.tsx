import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  // Placeholder data
  const user = {
    name: "Jane Doe",
    username: "janedoe",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    followers: 120,
    following: 75,
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
        <Avatar className="h-32 w-32">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          <div className="flex gap-4 mt-4 justify-center md:justify-start">
            <span><strong>{user.followers}</strong> Followers</span>
            <span><strong>{user.following}</strong> Following</span>
          </div>
          <Button className="mt-4">Follow</Button>
        </div>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <p className="text-muted-foreground">User's recent activities (e.g., posts, comments) will be displayed here.</p>
          </div>
        </TabsContent>
        <TabsContent value="followers" className="mt-4">
           <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <p className="text-muted-foreground">A list of users who follow this person will be displayed here.</p>
          </div>
        </TabsContent>
        <TabsContent value="following" className="mt-4">
           <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <p className="text-muted-foreground">A list of users this person follows will be displayed here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
