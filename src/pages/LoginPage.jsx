import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { clearMessage, showMessage } from "../features/app/appSlice";
import { loginThunk } from "../features/auth/authSlice";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { InfoBanner } from "../components/common/InfoBanner";

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user, status, error } = useAppSelector((state) => state.auth);
  const { message, messageType } = useAppSelector((state) => state.app);

  const form = useForm({
    defaultValues: {
      email: "admin@edumerge.local",
      password: "Admin@123",
    },
  });

  useEffect(() => {
    if (token && user) {
      if (user.role === "OFFICER") {
        navigate("/applicants", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [token, user, navigate]);

  async function onSubmit(values) {
    const result = await dispatch(loginThunk(values));
    if (loginThunk.rejected.match(result)) {
      dispatch(showMessage({ message: result.payload || error || "Login failed", type: "error" }));
      return;
    }

    dispatch(showMessage({ message: "Login successful", type: "success" }));
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Admission Management Login</CardTitle>
          <CardDescription>Role-based routing using React Router and Redux auth state.</CardDescription>
        </CardHeader>
        <CardContent>
          <InfoBanner message={message} type={messageType} onClose={() => dispatch(clearMessage())} />
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <Label>Email</Label>
              <Input type="email" {...form.register("email", { required: true })} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" {...form.register("password", { required: true })} />
            </div>
            <Button className="w-full" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Signing in..." : "Login"}
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
