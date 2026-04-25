import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
  useSignIn,
} from "@clerk/react";
import { dark } from "@clerk/themes";
import {
  Switch,
  Route,
  useLocation,
  Router as WouterRouter,
  Redirect,
  Link,
} from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

const clerkAppearance = {
  baseTheme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#3b82f6",
    colorForeground: "#f1f5f9",
    colorMutedForeground: "#94a3b8",
    colorDanger: "#ef4444",
    colorBackground: "#111827",
    colorInput: "#1e2d45",
    colorInputForeground: "#f1f5f9",
    colorNeutral: "#2d3f5a",
    fontFamily: "'Tajawal', 'Inter', 'Segoe UI', system-ui, sans-serif",
    borderRadius: "0.75rem",
    fontSize: "15px",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "bg-[#111827] border border-[#1e3a5f] rounded-2xl w-[460px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none px-2",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white text-2xl font-bold tracking-tight",
    headerSubtitle: "text-slate-400 text-sm mt-1",
    socialButtonsBlockButtonText: "text-slate-200 font-medium",
    socialButtonsBlockButton: "border border-[#2d3f5a] bg-[#1a2235] hover:bg-[#1e2d45] transition-colors",
    formFieldLabel: "text-slate-300 text-sm font-medium",
    formFieldInput: "bg-[#1e2d45] border-[#2d4066] text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg",
    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/30",
    footerActionLink: "text-blue-400 hover:text-blue-300 font-medium transition-colors",
    footerActionText: "text-slate-500",
    dividerText: "text-slate-500 text-xs",
    dividerLine: "bg-[#2d3f5a]",
    identityPreviewEditButton: "text-blue-400 hover:text-blue-300",
    formFieldSuccessText: "text-emerald-400",
    alertText: "text-red-300",
    logoBox: "mb-2",
    logoImage: "h-10 w-auto",
    footerAction: "pt-2",
    alert: "bg-red-900/30 border-red-800/50",
    otpCodeFieldInput: "bg-[#1e2d45] border-[#2d4066] text-white text-center",
    formFieldRow: "gap-3",
    main: "gap-4",
  },
};

const localizationAr = {
  signIn: {
    start: {
      title: "مرحباً بعودتك",
      subtitle: "سجّل الدخول للوصول إلى حسابك",
      actionText: "ليس لديك حساب؟",
      actionLink: "إنشاء حساب",
    },
  },
  signUp: {
    start: {
      title: "إنشاء حساب جديد",
      subtitle: "انضم إلينا اليوم مجاناً",
      actionText: "لديك حساب بالفعل؟",
      actionLink: "تسجيل الدخول",
    },
  },
};

function ParticleBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-400/30"
          style={{
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 23 + 10) % 100}%`,
            animation: `float-up ${8 + (i % 5)}s ${(i * 1.3) % 8}s linear infinite`,
          }}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`big-${i}`}
          className="absolute w-2 h-2 rounded-full bg-purple-400/20"
          style={{
            left: `${(i * 31 + 15) % 100}%`,
            top: `${(i * 41 + 20) % 100}%`,
            animation: `float-up ${12 + (i % 4)}s ${(i * 2.1) % 10}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

function BackButton() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group"
    >
      <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
      العودة للرئيسية
    </Link>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen auth-bg relative flex">
      <ParticleBackground />

      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">NexAuth</span>
          </div>
          <BackButton />
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              منصة آمنة
              <br />
              <span className="shimmer-text">وسريعة الاستخدام</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              تجربة تسجيل دخول احترافية وعصرية تضمن أمان بياناتك مع سهولة الوصول من أي جهاز.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "🔒", title: "أمان متقدم", desc: "تشفير من طرف لطرف" },
              { icon: "⚡", title: "سريع للغاية", desc: "تسجيل دخول فوري" },
              { icon: "📱", title: "متوافق", desc: "جميع الأجهزة والمنصات" },
              { icon: "🌐", title: "متعدد الخيارات", desc: "جوجل وآبل وفيسبوك" },
            ].map((feature) => (
              <div key={feature.title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <div className="text-white font-semibold text-sm">{feature.title}</div>
                <div className="text-slate-500 text-xs mt-1">{feature.desc}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-rose-500"].map((color, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-[#111827] flex items-center justify-center text-white text-xs font-bold`}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <div className="text-white font-semibold text-sm">+50,000 مستخدم نشط</div>
              <div className="text-slate-500 text-xs">يثقون بمنصتنا يومياً</div>
            </div>
          </div>
        </div>

        <div className="text-slate-600 text-sm">
          © 2025 NexAuth. جميع الحقوق محفوظة.
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[480px]">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">NexAuth</span>
            </div>
            <BackButton />
          </div>
          <div dir="ltr">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserPortalPage() {
  return (
    <div className="min-h-screen auth-bg relative flex items-center justify-center p-6">
      <ParticleBackground />
      <Show when="signed-in">
        <div className="relative z-10 w-full max-w-lg text-center space-y-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-10 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">مرحباً بك!</h1>
            <p className="text-slate-400 text-lg mb-8">تم تسجيل دخولك بنجاح إلى منصة NexAuth</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: "🎯", label: "المهام", count: "12" },
                { icon: "📊", label: "التقارير", count: "5" },
                { icon: "⚙️", label: "الإعدادات", count: "3" },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-white font-bold text-xl">{item.count}</div>
                  <div className="text-slate-500 text-xs">{item.label}</div>
                </div>
              ))}
            </div>
            <Link
              to="/sign-out"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition-all font-medium text-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              تسجيل الخروج
            </Link>
          </div>
        </div>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </div>
  );
}

