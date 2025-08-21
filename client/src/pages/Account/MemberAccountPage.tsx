import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";

interface accountPageType {
  id: number;
  email: string;
  name: string;
  password: string;
  admin: boolean;
}

function MemberAccountPage() {
  const { idUserOnline, isAdmin, isConnected } = useUser();
  const [profile, setProfile] = useState<accountPageType[]>([]);

  useEffect(() => {
    if (!isConnected || !idUserOnline) return;
    const bearer = localStorage.getItem("authToken");
    fetch(`${import.meta.env.VITE_API_URL}/member/${idUserOnline}/profile`, {
      credentials: "include",
      headers: {
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setProfile(data))
      .catch(() => { });
  }, [idUserOnline, isConnected]);

  return (
    <section className="mb-6 bg-[#f9e7cf] shadow-lg rounded-2xl px-4 py-4 border-2 border-[#e6d9be] w-full max-w-sm mx-auto text-secondary">
      {profile.length === 0 && (
        <p className="text-center text-sm opacity-70">Profil en cours de chargement…</p>
      )}
      {profile.map((pro) => (
        <article className="flex flex-col items-center" key={pro.id}>
          <h2 className="p-2 text-center font-semibold">Bonjour {pro.name}</h2>
          <span
            className={`px-5 py-1 mb-3 rounded-xl text-white text-sm font-medium ${isAdmin ? "bg-green-600" : "bg-blue-600"}`}
          >
            Statut : {isAdmin ? "admin" : "membre"}
          </span>
          <p className="mt-1 mb-2 text-center text-sm break-all">{pro.email}</p>
        </article>
      ))}
    </section>
  );
}

export default MemberAccountPage;
