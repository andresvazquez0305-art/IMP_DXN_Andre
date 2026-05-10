import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/react";

export interface Me {
  userId: string;
  email: string;
  nombre: string;
  imageUrl: string;
  rol: "admin" | "vendedor";
}

export function useRole() {
  const { isSignedIn } = useUser();

  return useQuery<Me>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Error al obtener perfil");
      return res.json() as Promise<Me>;
    },
    enabled: isSignedIn === true,
    staleTime: 60_000,
  });
}
