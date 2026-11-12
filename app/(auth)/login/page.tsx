import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Archivo, system-ui, sans-serif",
        background: "#FFFFFF",
      }}
    >
      <div style={{ width: "100%", maxWidth: 380, padding: "0 24px" }}>
        <Image
          src="/images/logo.jpeg"
          alt="By Devyora"
          width={146}
          height={80}
          style={{ height: 44, width: "auto", marginBottom: 8 }}
        />
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8C6A45",
            marginBottom: 32,
          }}
        >
          Studio sign in
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
