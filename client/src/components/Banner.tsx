import { useLocation } from "react-router";

const bannerItems: Record<string, string> = {
  "/": "/Banner_Accueil.png",
  "/Recettes": "/Banner_Recettes.png",
  "/Details": "/Banner_Détails.png",
  "/Courses": "/Banner_Courses.png",
  "/Compte": "/Banner_Membres.png",
  "/Mentions_legales": "/Banner_Mentions_Legales.png",
  "/A_propos": "/Banner_A_Propos.png",
  "/Mixer": "/Banner_Mixer.png",
  "/Admin": "/Banner_Admin.png",
  "/Contact": "/Banner_Contact.png",
};

function Banner() {
  const location = useLocation();

  
  const getBasePath = (pathname: string) => {
    
    if (pathname.startsWith('/Details')) {
      return '/Details';
    }

    
    if (pathname.startsWith('/Compte')) {
      return '/Compte';
    }

    
    if (pathname.startsWith('/Admin')) {
      return '/Admin';
    }

    return pathname;
  };

  const basePath = getBasePath(location.pathname);
  const bannerImg = bannerItems[basePath];


  if (!bannerImg) {
    console.warn(`No banner found for path: ${basePath}`);
    return null;
  }

  return (
    <img
      src={bannerImg}
      alt="Banner"
      className="object-cover w-full h-35 md:h-50 lg:h-60"
      onError={(e) => {
        console.error('Banner image failed to load:', bannerImg);
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}

export default Banner;
