import { redirect } from "next/navigation";

/**
 * Вход живёт на стартовом экране (/). Маршрут оставлен, чтобы работали
 * старые ссылки и redirect("/sign-in") из requireSession().
 */
export default function SignInPage() {
  redirect("/");
}
