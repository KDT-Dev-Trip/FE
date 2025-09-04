import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/20">
      <Card className="w-full max-w-md text-center border-primary/20">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">길을 잃으셨나요?</CardTitle>
          <p className="text-muted-foreground text-sm">
            요청하신 페이지를 찾을 수 없습니다. 다른 목적지로 여행을 계속해보세요.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-6xl font-bold text-primary/20">404</div>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                대시보드로 돌아가기
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/missions">
                <MapPin className="mr-2 h-4 w-4" />
                미션 지도 보기
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전 페이지로
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}