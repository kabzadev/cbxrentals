import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface PaymentData {
  booking_id: string;
  attendee_name: string;
  attendee_email: string;
  house_number: number;
  house_name: string;
  total_amount: number;
  paid_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_method: 'venmo' | 'zelle' | 'paypal' | 'cash' | null;
  arrival_date: string;
  exit_date: string;
}

interface HouseGroup {
  house_number: number;
  house_name: string;
  attendees: PaymentData[];
  total_amount: number;
  total_paid: number;
}

const PaymentReport: React.FC = () => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [groupedData, setGroupedData] = useState<HouseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: { paid_amount: number; payment_status: string; payment_method: string | null } }>({});

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings with attendee and property information
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          total_amount,
          paid,
          paid_amount,
          payment_status,
          payment_method,
          arrival_date,
          exit_date,
          attendees!inner(
            name,
            email
          ),
          properties!inner(
            id,
            name
          )
        `)
        .order('properties(name)', { ascending: true });

      if (error) throw error;

      // Transform data and extract house numbers
      const transformedData: PaymentData[] = data.map((booking: any) => {
        // Extract house number from property name (e.g., "House 1" -> 1)
        const houseMatch = booking.properties.name.match(/House (\d+)/i);
        const houseNumber = houseMatch ? parseInt(houseMatch[1]) : 0;
        
        return {
          booking_id: booking.id,
          attendee_name: booking.attendees.name,
          attendee_email: booking.attendees.email,
          house_number: houseNumber,
          house_name: booking.properties.name,
          total_amount: booking.total_amount,
          paid_amount: booking.paid_amount || (booking.paid ? booking.total_amount : 0),
          payment_status: booking.payment_status || (booking.paid ? 'paid' : 'unpaid'),
          payment_method: booking.payment_method || null,
          arrival_date: booking.arrival_date,
          exit_date: booking.exit_date
        };
      });

      setPaymentData(transformedData);
      groupDataByHouse(transformedData);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const groupDataByHouse = (data: PaymentData[]) => {
    const groups: { [key: number]: HouseGroup } = {};
    
    data.forEach(payment => {
      if (!groups[payment.house_number]) {
        groups[payment.house_number] = {
          house_number: payment.house_number,
          house_name: payment.house_name,
          attendees: [],
          total_amount: 0,
          total_paid: 0
        };
      }
      
      groups[payment.house_number].attendees.push(payment);
      groups[payment.house_number].total_amount += payment.total_amount;
      groups[payment.house_number].total_paid += payment.paid_amount;
    });

    // Sort by house number
    const sortedGroups = Object.values(groups).sort((a, b) => a.house_number - b.house_number);
    setGroupedData(sortedGroups);
  };

  const handleEdit = (bookingId: string, currentPaidAmount: number, currentStatus: string, currentMethod: string | null) => {
    setEditingBooking(bookingId);
    setEditValues({
      ...editValues,
      [bookingId]: { paid_amount: currentPaidAmount, payment_status: currentStatus, payment_method: currentMethod || 'none' }
    });
  };

  const handleSave = async (bookingId: string) => {
    try {
      const values = editValues[bookingId];
      if (!values) return;

      // Determine payment status based on paid amount
      const booking = paymentData.find(p => p.booking_id === bookingId);
      if (!booking) return;

      let paymentStatus = values.payment_status;
      const paidAmount = parseFloat(values.paid_amount.toString());
      
      // Auto-determine status based on amount
      if (paidAmount === 0) {
        paymentStatus = 'unpaid';
      } else if (paidAmount >= booking.total_amount) {
        paymentStatus = 'paid';
      } else {
        paymentStatus = 'partial';
      }

      // Update the booking
      const { error } = await supabase
        .from('bookings')
        .update({
          paid: paymentStatus === 'paid',
          paid_amount: paidAmount,
          payment_status: paymentStatus,
          payment_method: values.payment_method === 'none' ? null : values.payment_method
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      const updatedData = paymentData.map(p => 
        p.booking_id === bookingId 
          ? { ...p, paid_amount: paidAmount, payment_status: paymentStatus as 'unpaid' | 'partial' | 'paid', payment_method: (values.payment_method === 'none' ? null : values.payment_method) as 'venmo' | 'zelle' | 'paypal' | 'cash' | null }
          : p
      );
      
      setPaymentData(updatedData);
      groupDataByHouse(updatedData);
      setEditingBooking(null);
      
      toast.success('Payment updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment');
    }
  };

  const handleCancel = () => {
    setEditingBooking(null);
    setEditValues({});
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: { [key: string]: "success" | "warning" | "destructive" } = {
      paid: "success",
      partial: "warning",
      unpaid: "destructive"
    };
    
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const calculateGrandTotal = () => {
    return groupedData.reduce((acc, group) => ({
      total_amount: acc.total_amount + group.total_amount,
      total_paid: acc.total_paid + group.total_paid
    }), { total_amount: 0, total_paid: 0 });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading payment data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const grandTotal = calculateGrandTotal();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Portal
        </Button>
        
        <h1 className="text-3xl font-bold text-foreground">Payment Report</h1>
        <p className="text-muted-foreground mt-2">
          View and manage attendee payments by house
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendee Payments by House</CardTitle>
          <CardDescription>
            Edit payment amounts and track partial payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {groupedData.map((group) => (
              <div key={group.house_number} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{group.house_name}</h3>
                  <div className="text-sm text-muted-foreground">
                    Total: ${group.total_paid.toFixed(2)} / ${group.total_amount.toFixed(2)}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Attendee</th>
                        <th className="text-left p-2">Dates</th>
                        <th className="text-right p-2">Total Due</th>
                        <th className="text-right p-2">Paid Amount</th>
                        <th className="text-center p-2">Status</th>
                        <th className="text-center p-2">Method</th>
                        <th className="text-center p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.attendees.map((attendee) => (
                        <tr key={attendee.booking_id} className="border-b">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{attendee.attendee_name}</div>
                              <div className="text-sm text-muted-foreground">{attendee.attendee_email}</div>
                            </div>
                          </td>
                          <td className="p-2 text-sm">
                            {format(new Date(attendee.arrival_date), 'MMM dd')} - {format(new Date(attendee.exit_date), 'MMM dd')}
                          </td>
                          <td className="p-2 text-right">${attendee.total_amount.toFixed(2)}</td>
                          <td className="p-2 text-right">
                            {editingBooking === attendee.booking_id ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={editValues[attendee.booking_id]?.paid_amount || attendee.paid_amount}
                                onChange={(e) => setEditValues({
                                  ...editValues,
                                  [attendee.booking_id]: {
                                    ...editValues[attendee.booking_id],
                                    paid_amount: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="w-24 text-right"
                              />
                            ) : (
                              <span>${attendee.paid_amount.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {editingBooking === attendee.booking_id ? (
                              <Select
                                value={editValues[attendee.booking_id]?.payment_status || attendee.payment_status}
                                onValueChange={(value) => setEditValues({
                                  ...editValues,
                                  [attendee.booking_id]: {
                                    ...editValues[attendee.booking_id],
                                    payment_status: value
                                  }
                                })}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unpaid">Unpaid</SelectItem>
                                  <SelectItem value="partial">Partial</SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              getPaymentStatusBadge(attendee.payment_status)
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {editingBooking === attendee.booking_id ? (
                              <Select
                                value={editValues[attendee.booking_id]?.payment_method || attendee.payment_method || 'none'}
                                onValueChange={(value) => setEditValues({
                                  ...editValues,
                                  [attendee.booking_id]: {
                                    ...editValues[attendee.booking_id],
                                    payment_method: value === 'none' ? null : value
                                  }
                                })}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="venmo">Venmo</SelectItem>
                                  <SelectItem value="zelle">Zelle</SelectItem>
                                  <SelectItem value="paypal">PayPal</SelectItem>
                                  <SelectItem value="cash">Cash</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm capitalize">
                                {attendee.payment_method || '-'}
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {editingBooking === attendee.booking_id ? (
                              <div className="flex gap-2 justify-center">
                                <Button
                                  size="sm"
                                  onClick={() => handleSave(attendee.booking_id)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancel}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(attendee.booking_id, attendee.paid_amount, attendee.payment_status, attendee.payment_method)}
                              >
                                Edit
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="font-medium">House {group.house_number} Total:</span>
                  <span className="font-semibold">
                    ${group.total_paid.toFixed(2)} / ${group.total_amount.toFixed(2)}
                    {group.total_paid < group.total_amount && (
                      <span className="text-red-500 ml-2">
                        (${(group.total_amount - group.total_paid).toFixed(2)} remaining)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t-2">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Grand Total:</span>
              <span>
                ${grandTotal.total_paid.toFixed(2)} / ${grandTotal.total_amount.toFixed(2)}
                {grandTotal.total_paid < grandTotal.total_amount && (
                  <span className="text-red-500 ml-2">
                    (${(grandTotal.total_amount - grandTotal.total_paid).toFixed(2)} remaining)
                  </span>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { PaymentReport };