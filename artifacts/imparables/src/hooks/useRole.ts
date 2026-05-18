import { useQuery } from "@tanstack/react-query";

export interface Me {
  userId: string;
  email: string;
  nombre: string;
  imageUrl: string;
  rol: "admin" | "vendedor";
}

export function useRole() {
  return useQuery<Me>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Error al obtener perfil");
      return res.json() as Promise<Me>;
    },
    enabled: true,
    staleTime: 60_000,
  });
}