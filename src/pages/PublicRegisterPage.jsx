import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, readError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";

const roles = ["OFFICER", "MANAGEMENT"];

export function PublicRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });

  async function onSubmit(values) {
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      toast.success("Registration successful! Please login.");
      form.reset({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "OFFICER",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const message = readError(error);
      if (message === "Access token is required") {
        toast.error("Self-registration is disabled. Login as Admin and create users from Register User.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Register as a new user to access the admission system.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <Label>Full Name</Label>
              <Input {...form.register("name", { required: true })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...form.register("email", { required: true })} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" {...form.register("password", { required: true, minLength: 6 })} />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" {...form.register("confirmPassword", { required: true })} />
            </div>
            <div>
              <Label>Role</Label>
              <Select {...form.register("role")}>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary underline">
                Login here
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
