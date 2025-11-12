import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { ReactNode, useId } from "react";

const Input = styled("input")({
  display: "none",
});

interface UploadButtonProps {
  onFileChange: (file: File) => void;
  children: ReactNode;
  accept?: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  onFileChange,
  children,
  accept = "*/*",
}) => {
  const id = useId(); // Generate unique ID for each instance
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <label htmlFor={id}>
      <Input
        accept={accept}
        id={id}
        type="file"
        onChange={handleFileChange}
      />
      <Button variant="contained" component="span">
        {children}
      </Button>
    </label>
  );
};

export default UploadButton;
