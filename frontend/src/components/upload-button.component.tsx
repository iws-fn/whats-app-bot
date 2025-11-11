import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { ReactNode } from "react";

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
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <label htmlFor="upload-button-file">
      <Input
        accept={accept}
        id="upload-button-file"
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
