import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth-card";
import { AuthHero } from "@/components/auth-hero";
import { InstallPrompt } from "@/components/install-prompt";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Mascot } from "@/components/mascot";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { IconCalendar, IconHeart, IconProgress, IconStreak } from "@/ui/icons";
import { Card } from "@/ui/primitives/card";
import { IconTile } from "@/ui/primitives/icon-tile";
import { Illustration } from "@/ui/primitives/illustration";

export default async function Home() {
  // Авторизованным стартовый экран не нужен — сразу в кабинет.
  const session = await getSession();
  if (session) redirect("/dashboard");

  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const features = [
    { icon: IconCalendar, tone: "success" as const, label: dict.home.featureDaily },
    { icon: IconStreak, tone: "v2" as const, label: dict.home.featureStreak },
    { icon: IconProgress, tone: "v3" as const, label: dict.home.featureProgress },
  ];

  return (
    <main className="relative flex-1 overflow-hidden bg-canvas">
      {/* небо за героем, растворяется к середине экрана */}
      <div className="bg-aurora animate-aurora pointer-events-none absolute inset-x-0 top-0 h-[34rem] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]" />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center px-4 pt-6 pb-8">
        <div className="mb-6 flex w-full justify-end">
          <LanguageSwitcher current={locale} label={dict.common.language} />
        </div>

        <AuthHero title={dict.common.appName} subtitle={dict.common.tagline} />

        <Illustration
          src="/images/app/mascot-wave.webp"
          alt=""
          width={480}
          height={480}
          eager
          className="animate-float -my-2 w-64"
          fallback={<Mascot className="animate-float mt-2 w-full max-w-sm" />}
        />

        <AuthCard mode="sign-in" dict={dict.auth} />

        {/* преимущества */}
        <Card className="mt-4 w-full">
          <ul className="grid grid-cols-3 divide-x divide-hairline">
            {features.map((f) => (
              <li key={f.label} className="flex flex-col items-center gap-2 px-2 text-center">
                <IconTile icon={f.icon} tone={f.tone} />
                <span className="t-caption leading-tight text-fg">{f.label}</span>
              </li>
            ))}
          </ul>
          <p className="t-body-sm mt-5 flex items-center justify-center gap-2 text-fg-muted">
            <IconHeart size={18} weight="fill" className="text-berry-500" aria-hidden />
            {dict.home.footer}
          </p>
        </Card>

        <InstallPrompt dict={dict.install} />
      </div>
    </main>
  );
}
