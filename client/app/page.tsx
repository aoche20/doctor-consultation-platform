import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-zinc-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            DoctorConsult
          </h1>
          <div className="space-x-4">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              Connexion
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Inscription
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Consultez les meilleurs{' '}
            <span className="text-blue-600 dark:text-blue-400">médecins</span>{' '}
            en ligne
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Plateforme de téléconsultation sécurisée. Prenez rendez-vous avec des 
            médecins qualifiés 24h/24 et 7j/7.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              Commencer maintenant
            </Link>
            <Link
              href="/doctors"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Trouver un médecin
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Pourquoi choisir notre plateforme ?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: "📹",
    title: "Consultation Vidéo HD",
    description: "Consultez votre médecin en vidéo haute qualité où que vous soyez"
  },
  {
    icon: "📅",
    title: "Rendez-vous 24/7",
    description: "Prenez rendez-vous à tout moment, même le week-end"
  },
  {
    icon: "👨‍⚕️",
    title: "Médecins certifiés",
    description: "Tous nos médecins sont diplômés et vérifiés"
  }
];