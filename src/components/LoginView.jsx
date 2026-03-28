import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { InfoBanner } from "./common/InfoBanner";

export function LoginView({ message, messageType, onLogin, onDismiss }) {
  const form = useForm({
    defaultValues: {
      email: "admin@edumerge.local",
      password: "Admin@123",
    },
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Admission Management Login</CardTitle>
          <CardDescription>Use seeded credentials for Admin, Officer, or Management.</CardDescription>
        </CardHeader>
        <CardContent>
          <InfoBanner message={message} type={messageType} onClose={onDismiss} />
          <form className="space-y-4" onSubmit={form.handleSubmit(onLogin)}>
            <div>
              <Label>Email</Label>
              <Input type="email" {...form.register("email", { required: true })} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" {...form.register("password", { required: true })} />
            </div>
            <Button className="w-full" type="submit">
              Login
            </Button>
            <p className="text-xs text-muted-foreground">
              admin@edumerge.local / Admin@123 <br />
              officer@edumerge.local / Officer@123 <br />
              management@edumerge.local / Manager@123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

