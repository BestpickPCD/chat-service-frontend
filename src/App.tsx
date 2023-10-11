import { CssBaseline } from "@mui/material";
import { useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import router from "./router";
import "./styles/index.scss";
const App = (): JSX.Element => {
  const content = useRoutes(router);

  return (
    <>
      <CssBaseline />
      {content}
      <ToastContainer />
    </>
  );
};
export default App;
