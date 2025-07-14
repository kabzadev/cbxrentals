import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/use-toast';
import { formatCurrency } from '../lib/utils';
import { Check, QrCode, DollarSign, CreditCard } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { trackEvent, trackException } from '../lib/appInsights';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendeeId: string;
  bookingId: string;
  amount: number;
  attendeeName: string;
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  attendeeId, 
  bookingId, 
  amount,
  attendeeName 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { updatePaymentStatus } = useAuthStore();

  const handlePaymentConfirmation = async () => {
    setIsProcessing(true);
    try {
      // Update booking as paid
      const { error } = await supabase
        .from('bookings')
        .update({ paid: true })
        .eq('id', bookingId);

      if (error) throw error;

      // Update the auth store with new payment status
      updatePaymentStatus(bookingId, true);

      // Log payment completion
      trackEvent('Payment Completed', {
        attendeeName,
        bookingId,
        amount,
        source: 'payment_modal'
      });

      toast({
        title: 'Payment Recorded',
        description: 'Your payment has been recorded. Thank you!',
      });

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      trackException(error as Error, {
        context: 'payment_modal',
        attendeeName,
        bookingId,
        amount
      });
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full sm:max-w-md sm:h-auto sm:max-h-[90vh] fixed inset-0 sm:inset-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] p-0 sm:p-6 rounded-none sm:rounded-lg bg-white">
        <div className="h-full flex flex-col safe-area-inset">
          <DialogHeader className="p-4 pb-2 pt-safe sm:p-0 sm:pb-2 border-b sm:border-0 bg-white">
            <DialogTitle className="text-base sm:text-lg pr-8">Make Payment - {formatCurrency(amount)}</DialogTitle>
            <DialogDescription className="text-sm">
              Scan the QR code below with your Venmo app to send payment
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-0">
            <div className="space-y-3 pb-2">
          {/* Venmo QR Code */}
          <div className="flex justify-center p-3 bg-white rounded-lg">
            <img 
              src="/venmo-qr.png" 
              alt="Venmo QR Code" 
              className="w-40 h-40 sm:w-48 sm:h-48"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gray-100 rounded flex flex-col items-center justify-center hidden">
              <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-2" />
              <p className="text-xs sm:text-sm text-gray-600 text-center px-2">
                Please save the Venmo QR code image as<br/>
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">/public/venmo-qr.png</code>
              </p>
            </div>
          </div>

          {/* All Payment Options */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Payment Options:</h4>
            
            {/* Venmo Instructions */}
            <div className="bg-purple-50 rounded-lg p-2.5 sm:p-3 border border-purple-200">
              <h5 className="font-medium text-purple-900 mb-1 text-sm">Venmo (QR code above)</h5>
              <div className="text-xs sm:text-sm text-purple-800 space-y-0.5">
                <p><strong>Username:</strong> @KeithKabza</p>
                <p><strong>Amount:</strong> {formatCurrency(amount)}</p>
                <p><strong>Note:</strong> "CBX Experience - {attendeeName}"</p>
              </div>
            </div>

            {/* Zelle Option */}
            <div className="bg-emerald-50 rounded-lg p-2.5 sm:p-3 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  <div>
                    <h5 className="font-medium text-emerald-900 text-sm">Zelle</h5>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-900">727-455-3833</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-700">Phone number</span>
              </div>
            </div>

            {/* PayPal Option */}
            <div className="bg-blue-50 rounded-lg p-2.5 sm:p-3 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <div>
                    <h5 className="font-medium text-blue-900 text-sm">PayPal</h5>
                    <p className="text-xs sm:text-sm font-semibold text-blue-900">keith@visualgov.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Button */}
          <div className="pt-3 border-t">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              After sending payment via Venmo, Zelle, or PayPal, click the button below to confirm:
            </p>
            <Button
              onClick={handlePaymentConfirmation}
              disabled={isProcessing}
              className="w-full bg-[#3D95CE] hover:bg-[#3D95CE]/90 text-white text-sm sm:text-base"
            >
              <Check className="h-4 w-4 mr-2" />
              {isProcessing ? 'Recording Payment...' : 'I\'ve Sent the Payment'}
            </Button>
          </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}