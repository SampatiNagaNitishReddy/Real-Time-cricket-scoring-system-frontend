import { createContext, useContext, useState ,useEffect} from "react";
import { logoutUser,getCurrentUser } from "../services/authService";
const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    checkAuth();

  }, []);

  const checkAuth = async () => {

    try {

      const userData = await getCurrentUser();

      setUser(userData);

    } catch (err) {

      setUser(null);

    } finally {

      setLoading(false);
    }
  };


  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {

    try {

      await logoutUser();

      setUser(null);

    } catch (err) {

      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);