function SignOutPage() {
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  useEffect(() => {
    signOut().then(() => setLocation("/"));
  }, [signOut, setLocation]);
  return (
    <div className="min-h-screen auth-bg flex items-center justify-center">
      <div className="text-slate-400">جاري تسجيل الخروج...</div>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthLayout>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/portal`}
      />
    </AuthLayout>
  );
}

function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/portal`}
      />
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.8} xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.8} xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function OAuthButton({ provider, label, icon, description }: {
  provider: "oauth_google" | "oauth_apple";
  label: string;
  icon: React.ReactNode;
  description: string;
}) {
  const { signIn, isLoaded } = useSignIn();
  const [, setLocation] = useLocation();

  const handleOAuth = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${basePath}/sign-in/sso-callback`,
        redirectUrlComplete: `${basePath}/portal`,
      });
    } catch {
      setLocation("/sign-in");
    }
  };

  return (
    <button
      onClick={handleOAuth}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:-translate-y-1 hover:border-white/20 transition-all cursor-pointer group text-center w-full"
    >
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-white text-sm font-semibold group-hover:text-blue-300 transition-colors">{label}</div>
      <div className="text-slate-500 text-xs mt-1">{description}</div>
    </button>
  );
}

function LoginMethodCard({ to, icon, label, description }: {
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:-translate-y-1 hover:border-white/20 transition-all cursor-pointer group text-center block"
    >
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-white text-sm font-semibold group-hover:text-blue-300 transition-colors">{label}</div>
      <div className="text-slate-500 text-xs mt-1">{description}</div>
    </Link>
  );
}

function LoginMethods() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
      <LoginMethodCard
        to="/sign-in"
        icon={<EmailIcon />}
        label="البريد الإلكتروني"
        description="سجّل بإيميلك"
      />
      <LoginMethodCard
        to="/sign-in"
        icon={<PhoneIcon />}
        label="رقم الهاتف"
        description="رمز SMS"
      />
      <OAuthButton
        provider="oauth_google"
        label="جوجل"
        icon={<GoogleIcon />}
        description="سجّل بحساب جوجل"
      />
      <OAuthButton
        provider="oauth_apple"
        label="آبل"
        icon={<AppleIcon />}
        description="سجّل بحساب آبل"
      />
    </div>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen auth-bg relative">
      <ParticleBackground />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">NexAuth</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/sign-in" className="text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
            تسجيل الدخول
          </Link>
          <Link to="/sign-up" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30">
            إنشاء حساب
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-blue-400 text-sm font-medium">النظام يعمل بكامل طاقته</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 max-w-4xl">
          منصة تسجيل دخول
          <br />
          <span className="shimmer-text">احترافية وآمنة</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          سجّل دخولك بسهولة عبر بريدك الإلكتروني أو رقم هاتفك.
          ندعم أيضاً تسجيل الدخول عبر جوجل وفيسبوك وآبل.
          تجربة مستخدم سلسة على جميع الأجهزة.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <Link
            to="/sign-up"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            ابدأ مجاناً
          </Link>
          <Link
            to="/sign-in"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all hover:-translate-y-0.5"
          >
            لديّ حساب بالفعل
          </Link>
        </div>

        <p className="text-slate-500 text-sm mb-6">اختر طريقة تسجيل الدخول</p>
        <LoginMethods />
      </div>
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/portal" />
      </Show>
      <Show when="signed-out">
        <HomePage />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      localization={localizationAr}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/portal" component={UserPortalPage} />
          <Route path="/sign-out" component={SignOutPage} />
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
