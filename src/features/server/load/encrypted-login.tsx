import RouterLink from "@/components/RouterLink";
import { useAppForm } from "@/hooks/use-app-form";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod/v4";

type Props = {
  onSubmit: (password: string) => void;
};

const formSchema = z.object({
  password: z.string().nonempty(),
});

type FormSchema = z.input<typeof formSchema>;

const defaultValues: FormSchema = {
  password: "",
};

const formOpts = formOptions({
  defaultValues,
  validators: {
    onSubmit: formSchema,
  },
});

export default function EncryptedLogin({ onSubmit }: Props) {
  const form = useAppForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      onSubmit(value.password);
    },
  });

  return (
    <Container sx={{ py: 2 }}>
      <Card>
        <CardHeader
          title="Encrypted Server"
          subheader="This server config is encrypted with a password, please enter the password below"
          action={
            <Button
              component={RouterLink}
              to="/servers/create"
              sx={{ my: 1, mr: 1 }}
            >
              Back
            </Button>
          }
        />
        <CardContent sx={{ py: 0 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <Stack spacing={3}>
              <form.AppField
                name="password"
                children={(field) => (
                  <field.TextField
                    variant="outlined"
                    size="medium"
                    label="Password"
                    helperText="Enter password to decrypt server config"
                  />
                )}
              />

              <Button type="submit" variant="contained">
                Decrypt
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
