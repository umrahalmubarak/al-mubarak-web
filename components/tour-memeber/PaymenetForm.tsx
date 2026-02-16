// File: /components/tour-members/PaymentForm.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; 
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CreditCard, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

import { PaymentFormData, paymentSchema } from "@/validation/tour-memeber";
import { Payment, TourMember } from "@/types/tour-member";
import { tourMemberApi } from "@/lib/api/tour-memeber";

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourMember: TourMember;
  payment?: Payment;
}

const PaymentFormDialog: React.FC<PaymentFormDialogProps> = ({
  open,
  onOpenChange,
  tourMember,
  payment,
}) => {
  console.log("payment", payment);
  const queryClient = useQueryClient();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: payment?.amount || 0,
      paymentMethod: payment?.paymentMethod || "",
      note: payment?.note || "",
      status: payment?.status || "PAID",
    },
  });

  useEffect(() => {
    if (payment) {
      form.reset({
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        note: payment.note,
        status: payment.status,
      });
    }
  }, [payment, form]);

  const addPayment = useMutation({
    mutationFn: (data: PaymentFormData) =>
      tourMemberApi.addPayment(tourMember.id, data),
    onSuccess: () => {
      toast.success("Payment added successfully!");
      queryClient.invalidateQueries({
        queryKey: ["tourMemberById", tourMember.id],
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to add payment");
    },
  });

  const updatePayment = useMutation({
    mutationFn: (data: PaymentFormData) =>
      tourMemberApi.updatePayment(tourMember.id, payment!.id, data),
    onSuccess: () => {
      toast.success("Payment updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tourMembers"] });
      queryClient.invalidateQueries({
        queryKey: ["tourMemberById", tourMember.id],
      });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update payment");
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    if (payment) {
      updatePayment.mutate(data);
    } else {
      addPayment.mutate(data);
    }
  };

  const totalPaid =
    tourMember.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const remainingAmount = tourMember.totalCost - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {payment ? "Edit Payment" : "Add Payment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Summary */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Cost:</span>
                <span className="font-mono">
                  ₹{tourMember.totalCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Paid:</span>
                <span className="font-mono">₹{totalPaid.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-medium">
                <span>Remaining:</span>
                <span
                  className={cn(
                    "font-mono",
                    remainingAmount > 0 ? "text-red-600" : "text-green-600"
                  )}
                >
                  ₹{remainingAmount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="0"
                          className="pl-3"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Payment note..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addPayment.isPending || updatePayment.isPending}
                >
                  {addPayment.isPending || updatePayment.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : payment ? (
                    "Update"
                  ) : (
                    "Add Payment"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentFormDialog;
