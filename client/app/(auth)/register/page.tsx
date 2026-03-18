'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks/redux';
import { register } from '@/app/lib/store/slices/authSlice';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as 'patient' | 'doctor',
    specialization: '',
    consultationFee: 50,
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      if (user.role === 'patient') router.push('/patient');
      else if (user.role === 'doctor') router.push('/doctor');
    }
  }, [user, router]);

  // Afficher les erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.role === 'doctor' && !formData.specialization) {
      toast.error('La spécialisation est requise pour les médecins');
      return;
    }

    try {
      const result = await dispatch(register(formData)).unwrap();
      if (result) {
        toast.success('Inscription réussie !');
      }
    } catch (err) {
      // L'erreur est déjà gérée par le state
    }
  };

  const scrollToSection = (id: string) => {
    router.push(`/#${id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xl">DC</span>
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                Doctor<span className="text-blue-600">Consult</span>
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {['features', 'testimonials', 'faq'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-gray-600 hover:text-blue-600 transition-colors capitalize font-medium"
                >
                  {section === 'features' ? 'Fonctionnalités' : 
                   section === 'testimonials' ? 'Témoignages' : 'FAQ'}
                </button>
              ))}
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Connexion
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-100 animate-slideDown">
              <div className="flex flex-col space-y-3">
                {['features', 'testimonials', 'faq'].map((section) => (
                  <button
                    key={section}
                    onClick={() => {
                      scrollToSection(section);
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg text-left"
                  >
                    {section === 'features' ? 'Fonctionnalités' : 
                     section === 'testimonials' ? 'Témoignages' : 'FAQ'}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-2"></div>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Card d'inscription */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header de la carte */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-1">
                  Créer un compte
                </h2>
                <p className="text-blue-100">
                  Rejoignez DoctorConsult pour commencer vos consultations
                </p>
              </div>

              {/* Formulaire */}
              <div className="px-8 py-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Rôle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vous êtes *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.role === 'patient'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}>
                        <input
                          type="radio"
                          name="role"
                          value="patient"
                          checked={formData.role === 'patient'}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="flex flex-col items-center">
                          <span className="text-2xl mb-2">👤</span>
                          <span className={`text-sm font-medium ${
                            formData.role === 'patient' ? 'text-blue-600' : 'text-gray-600'
                          }`}>Patient</span>
                        </span>
                      </label>
                      
                      <label className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.role === 'doctor'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}>
                        <input
                          type="radio"
                          name="role"
                          value="doctor"
                          checked={formData.role === 'doctor'}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="flex flex-col items-center">
                          <span className="text-2xl mb-2">👨‍⚕️</span>
                          <span className={`text-sm font-medium ${
                            formData.role === 'doctor' ? 'text-blue-600' : 'text-gray-600'
                          }`}>Médecin</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Nom complet */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Jean Dupont"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="votre@email.com"
                    />
                  </div>

                  {/* Champs spécifiques médecin */}
                  {formData.role === 'doctor' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="font-medium text-gray-900">Informations professionnelles</h3>
                      
                      <div>
                        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                          Spécialisation *
                        </label>
                        <select
                          id="specialization"
                          name="specialization"
                          required
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Sélectionnez une spécialité</option>
                          <option value="Cardiologue">Cardiologue</option>
                          <option value="Dentiste">Dentiste</option>
                          <option value="Dermatologue">Dermatologue</option>
                          <option value="Généraliste">Médecin généraliste</option>
                          <option value="Gynécologue">Gynécologue</option>
                          <option value="Pédiatre">Pédiatre</option>
                          <option value="Psychiatre">Psychiatre</option>
                          <option value="Ophtalmologue">Ophtalmologue</option>
                          <option value="ORL">ORL</option>
                          <option value="Neurologue">Neurologue</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700 mb-1">
                          Prix de consultation (€)
                        </label>
                        <input
                          id="consultationFee"
                          name="consultationFee"
                          type="number"
                          min="0"
                          value={formData.consultationFee}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mot de passe */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe * <span className="text-gray-400">(min. 6 caractères)</span>
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Confirmation mot de passe */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le mot de passe *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Bouton d'inscription */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Inscription en cours...
                      </span>
                    ) : (
                      "S'inscrire"
                    )}
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">ou</span>
                    </div>
                  </div>

                  <p className="text-center text-sm text-gray-600">
                    Déjà inscrit ?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                      Connectez-vous
                    </Link>
                  </p>

                  <p className="text-xs text-gray-500 text-center mt-6">
                    En vous inscrivant, vous acceptez nos{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                      conditions d'utilisation
                    </a>{' '}
                    et notre{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                      politique de confidentialité
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}