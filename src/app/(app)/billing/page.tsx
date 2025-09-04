'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Download, 
  Settings, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Zap,
  Shield,
  Star
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { paymentApi, type UserSubscription, type BillingHistory, type PaymentMethod } from '@/lib/api/payment'

export default function BillingPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    setIsLoading(true)
    try {
      const [subscriptionData, billingData, paymentData] = await Promise.all([
        paymentApi.getSubscriptionStatus(),
        paymentApi.getBillingHistory({ limit: 10 }),
        paymentApi.getPaymentMethods()
      ])
      
      setSubscription(subscriptionData)
      setBillingHistory(billingData)
      setPaymentMethods(paymentData)
    } catch (error) {
      console.error('Failed to load billing data:', error)
      toast({
        title: "데이터 로드 실패",
        description: "결제 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    try {
      const result = await paymentApi.cancelSubscription(subscription.id, '사용자 요청')
      
      toast({
        title: "구독 취소",
        description: `구독이 ${result.effectiveDate}에 종료됩니다.`,
      })
      
      await loadBillingData()
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      toast({
        title: "구독 취소 실패",
        description: "구독을 취소할 수 없습니다.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadInvoice = async (billingId: number) => {
    try {
      const blob = await paymentApi.downloadInvoice(billingId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `invoice-${billingId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download invoice:', error)
      toast({
        title: "다운로드 실패",
        description: "인보이스를 다운로드할 수 없습니다.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      case 'EXPIRED': return 'bg-gray-100 text-gray-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'FAILED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />
      case 'CANCELLED': 
      case 'EXPIRED': 
      case 'FAILED': return <XCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency === 'KRW' ? 'KRW' : 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 bg-gray-300 rounded"></div>
            <div className="h-48 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">결제 및 구독 관리</h1>
          <p className="text-muted-foreground">구독 상태와 결제 내역을 확인하세요</p>
        </div>
        {subscription && subscription.status === 'ACTIVE' && (
          <Button variant="outline" onClick={handleCancelSubscription} className="text-black hover:text-black">
            구독 취소
          </Button>
        )}
      </div>

      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscription">구독 현황</TabsTrigger>
          <TabsTrigger value="history">결제 내역</TabsTrigger>
          <TabsTrigger value="payment-methods">결제 수단</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-6">
          {subscription ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Current Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    현재 구독 플랜
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{subscription.plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{subscription.plan.description}</p>
                    </div>
                    <Badge className={getStatusColor(subscription.status)}>
                      {getStatusIcon(subscription.status)}
                      {subscription.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">월 요금</p>
                      <p className="font-semibold">
                        {formatCurrency(subscription.plan.price, subscription.plan.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">다음 결제일</p>
                      <p className="font-semibold">
                        {subscription.metadata.nextBillingDate 
                          ? formatDate(subscription.metadata.nextBillingDate)
                          : '미정'
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">플랜 기능</p>
                    <div className="space-y-2">
                      {subscription.plan.features.unlimitedMissions && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          무제한 미션
                        </div>
                      )}
                      {subscription.plan.features.prioritySupport && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          우선 지원
                        </div>
                      )}
                      {subscription.plan.features.advancedAnalytics && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          고급 분석
                        </div>
                      )}
                      {subscription.plan.features.teamManagement && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          팀 관리 ({subscription.plan.features.maxUsers}명)
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    이번 달 사용량
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        {formatCurrency(subscription.plan.price, subscription.plan.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">이번 달 청구 예정</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="font-semibold">활성 기간</p>
                        <p className="text-muted-foreground">
                          {Math.floor((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}일 남음
                        </p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="font-semibold">자동 갱신</p>
                        <p className="text-muted-foreground">
                          {subscription.autoRenewal ? '활성화' : '비활성화'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">활성 구독이 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  DevTrip의 모든 기능을 사용하려면 구독을 시작하세요
                </p>
                <Button>구독 플랜 선택하기</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>결제 내역</CardTitle>
              <CardDescription>최근 결제 내역을 확인할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent>
              {billingHistory.length > 0 ? (
                <div className="space-y-4">
                  {billingHistory.map((billing) => (
                    <div key={billing.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {formatCurrency(billing.amount, billing.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(billing.billingPeriodStart)} - {formatDate(billing.billingPeriodEnd)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(billing.status)}>
                          {getStatusIcon(billing.status)}
                          {billing.status}
                        </Badge>
                        {billing.invoiceUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadInvoice(billing.id)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            영수증
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">결제 내역이 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>결제 수단</CardTitle>
              <CardDescription>등록된 결제 수단을 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {method.details.brand?.toUpperCase()} **** {method.details.last4}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {method.details.billingName} • 
                            만료: {method.details.expiryMonth}/{method.details.expiryYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && (
                          <Badge variant="secondary">기본</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">등록된 결제 수단이 없습니다</p>
                  <Button>결제 수단 추가</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}