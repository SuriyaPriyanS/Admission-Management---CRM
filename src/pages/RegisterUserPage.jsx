import { useForm } from "react-hook-form";
import { api, readError } from "../lib/api";
import { useAppDispatch } from "../app/hooks";
import { showMessage } from "../features/app/appSlice";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";

export function RegisterUserPage() {
  const dispatch = useAppDispatch();
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "OFFICER",
    },
  });

  async function onSubmit(values) {
    try {
      await api.post("/auth/register", values);
      dispatch(showMessage({ message: "User created successfully.", type: "success" }));
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "OFFICER",
      });
    } catch (error) {
      dispatch(showMessage({ message: readError(error), type: "error" }));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create User (After Login)</CardTitle>
        <CardDescription>Admin can create Officer or Management users from this protected route.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 md:max-w-xl" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Label>Name</Label>
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
            <Label>Role</Label>
            <Select {...form.register("role")}>
              <option value="OFFICER">OFFICER</option>
              <option value="MANAGEMENT">MANAGEMENT</option>
              <option value="ADMIN">ADMIN</option>
            </Select>
          </div>
          <Button type="submit">Create User</Button>
        </form>
      </CardContent>
    </Card>
  );
}

