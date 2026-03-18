'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { appointmentApi } from '@/app/lib/api/appointmentApi';
import { paymentApi } from '@/app/lib/api/paymentApi';
import PaymentForm from '@/app/components/payments/PaymentForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Initialiser Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const appointmentId = params?.appointmentId as string;
  
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && appointmentId) {
      loadAppointmentAndCreatePayment();
    }
  }, [user, authLoading, appointmentId]);

  const loadAppointmentAndCreatePayment = async () => {
    setLoading(true);
    try {
      // Charger les détails du rendez-vous
      const aptResult = await appointmentApi.getAppointmentById(appointmentId);
      
      if (!aptResult.success || !aptResult.appointment) {
        toast.error('Rendez-vous non trouvé');
        router.push('/patient/appointments');
        return;
      }

      setAppointment(aptResult.appointment);

      // Vérifier si déjà payé
      if (aptResult.appointment.paymentStatus === 'paid') {
        toast.success('Ce rendez-vous est déjà payé');
        router.push(`/patient/appointments/${appointmentId}`);
        return;
      }

      // Créer le Payment Intent
      const paymentResult = await paymentApi.createPaymentIntent(appointmentId);
      
      if (paymentResult.success && paymentResult.clientSecret) {
        setClientSecret(paymentResult.clientSecret);
      } else {
        toast.error(paymentResult.message || 'Erreur lors de la création du paiement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    router.push(`/patient/appointments/${appointmentId}?payment=success`);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (!appointment || !clientSecret) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Impossible de charger la page de paiement</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour
        </button>
      </div>
    );
  }

  const doctor = typeof appointment.doctor === 'object' ? appointment.doctor : null;
  console.log('🔄 Rendu avec clientSecret:', clientSecret ? '✅ Présent' : '❌ Absent');
  console.log('🔄 StripePromise:', stripePromise ? '✅ OK' : '❌ Non initialisé');
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </button>

        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement de la consultation
          </h1>
          <p className="text-gray-600">
            Complétez le paiement pour confirmer votre rendez-vous
          </p>
        </div>

        {/* Récapitulatif */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Récapitulatif
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Médecin</span>
              <span className="font-medium text-gray-900">{doctor?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-gray-900">
                {new Date(appointment.date).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Horaire</span>
              <span className="font-medium text-gray-900">
                {appointment.timeSlot.start}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Type</span>
              <span className="font-medium text-gray-900 capitalize">
                {appointment.type}
              </span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">{appointment.paymentAmount} €</span>
            </div>
          </div>
        </div>

        {/* Formulaire de paiement */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              clientSecret={clientSecret}
              appointmentId={appointmentId}
              amount={appointment.paymentAmount}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Paiement 100% sécurisé. Vos informations bancaires sont cryptées par Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}