import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import MdiArrowDownDrop from "~icons/mdi/arrow-down-drop";
import FormValidIndicator from "./FormValidIndicator";
import AccordionDetails from "@mui/material/AccordionDetails";
import Stack from "@mui/material/Stack";

type Props = {
  title: string;
  valid: boolean;

  children?: React.ReactNode;
};

export default function FormSectionAccordion({
  title,
  valid,
  children,
}: Props) {
  return (
    <Accordion elevation={2}>
      <AccordionSummary
        expandIcon={<MdiArrowDownDrop width={28} height={28} />}
      >
        <Typography variant="h6">
          <FormValidIndicator valid={valid} />
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>{children}</Stack>
      </AccordionDetails>
    </Accordion>
  );
}
