import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import BackButton from "./BackButton";

interface SignUpProps extends React.ComponentProps<'div'> {
  onBack?: () => void;
}

function SignUp({ className, onBack, ...props }: SignUpProps) {
  const { handleSubmitSignUp, handleChange, user } = useUser();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-none mx-10 my-10">
        <CardContent className="grid p-0 ">
          <form onSubmit={handleSubmitSignUp} className="p-6 md:p-8 ">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">S'inscrire</h1>
                <p className="text-muted-foreground text-balance">
                  Creation de compte
                </p>
              </div>
              <div>
                <label htmlFor="name" className="block text-secondary mb-1">
                  Nom
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={user.name}
                  onChange={handleChange}
                  pattern="^[a-zA-ZÀ-ÿ\s'-]{2,64}$"
                  title="2-50 lettres, spaces, apostrophes or hyphens"
                  minLength={2}
                  maxLength={64}
                  className="w-full px-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-secondary"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-secondary mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-secondary"
                  type="email"
                  pattern="^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$"
                  title="Insérez un Email valide"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-secondary mb-1">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={user.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border text-secondary border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-seconday"
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s<>']).{8,64}$"
                  title="8-64 Lettres, au moin 1 Majuscule, 1 Minuscule, 1 numero, 1 character special"
                  minLength={8}
                  maxLength={64}
                  required
                />
              </div>
              <div className="flex gap-x-3">
                <BackButton onBack={onBack} />
                <button
                  type="submit"
                  className="w-full py-3 mt-2 rounded-lg bg-primary text-white font-semibold hover:bg-orange-500 transition-colors"
                >
                  Valider
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUp;
