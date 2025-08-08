import AppRoutes from "../src/routes/index";
import { useAuth } from "./auth/AuthContext";
import { LoadingPage } from "./components/LoadingPage";
import { NotificationProvider } from "./components/notifications";

const App: React.FC = () => {
  const { isLoading } = useAuth();
  return (
    <NotificationProvider>
      {isLoading ? <LoadingPage /> : <AppRoutes />}
    </NotificationProvider>
  );
};

export default App;