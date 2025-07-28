import AppRoutes from "../src/routes/index";
import { useAuth } from "./auth/AuthContext";
import { LoadingPage } from "./components/LoadingPage";

const App: React.FC = () => {
  const { isLoading } = useAuth();
  return <>{isLoading ? <LoadingPage /> : <AppRoutes />}</>;
};

export default App;