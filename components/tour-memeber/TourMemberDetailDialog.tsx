// File: /components/tour-members/TourMemberDetailDialog.tsx
import React, {  useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  User,
  Phone,
  MapPin,
  FileText,
  Receipt,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TourMember, Payment } from "@/types/tour-member";
import PaymentFormDialog from "./PaymenetForm";
import { tourMemberApi } from "@/lib/api/tour-memeber";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TourBillPrint from "./PaymentPrint";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// Payment Status Badge Component
const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    PENDING: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: AlertCircle,
    },
    PARTIAL: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Clock,
    },
    PAID: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
    FAILED: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge className={cn("border", config.color)}>
      <Icon className="h-3 w-3 mr-1" />
      {status}
    </Badge>
  );
};

interface TourMemberDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourMemberId: string;
  status?: string;
}

const TourMemberDetailDialog: React.FC<TourMemberDetailDialogProps> = ({
  open,
  onOpenChange,
  tourMemberId,
  status = "BOOKED",
}) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { user } = useAuth();
  const isUserAdmin = user?.role === "ADMIN";

  // Fetch tour member
  const {
    data: tourMember,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tourMemberById", tourMemberId],
    queryFn: () => tourMemberApi.getById(tourMemberId),
    staleTime: 0,
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) =>
      tourMemberApi.deletePayment(tourMemberId, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tourMemberById", tourMember.id],
      });
    },
  });

  const deletePayment = async (paymentId: string) => {
    await deletePaymentMutation.mutateAsync(paymentId);
  };

  console.log("tourMember", tourMember);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error</div>;
  }

  const totalPaid =
    tourMember.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const remainingAmount = tourMember.totalCost - totalPaid;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              <span>Tour Member Details</span>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList
              className={`grid w-full ${
                status === "BOOKED" ? "grid-cols-3" : "grid-cols-2"
              }`}
            >
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              {status === "BOOKED" && (
                <TabsTrigger value="payments">Payments</TabsTrigger>
              )}
              {/* <TabsTrigger value="print-bill">print bill</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div
                className={`grid grid-cols-1 ${
                  status === "BOOKED" && "md:grid-cols-2"
                } gap-6`}
              >
                {/* Tour Package Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tour Package</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Package Name:</span>
                      <span className="font-medium">
                        {tourMember.tourPackage?.packageName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price per Person:</span>
                      <span className="font-mono">
                        ₹{tourMember.packagePrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Member Count:</span>
                      <Badge variant="secondary">
                        {tourMember.memberCount}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Net Cost:</span>
                      <span className="font-mono">
                        ₹{tourMember.netCost.toLocaleString()}
                      </span>
                    </div>
                    {tourMember.discount && tourMember.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span className="font-mono">
                          -₹{tourMember.discount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total Cost:</span>
                      <span className="font-mono">
                        ₹{tourMember.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Status */}
                {status === "BOOKED" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Payment Type:</span>
                        <Badge
                          variant={
                            tourMember.paymentType === "ONE_TIME"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {tourMember.paymentType}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status:</span>
                        <PaymentStatusBadge status={tourMember.paymentStatus} />
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>Total Paid:</span>
                        <span className="font-mono text-green-600">
                          ₹{totalPaid.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining:</span>
                        <span
                          className={cn(
                            "font-mono",
                            remainingAmount > 0
                              ? "text-red-600"
                              : "text-green-600"
                          )}
                        >
                          ₹{remainingAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              (totalPaid / tourMember.totalCost) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Tour Members ({tourMember.memberCount})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tourMember.members?.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {member.mobileNo}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{member.address}</span>
                          </div>
                          {member.document && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3" />
                              <span className="text-xs">
                                {Object.entries(member.document)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Payment History</h3>
                <Button
                  onClick={() => {
                    setSelectedPayment(undefined);
                    setShowPaymentDialog(true);
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Payment
                </Button>
              </div>

              {tourMember.payments && tourMember.payments.length > 0 ? (
                <div className="space-y-3">
                  {tourMember.payments.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4" />
                              <span className="font-medium">
                                ₹{payment.amount.toLocaleString()}
                              </span>
                              <PaymentStatusBadge status={payment.status} />
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-3 w-3" />
                                {payment.paymentMethod}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {format(
                                  new Date(payment.paymentDate),
                                  "dd MMM yyyy, hh:mm a"
                                )}
                              </div>

                              {payment.note && (
                                <div className="text-xs bg-muted p-2 rounded">
                                  {payment.note}
                                </div>
                              )}

                              {payment.createdBy && isUserAdmin && (
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3" />
                                  Collect By {payment.createdBy.email}
                                </div>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  router.push(
                                    `/dashboard/tour-member/${tourMember.id}/print?paymentId=${payment.id}`
                                  );
                                }}
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                              </DropdownMenuItem>
                              {isUserAdmin && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPayment(payment);
                                      setShowPaymentDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => deletePayment(payment.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No payments recorded yet</p>
                  <p className="text-sm">
                    Add the first payment to get started
                  </p>
                </div>
              )}
            </TabsContent>
            {/* <TabsContent value="print-bill" className="space-y-4">
              <div className="flex justify-between items-center">
                <TourBillPrint tourMember={tourMember} />
              </div>
            </TabsContent> */}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentFormDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        tourMember={tourMember}
        payment={selectedPayment}
      />
    </>
  );
};

export default TourMemberDetailDialog;
