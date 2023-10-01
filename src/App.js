import './App.scss';
import "bootstrap/dist/js/bootstrap.bundle";
import { useAuthContext } from 'contexts/AuthContext';
import Routes from "pages/Routes"

function App() {

  const { isAppLoading } = useAuthContext()

  if (isAppLoading)
    return (
      <div className="loader-container">
        <span className="loader"></span>
      </div>
    )

  return (
    <>
      <Routes />
    </>
  );
}

export default App;
