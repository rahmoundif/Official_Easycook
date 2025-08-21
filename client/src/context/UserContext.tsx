import type { TypeUser } from "@/types/TypeFiles";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

//Interface pour Children Joker du Typage
interface ContextInterface {
  children: ReactNode;
}

//Interface (variable = typage classic avec option Undefined) + SET(variable = typage React.Dispatch<React.SetStateAction<Type> | undefined)
interface UserContextValue {
  // userOnline: string; // Commented out or remove if not used elsewhere
  isConnected: boolean;
  email: string;
  password: string;
  user: TypeUser;
  isAdmin: boolean;
  idUserOnline: number | null;
  userOnline?: TypeUser; // Optional, can be undefined
  isEasterEgg: boolean;
  // setUserOnline: React.Dispatch<React.SetStateAction<string>>; // Commented out or remove if not used elsewhere
  setIsEasterEgg: React.Dispatch<React.SetStateAction<boolean>>;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setUser: React.Dispatch<React.SetStateAction<TypeUser>>;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSubmitSignUp: (e: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDisconnect: () => void;
  handleDeleteSelfAccount: () => void;
  handleUpdateMember: (e: React.FormEvent<HTMLFormElement>) => void;
}

// creation du context
const UserContext = createContext<UserContextValue | undefined>(undefined);

//Creation composant Provider (appliquant le context sur tout les enfants)
export function UserProvider({ children }: ContextInterface) {
  //Initialisation du State avec la conversion du LocalStorage en String.
  const [idUserOnline, setIdUserOnline] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState<TypeUser>({
    name: "",
    email: "",
    password: "",
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userOnline, setUserOnline] = useState<TypeUser>();
  //boulean easterEgg
  const [isEasterEgg, setIsEasterEgg] = useState(false);

  // Verification du Token (cookie-based)
  useEffect(() => {
    if (!isConnected) return;
    // If marked connected but server cookie missing, the next check will reset state
  }, [isConnected]);


  useEffect(() => {
    // Try cookie-based session first, with bearer fallback for mobile browsers blocking third-party cookies
    const token = localStorage.getItem("authToken");
    fetch(`${import.meta.env.VITE_API_URL}/session`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    })
      .then(async (response) => {
        try {
          (await import("@/lib/csrf")).captureCsrfFromResponse(response);
        } catch { }
        return response.json();
      })
      .then((payload) => {
        if (payload?.authenticated) {
          setIsConnected(true);
          setIdUserOnline(payload.userId);
          setIsAdmin(payload.isAdmin ?? payload.user?.admin ?? false);
          setUserOnline(payload.user);
        } else {
          setIsConnected(false);
          setIdUserOnline(null);
          setUserOnline(undefined);
          setIsAdmin(false);
        }
      })
      .catch(() => {
        setIsConnected(false);
        setIdUserOnline(null);
        setUserOnline(undefined);
        setIsAdmin(false);
      });
  }, []);

  // Creation du Token -----------------------------------------

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { ensureCsrf } = await import("@/lib/csrf");
    const csrf = await ensureCsrf();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      // Cookie set by server; store only non-sensitive flags
      setIsConnected(true);
      setIsAdmin(data.isAdmin ?? data.admin);
      setIdUserOnline(data.userId);
      setUserOnline(data);
      // Mobile Safari / some browsers block third-party cookies => store bearer fallback
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      navigate("/Compte");
    } else {
      setIsConnected(false);
      setIdUserOnline(null);
      setUserOnline(undefined);
      navigate("/Compte");
      toast.error("Identifiant ou mot de passe incorrect", {
        style: { background: "#452a00", color: "#fde9cc" },
      });
    }
  }

  async function handleSubmitSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { ensureCsrf } = await import("@/lib/csrf");
    const csrf2 = await ensureCsrf();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrf2 ? { "X-CSRF-Token": csrf2 } : {}),
      },
      credentials: "include",
      body: JSON.stringify(user),
    });
    if (response.ok) {
      const data = await response.json();
      setIsConnected(true);
      setIdUserOnline(data.userId);
      setUserOnline(data);
      setIsAdmin(data.isAdmin ?? data.admin ?? false);
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      navigate("/Compte");
      toast.success("Compte créé avec succès", {
        style: { background: "#452a00", color: "#fde9cc" },
      });
    } else {
      toast.error("Erreur lors de la création du compte", {
        style: { background: "#452a00", color: "#fde9cc" },
      });
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  }

  // Supression Token avec bouton --------------------------------
  async function handleDisconnect() {
    try {
      const token = localStorage.getItem("authToken");
      const csrfCookie = document.cookie
        .split("; ")
        .find((c) => c.startsWith("csrfToken="))
        ?.split("=")[1];
      await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
        method: "GET",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(csrfCookie ? { "X-CSRF-Token": csrfCookie } : {}),
        },
      });
    } catch { }
    setIsConnected(false);
    setIdUserOnline(null);
    setUserOnline(undefined);
    setIsAdmin(false); // ensure admin flag cleared immediately on logout
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentList");
    // No immediate reload; session effect will see no auth and keep logged out
  }

  async function handleUpdateMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const { ensureCsrf } = await import("@/lib/csrf");
      const csrf3 = await ensureCsrf();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/member`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(csrf3 ? { "X-CSRF-Token": csrf3 } : {}),
          ...(localStorage.getItem("authToken")
            ? { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password || undefined, // don't send empty string
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        return toast.error("Erreur lors de la mise à jour du profil", {
          style: { background: "#452a00", color: "#fde9cc" },
        });
      }
      const response = await res.json();
      setUser((prev) => ({ ...prev, ...response, password: "" }));
      toast.success("Profil mis à jour", {
        style: { background: "#452a00", color: "#fde9cc" },
      });
    } catch (err) {
      toast.warning("Erreur réseau", {
        style: { background: "#452a00", color: "#fde9cc" },
      });
    }
  }

  async function handleDeleteSelfAccount() {
    if (!window.confirm("Voulez-vous vraiment supprimer votre compte ?"))
      return;
    try {
      const { ensureCsrf } = await import("@/lib/csrf");
      const csrf4 = await ensureCsrf();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/member/${idUserOnline}`,
        {
          method: "DELETE",
          headers: {
            ...(csrf4 ? { "X-CSRF-Token": csrf4 } : {}),
            ...(localStorage.getItem("authToken")
              ? { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
              : {}),
          },
          credentials: "include",
        },
      );
      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        return toast.error("Erreur lors de la suppréssion du compte", {
          style: { background: "#452a00", color: "#fde9cc" },
        });
      }
      toast.success("Compte supprimé avec succès", {
        style: { background: "#452a00", color: "#fde9cc" },
      });
      localStorage.removeItem("authToken");
      setIsConnected(false);
      // Optionally redirect
      // navigate("/login");
    } catch (err) {
      alert("Erreur réseau");
    }
  }
  //return provider avec tout les UseState/ logique / fetch Applicable sur les composants ou App.tsx consommant le context
  return (
    <UserContext.Provider
      value={{
        isConnected,
        setIsConnected,
        email,
        setEmail,
        password,
        setPassword,
        handleDisconnect,
        handleSubmit,
        handleSubmitSignUp,
        handleChange,
        user,
        setUser,
        handleDeleteSelfAccount,
        handleUpdateMember,
        idUserOnline,
        isAdmin,
        setIsAdmin,
        userOnline,
        isEasterEgg,
        setIsEasterEgg,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

//creation useHook pour consommer le context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("Erreur Provider");
  }
  return context;
};
