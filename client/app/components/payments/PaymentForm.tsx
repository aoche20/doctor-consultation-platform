'use client';

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface PaymentFormProps {
  clientSecret: string;
  appointmentId: string;
  amount: number;
  onSuccess?: () => void;
}

export default function PaymentForm({
  clientSecret,
  appointmentId,
  amount,
  onSuccess
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStripeReady, setIsStripeReady] = useState(false);
  const [isElementMounted, setIsElementMounted] = useState(false);

  // ✅ Vérifier que stripe et elements sont chargés
  useEffect(() => {
    if (stripe && elements) {
      console.log('✅ Stripe et Elements sont prêts');
      setIsStripeReady(true);
    } else {
      console.log('⏳ En attente de Stripe...', { 
        stripe: !!stripe, 
        elements: !!elements 
      });
    }
  }, [stripe, elements]);

  // ✅ Vérifier que le PaymentElement est monté
  useEffect(() => {
    // On attend un peu que le DOM soit prêt
    const timer = setTimeout(() => {
      const paymentElement = document.querySelector('.StripeElement');
      if (paymentElement) {
        console.log('✅ Payment Element monté dans le DOM');
        setIsElementMounted(true);
      } else {
        console.log('⏳ Payment Element pas encore monté...');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // ✅ Force l'affichage après 5 secondes (optionnel)
  useEffect(() => {
    const forceTimer = setTimeout(() => {
      if (!isElementMounted) {
        console.log('⚠️ Forçage de l\'affichage après timeout');
        setIsElementMounted(true);
      }
    }, 5000);
    
    return () => clearTimeout(forceTimer);
  }, [isElementMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error('❌ Stripe ou Elements non initialisés');
      setError('Le système de paiement n\'est pas encore prêt. Veuillez rafraîchir la page.');
      return;
    }

    if (!isStripeReady) {
      console.error('❌ Stripe pas encore prêt');
      setError('Veuillez patienter, chargement en cours...');
      return;
    }

    if (!isElementMounted) {
      console.error('❌ Payment Element pas encore monté');
      setError('Le formulaire de paiement n\'est pas encore chargé. Veuillez patienter...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💳 Confirmation du paiement...');
      
      const element = elements.getElement(PaymentElement);
      if (!element) {
        throw new Error('Payment Element non trouvé');
      }

      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/patient/appointments/${appointmentId}?payment=success`,
        },
        redirect: 'if_required'
      });

      if (submitError) {
        console.error('❌ Erreur confirmation:', submitError);
        
        if (submitError.type === 'card_error' || submitError.type === 'validation_error') {
          setError(submitError.message || 'Erreur de carte');
        } else {
          setError('Une erreur est survenue lors du paiement');
        }
        
        toast.error('Paiement échoué');
      } else {
        console.log('✅ Paiement réussi !');
        toast.success('Paiement réussi !');
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/patient/appointments/${appointmentId}?payment=success`);
        }
      }
    } catch (err) {
      console.error('❌ Erreur inattendue:', err);
      setError('Erreur lors du paiement');
      toast.error('Erreur de paiement');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ LE CODE QUE VOUS DEMANDEZ VA ICI
  // ============================================
  if (!isStripeReady || !isElementMounted) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {!isStripeReady 
            ? 'Chargement du système de paiement...' 
            : 'Chargement du formulaire de paiement...'}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Stripe: {isStripeReady ? '✅' : '⏳'} | 
          Element: {isElementMounted ? '✅' : '⏳'}
        </p>
      </div>
    );
  }

  // ============================================
  // FORMULAIRE DE PAIEMENT (quand tout est prêt)
  // ============================================
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            Paiement en cours...
          </span>
        ) : (
          `Payer ${amount} €`
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        Paiement sécurisé par Stripe. Aucune information bancaire n'est stockée sur nos serveurs.
      </p>
    </form>
  );
}