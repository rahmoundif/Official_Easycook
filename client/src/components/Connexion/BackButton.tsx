import { useNavigate } from "react-router";
import { useCallback } from "react";

interface BackButtonProps {
  onBack?: () => void;
  fallbackPath?: string;
  replace?: boolean;
  className?: string;
}

export function BackButton({
  onBack,
  fallbackPath = "/Compte",
  replace = false,
  className = "",
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    if (window.history.length > 1) return navigate(-1);
    navigate(fallbackPath, { replace });
  }, [navigate, fallbackPath, replace, onBack]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full py-3 mt-2 rounded-lg bg-primary text-white font-semibold hover:bg-orange-500 transition-colors ${className}`}
    >
      Retour
    </button>
  );
}

export default BackButton;