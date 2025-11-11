import {
  Autocomplete,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import QRCode from "react-qr-code";
import { useLocalStorage, useMap } from "usehooks-ts";
import { useSSE } from "./hooks/use-sse.hook";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import UploadButton from "./components/upload-button.component";

export interface Teacher {
  fio: string;
  io: string;
  phoneNumber: string;
}

const fakeItem = {
  fio: "Вейсерт Полина Вадимовна",
  io: "Вейсерт П.В.",
  phoneNumber: "79620432675",
};

const toOption = <T extends Teacher>(
  item: T
): T & { label: string; value: string } => {
  return {
    ...item,
    label: `${item.fio} - ${item.phoneNumber}`,
    value: item.phoneNumber,
  };
};
const Form = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useLocalStorage("teachers", []);

  const [selected, setSelected] = useState([]);

  const [input, setInput] = useState("");

  const options = teachers.map(toOption);
  const optionsWithoutSelected = useMemo(() => {
    const selectedPhones = selected.map((item) => item.phoneNumber);
    return options.filter(
      (option) => selectedPhones.indexOf(option.value) === -1
    );
  }, [options, selected]);

  const handleFileChange = async (file: File) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          "http://localhost:3004/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setTeachers([fakeItem, ...response.data]);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const handleSendMessage = () => {
    const messages = selected.map((teacher) => {
      const text = input.replace("{{ИО}}", teacher.io);
      return {
        phoneNumber: teacher.phoneNumber,
        text,
      };
    });

    setIsLoading(true);
    axios.post("http://localhost:3004/send", messages).finally(() => {
      setIsLoading(false);
    });

    // Add your message sending logic here
  };

  return (
    <Stack spacing={4}>
      <Autocomplete
        fullWidth
        value={selected}
        options={optionsWithoutSelected}
        renderInput={(params) => (
          <TextField {...params} label="Учителя" size="small" />
        )}
        onChange={(_, v) => {
          setSelected(v);
        }}
        multiple
      />
      <TextField
        label="Сообщение"
        size="small"
        multiline
        minRows={3}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />
      <UploadButton onFileChange={handleFileChange}>
        {teachers.length ? "Обновить CSV" : "Загрузить CSV"}
      </UploadButton>
      {input && (
        <Stack spacing={1}>
          <Typography variant="h6">Пример сообщения:</Typography>
          {selected.map((teacher, index) => (
            <Typography key={index}>
              {input.replace("{{ИО}}", teacher.io)}
            </Typography>
          ))}
        </Stack>
      )}
      <Button
        variant="contained"
        disabled={!selected.length || !input || isLoading}
        onClick={handleSendMessage}
      >
        {isLoading ? "Загрузка" : "Отправить сообщение"}
      </Button>
    </Stack>
  );
};

const Auth = () => {
  const isLoading = false;
  const payload = useSSE<string | null>("qr");
  useEffect(() => {
    axios.get("http://localhost:3004").then((res) => {});
  }, []);

  return (
    <Stack alignItems="center" spacing={4}>
      <Typography variant="h5">Пожалуйста отсканируйте QR-CODE ниже</Typography>
      {isLoading || !payload ? (
        <Typography variant="h5">Загрузка...</Typography>
      ) : (
        <QRCode value={payload ?? ""} size={300} />
      )}
    </Stack>
  );
};
function App() {
  const [isAuth, setIsAuth] = useLocalStorage("isAuth", true);
  useEffect(() => {
    axios.get("http://localhost:3004").then((res) => {});
  }, []);

  useSSE(
    "authenticated",
    () => {
      console.log("cb");
      setIsAuth(false);
    },
    isAuth
  );

  return <Container maxWidth="sm">{isAuth ? <Auth /> : <Form />}</Container>;
}

export default App;
