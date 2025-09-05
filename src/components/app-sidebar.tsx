"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LayoutDashboard, Map, UserCircle, LogOut, Settings, Plane, ChevronDown, Book, PanelLeft, Gamepad2 } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/guides", icon: Book, label: "기술 가이드" },
  { href: "/missions", icon: Map, label: "미션" },
  { href: "/games", icon: Gamepad2, label: "게임" },
  { href: "/profile", icon: UserCircle, label: "프로필" },
  { href: "/settings", icon: Settings, label: "설정" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <aside className={`hidden md:flex flex-col bg-card border-r sticky top-0 h-screen transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="p-4 border-b flex items-center h-16">
        <Link href="/dashboard" className="flex items-center gap-2" prefetch={false}>
          <Plane className="h-7 w-7 text-primary flex-shrink-0" />
          {isOpen && <span className="text-2xl font-bold tracking-tight">DevTrip</span>}
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2 flex flex-col">
        <div className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
              className={`w-full text-base py-6 ${isOpen ? 'justify-start' : 'justify-center px-0'}`}
              asChild
            >
              <Link href={item.href}>
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isOpen ? 'mr-3' : ''}`} />
                {isOpen && item.label}
              </Link>
            </Button>
          ))}
        </div>
        
        {/* 토글 버튼을 네비게이션 하단에 배치 */}
        <div className={`pt-4 border-t border-border/50 ${isOpen ? '' : 'px-0'}`}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggle} 
            className={`${isOpen ? 'w-full justify-start' : 'w-full justify-center'} flex-shrink-0`}
          >
            <PanelLeft className={`h-6 w-6 ${isOpen ? 'mr-3' : ''}`} />
            {isOpen && <span>사이드바 접기</span>}
            <span className="sr-only">사이드바 토글</span>
          </Button>
        </div>
      </nav>
      {isOpen && (
        <div className="p-4 border-t">
          <DropdownMenu onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-14">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold leading-none">사용자 이름</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      비즈니스 플랜
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">사용자 이름</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@email.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>계정 설정</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </aside>
  )
}
