import { useTranslation } from "react-i18next";

export default function GoogleLogin() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await API.get("/api/session-check");
        if (res.data.user) {
          navigate("/dashboard");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Session check failed:", err);
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t("googleLogin.loading", "Loading...")}</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">{t("googleLogin.title", "Login with Google")}</h1>
      <button
        onClick={handleGoogleLogin}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {t("googleLogin.button", "Login with Google")}
      </button>
    </div>
  );
}
