import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, User } from "lucide-react";

export default function ProfilePage() {
  // Mock user data - replace with actual user data from your auth system
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/placeholder-avatar.jpg", // Replace with actual avatar URL
    initials: "JD",
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg font-semibold">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Profile Information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-base font-semibold">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-base font-semibold">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Badge variant="secondary" className="w-fit">
                Active User
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
