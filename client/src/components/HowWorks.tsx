function HowWorks() {
  return (
    <section className="min-h-140 bg-primary/20 mx-9 rounded-4xl shadow-2xl border-4 border-white/20">
      <article className="flex flex-row justify-center items-center gap-4 py-5 px-4">
        <header className="flex-col mb-10">
          <h2 className="mb-5">Comment ça marche ?</h2>
          <div className="flex justify-center">
            <img
              className="h-20 w-20"
              src="/cook-reflexion.png"
              alt="logo qui refléchi"
            />
          </div>
        </header>
      </article>
      <article className="flex flex-wrap justify-center md:gap-30 px-4">
        <div className="  mb-10 flex flex-col justify-center items-center gap-4 ">
          <img className="mx-auto" src="/rechercher.png" alt="loupe" />
          <h3>Rechercher des recettes</h3>
          <p className="text-justify">
            Trouvez facilement des recettes selon vos ingrédients, type de plat
            ou mots-clés et choisissez ce qui vous plaît.
          </p>
        </div>
        <div className=" my-10 flex flex-col justify-center items-center gap-4">
          <img className="mx-auto" src="/filtrer.png" alt="filtre" />
          <h3>Filtrez selon vos besoins</h3>
          <p className="text-justify">
            Affinez votre recherche avec des filtres et découvrez des recettes
            adaptées à votre mode de vie.
          </p>
        </div>
        <div className=" my-10 flex flex-col justify-center items-center gap-4">
          <img className="mx-auto" src="/coeur.png" alt="coeur" />
          <h3>Sauvegardez vos favoris</h3>
          <p className="text-justify">
            Enregistrez vos recettes préférées et créez automatiquement votre
            liste de courses pour une préparation de repas simplifiée.
          </p>
        </div>
      </article>
    </section>
  );
}

export default HowWorks;
