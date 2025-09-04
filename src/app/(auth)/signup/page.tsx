"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15.09 14.321A7.942 7.942 0 0 1 12 15.5c-4.142 0-7.5-3.358-7.5-7.5S7.858.5 12 .5a7.944 7.944 0 0 1 6.536 3.429l-2.228 2.228A4.473 4.473 0 0 0 12 4.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5a4.473 4.473 0 0 0 3.09-1.179l-2.228-2.228" /><path d="M22.5 12.5v-1h-11v1a4.5 4.5 0 0 0 4.5 4.5h2a4.5 4.5 0 0 0 4.5-4.5Z" /></svg>
  );
  
const KakaoIcon = (props: React.SVGProps<SVGSVGElement>) => (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.48 2 2 5.64 2 10.08c0 2.89 2.01 5.43 5.04 6.89l-.96 3.53c-.09.33.15.62.46.46l4.36-2.85c.37.03.74.05 1.1.05 5.52 0 10-3.64 10-8.08S17.52 2 12 2z"/></svg>
);


export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isKakaoLoading, setIsKakaoLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }

    if (!agreedToTerms) {
      toast({
        title: "약관 동의 필요",
        description: "이용약관과 개인정보처리방침에 동의해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await authApi.register({ 
        email, 
        password, 
        confirmPassword,
        name: `${firstName} ${lastName}` 
      })
      toast({
        title: "회원가입 완료",
        description: "DevTrip에 오신 것을 환영합니다!",
      })
      router.push('/dashboard')
    } catch (error) {
      console.error('회원가입 실패:', error)
      toast({
        title: "회원가입 실패",
        description: error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKakaoSignup = async () => {
    setIsKakaoLoading(true)
    try {
      window.location.href = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/kakao/callback')}`
    } catch (error) {
      console.error('카카오 회원가입 실패:', error)
      toast({
        title: "회원가입 실패",
        description: "카카오 회원가입에 실패했습니다.",
        variant: "destructive",
      })
      setIsKakaoLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)
    try {
      window.location.href = `https://accounts.google.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&scope=email profile`
    } catch (error) {
      console.error('구글 회원가입 실패:', error)
      toast({
        title: "회원가입 실패",
        description: "구글 회원가입에 실패했습니다.",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">계정 만들기</CardTitle>
        <CardDescription>
          DevTrip에 오신 것을 환영합니다. 새 계정을 만들어보세요.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleKakaoSignup}
              disabled={isKakaoLoading}
            >
              <KakaoIcon className="mr-2 h-4 w-4" />
              {isKakaoLoading ? '로딩...' : '카카오'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              {isGoogleLoading ? '로딩...' : '구글'}
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">이름</Label>
              <Input 
                id="firstName" 
                placeholder="홍" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">성</Label>
              <Input 
                id="lastName" 
                placeholder="길동" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required 
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            />
            <Label htmlFor="terms" className="text-sm font-normal">
              <Link href="/terms" className="text-primary hover:underline">
                이용약관
              </Link>{" "}
              및{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                개인정보처리방침
              </Link>
              에 동의합니다.
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '계정 생성 중...' : '계정 만들기'}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="underline text-primary">
              로그인
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}