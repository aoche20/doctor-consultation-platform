'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  VideoCameraIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  const stats = [
    { value: '50K+', label: 'Consultations', icon: ChartBarIcon, suffix: '' },
    { value: '500+', label: 'Médecins', icon: UserGroupIcon, suffix: '' },
    { value: '98%', label: 'Satisfaction', icon: StarIcon, suffix: '%' },
    { value: '24/7', label: 'Disponibilité', icon: ClockIcon, suffix: '' },
  ];

  const features = [
    {
      icon: VideoCameraIcon,
      title: 'Consultation Vidéo HD',
      description: 'Consultez votre médecin en vidéo haute qualité où que vous soyez, avec une connexion stable et sécurisée.',
      color: 'blue',
      benefits: ['Son et image HD', 'Connexion stable', 'Sécurisé'],
    },
    {
      icon: CalendarIcon,
      title: 'Rendez-vous 24/7',
      description: 'Prenez rendez-vous à tout moment, même le week-end. Plus besoin d\'attendre les heures ouvrables.',
      color: 'green',
      benefits: ['Disponible 24h/24', 'Confirmation instantanée', 'Rappels automatiques'],
    },
    {
      icon: UserGroupIcon,
      title: 'Médecins certifiés',
      description: 'Tous nos médecins sont diplômés, vérifiés et régulièrement évalués pour garantir des soins de qualité.',
      color: 'purple',
      benefits: ['Diplômés d\'État', 'Vérifiés', 'Évalués'],
    },
    {
      icon: ShieldCheckIcon,
      title: 'Sécurité des données',
      description: 'Vos données médicales sont protégées et confidentielles, conformément aux normes RGPD.',
      color: 'indigo',
      benefits: ['Chiffrement AES-256', 'Conforme RGPD', 'Confidentiel'],
    },
  ];

  const testimonials = [
    {
      name: 'Sophie Martin',
      role: 'Patiente',
      content: 'Grâce à DoctorConsult, j\'ai pu consulter un cardiologue rapidement sans attendre des semaines. Le médecin était à l\'écoute et la consultation vidéo s\'est parfaitement déroulée.',
      rating: 5,
      date: 'Il y a 2 semaines',
    },
    {
      name: 'Thomas Dubois',
      role: 'Patient',
      content: 'La plateforme est très intuitive et les médecins sont professionnels. J\'apprécie particulièrement les rappels automatiques qui m\'évitent d\'oublier mes rendez-vous.',
      rating: 5,
      date: 'Il y a 1 mois',
    },
    {
      name: 'Marie Lambert',
      role: 'Patiente',
      content: 'En tant que mère de famille, pouvoir consulter un pédiatre rapidement sans déplacer mon enfant malade est un véritable soulagement. Service impeccable !',
      rating: 5,
      date: 'Il y a 3 semaines',
    },
  ];

  const faqs = [
    {
      question: 'Comment fonctionne la consultation vidéo ?',
      answer: 'Après avoir pris rendez-vous, vous recevrez un lien de connexion par email et SMS. Au moment de la consultation, il vous suffit de cliquer sur "Rejoindre" depuis votre espace patient. Aucune installation n\'est nécessaire, tout se fait depuis votre navigateur web ou mobile.',
    },
    {
      question: 'Les consultations sont-elles remboursées ?',
      answer: 'Oui, les consultations sont remboursées par la Sécurité Sociale et les mutelles, comme une consultation classique en cabinet. Vous recevrez une facture à transmettre à votre organisme de remboursement. Le prix affiché inclut déjà la part Sécurité Sociale.',
    },
    {
      question: 'Que faire en cas de problème technique ?',
      answer: 'Notre support technique est disponible 24/7 par chat et par email. En cas de problème pendant la consultation, le médecin peut la reprogrammer gratuitement. Nous vous recommandons de vérifier votre connexion internet et votre matériel avant chaque consultation.',
    },
    {
      question: 'Mes données sont-elles sécurisées ?',
      answer: 'Absolument. Nous utilisons un chiffrement de bout en bout pour toutes les communications. Vos données médicales sont stockées sur des serveurs sécurisés en France et conformes aux normes RGPD et HDS (Hébergement de Données de Santé).',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600',
      green: 'from-green-500 to-green-600 bg-green-50 text-green-600',
      purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600',
      indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
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
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Inscription gratuite
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
                    onClick={() => scrollToSection(section)}
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
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition"
                >
                  Inscription gratuite
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-white">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/40 to-transparent rounded-bl-[100px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-blue-100/30 to-transparent rounded-tr-[100px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6 animate-fadeIn">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Téléconsultation médicale • 24/7
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-slideDown leading-tight">
              Consultez les meilleurs{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                médecins
              </span>{' '}
              en ligne
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fadeIn">
              Plateforme de téléconsultation sécurisée. Prenez rendez-vous avec des 
              médecins qualifiés 24h/24 et 7j/7, où que vous soyez.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slideUp">
              <Link
                href="/register"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Commencer maintenant
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button
                onClick={() => scrollToSection('features')}
                className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
              >
                Découvrir
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Fonctionnalités</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Tout ce dont vous avez besoin pour votre santé
            </h2>
            <p className="text-gray-600">
              Une plateforme complète et sécurisée pour vos consultations médicales en ligne
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const colorClasses = getColorClasses(feature.color);
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircleIcon className={`w-4 h-4 text-${feature.color}-500`} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Processus</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Comment ça fonctionne ?
            </h2>
            <p className="text-gray-600">
              Consultez un médecin en 4 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecteur */}
            <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-200 to-blue-300" />
            
            {[
              { step: '1', title: 'Créez votre compte', desc: 'Inscription gratuite en 2 minutes' },
              { step: '2', title: 'Trouvez un médecin', desc: 'Recherchez par spécialité' },
              { step: '3', title: 'Prenez rendez-vous', desc: 'Choisissez votre créneau' },
              { step: '4', title: 'Consultez en ligne', desc: 'Rejoignez la vidéo' },
            ].map((item, index) => (
              <div key={index} className="relative z-10 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Témoignages</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Ce que disent nos patients
            </h2>
            <p className="text-gray-600">
              Rejoignez les milliers de patients satisfaits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <p className="text-xs text-gray-400">{testimonial.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            </h2>
            <p className="text-gray-600">
              Tout ce que vous devez savoir sur DoctorConsult
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-200 transition-colors"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                  <ChevronRightIcon
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                      activeFaq === index ? 'rotate-90 text-blue-600' : ''
                    }`}
                  />
                </button>
                
                {activeFaq === index && (
                  <div className="px-6 pb-6 text-gray-600 border-t border-gray-100 pt-4 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à prendre soin de votre santé ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Rejoignez des milliers de patients et commencez vos consultations dès maintenant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
              >
                Créer un compte gratuit
              </Link>
              <Link
                href="/doctors"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
              >
                Trouver un médecin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            {/* About */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">DC</span>
                </div>
                <span className="font-bold text-xl">DoctorConsult</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                La première plateforme de téléconsultation médicale en France. Simple, rapide et sécurisé.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                    aria-label={social}
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-current opacity-75" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-6">Liens rapides</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-white transition">
                    Fonctionnalités
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('testimonials')} className="hover:text-white transition">
                    Témoignages
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="hover:text-white transition">
                    FAQ
                  </button>
                </li>
                <li>
                  <Link href="/doctors" className="hover:text-white transition">
                    Médecins
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-6">Informations légales</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/terms" className="hover:text-white transition">
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/legal" className="hover:text-white transition">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white transition">
                    Gestion des cookies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-6">Contact</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <a href="mailto:contact@doctorconsult.com" className="hover:text-white transition">
                    contact@doctorconsult.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <PhoneIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <a href="tel:+33123456789" className="hover:text-white transition">
                    +33 1 23 45 67 89
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>
                    123 Avenue de la Santé<br />
                    75001 Paris, France
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} DoctorConsult. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
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
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}