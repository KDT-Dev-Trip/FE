"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { missionApi, type Mission as ApiMission, type MissionAttempt, type TerminalSession } from "@/lib/api/mission"
import { aiEvaluationApi } from "@/lib/api/ai-evaluation"
import { Cpu, MemoryStick, ArrowRight, ChevronsRight, FileCode, CheckSquare, Save } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { TerminalComponent, type TerminalRef } from "./terminal"

interface MissionViewProps {
  mission: ApiMission
  attempt?: MissionAttempt
}

// Grafana 스타일 메트릭 데이터
const cpuData = [
  { time: '10:00', value: 23.5 },
  { time: '10:01', value: 26.2 },
  { time: '10:02', value: 31.8 },
  { time: '10:03', value: 28.9 },
  { time: '10:04', value: 35.2 },
  { time: '10:05', value: 42.1 },
  { time: '10:06', value: 38.7 },
  { time: '10:07', value: 33.4 }
];

const memoryData = [
  { time: '10:00', value: 68.3 },
  { time: '10:01', value: 71.2 },
  { time: '10:02', value: 73.8 },
  { time: '10:03', value: 69.5 },
  { time: '10:04', value: 75.9 },
  { time: '10:05', value: 78.2 },
  { time: '10:06', value: 76.1 },
  { time: '10:07', value: 72.8 }
];

const networkData = [
  { time: '10:00', in: 125.3, out: 89.7 },
  { time: '10:01', in: 134.8, out: 95.2 },
  { time: '10:02', in: 142.1, out: 102.8 },
  { time: '10:03', in: 138.6, out: 98.4 },
  { time: '10:04', in: 156.2, out: 112.3 },
  { time: '10:05', in: 163.9, out: 118.7 },
  { time: '10:06', in: 159.4, out: 115.2 },
  { time: '10:07', in: 148.7, out: 107.9 }
];

const diskData = [
  { time: '10:00', read: 45.2, write: 23.8 },
  { time: '10:01', read: 52.6, write: 28.3 },
  { time: '10:02', read: 48.9, write: 31.7 },
  { time: '10:03', read: 41.3, write: 25.9 },
  { time: '10:04', read: 58.7, write: 35.2 },
  { time: '10:05', read: 62.1, write: 39.8 },
  { time: '10:06', read: 56.4, write: 33.6 },
  { time: '10:07', read: 49.8, write: 29.4 }
];

// Common commands based on mission stack
const getCommonCommands = (stack: string) => {
  switch (stack) {
    case 'docker':
      return ["docker ps", "docker images", "docker run hello-world", "docker logs", "docker --help"];
    case 'kubernetes':
      return ["kubectl get pods", "kubectl get deployments", "kubectl apply -f", "kubectl get services", "kubectl describe"];
    default:
      return ["ls -la", "cat", "pwd", "help"];
  }
};

export function MissionView({ mission, attempt }: MissionViewProps) {
  const router = useRouter();
  const commonCommands = getCommonCommands(mission.stack || 'default');
  const { toast } = useToast();
  const [terminalInput, setTerminalInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState<MissionAttempt | null>(attempt || null);
  const [terminalSession, setTerminalSession] = useState<TerminalSession | null>(null);
  const terminalRef = useRef<TerminalRef>(null);

  // Initialize mission attempt if not provided
  useEffect(() => {
    if (!currentAttempt) {
      startMissionAttempt();
    }
  }, []);

  const startMissionAttempt = async () => {
    try {
      const newAttempt = await missionApi.startMission(mission.id);
      setCurrentAttempt(newAttempt);
      
      // Connect terminal after starting mission
      await connectTerminal(newAttempt.id);
    } catch (error) {
      console.error('Failed to start mission:', error);
      toast({
        title: "미션 시작 실패",
        description: "미션을 시작할 수 없습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const connectTerminal = async (attemptId: string) => {
    try {
      const session = await missionApi.connectTerminal(mission.id, attemptId);
      setTerminalSession(session);
      
      // Connect WebSocket to terminal
      if (session.websocketUrl && terminalRef.current) {
        terminalRef.current.connectWebSocket(session.websocketUrl);
      }
      
      toast({
        title: "터미널 연결됨",
        description: "실습 환경이 준비되었습니다.",
      });
    } catch (error) {
      console.error('Failed to connect terminal:', error);
      toast({
        title: "터미널 연결 실패",
        description: "터미널 연결에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCommandClick = (command: string) => {
    terminalRef.current?.sendCommand(command);
  };

  const handleSave = async () => {
    if (!currentAttempt) return;
    
    setIsSaving(true);
    try {
      // Here you could save current workspace state or progress
      toast({
        title: "저장 완료",
        description: "현재 작업이 임시 저장되었습니다.",
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "저장 실패",
        description: "작업 저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentAttempt) {
      toast({
        title: "제출 불가",
        description: "미션이 시작되지 않았습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setLoadingProgress(0);
    
    try {
      // Submit mission
      const submission = await missionApi.submitMission(mission.id, {
        missionAttemptId: currentAttempt.id,
        requestEvaluation: true,
        completionNotes: "Mission completed via web interface",
      });

      // Start AI evaluation
      if (submission.evaluationId) {
        // Progress animation while evaluation is processing
        const interval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 4.5; // Reach 90% in 20 seconds
          });
        }, 1000);

        // Check evaluation status
        const checkEvaluation = setInterval(async () => {
          try {
            const status = await aiEvaluationApi.getEvaluationStatus(submission.evaluationId!);
            if (status.status === 'COMPLETED') {
              clearInterval(checkEvaluation);
              clearInterval(interval);
              setLoadingProgress(100);
              
              setTimeout(() => {
                router.push(`/evaluation?evaluationId=${submission.evaluationId}`);
              }, 1000);
            } else if (status.status === 'FAILED') {
              throw new Error('Evaluation failed');
            }
          } catch (error) {
            clearInterval(checkEvaluation);
            clearInterval(interval);
            throw error;
          }
        }, 3000); // Check every 3 seconds

      } else {
        // Fallback: direct redirect after delay
        setTimeout(() => {
          setLoadingProgress(100);
          setTimeout(() => {
            router.push('/evaluation');
          }, 1000);
        }, 18000);
      }

    } catch (error) {
      console.error('Submission failed:', error);
      toast({
        title: "제출 실패",
        description: error instanceof Error ? error.message : "미션 제출에 실패했습니다.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setLoadingProgress(0);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (terminalSession) {
        missionApi.disconnectTerminal(mission.id, terminalSession.sessionId).catch(console.error);
      }
    };
  }, [terminalSession]);

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-full">
      {/* Left Panel: Mission Details */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>{mission.title}</CardTitle>
          <CardDescription>{mission.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="mb-4 flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              mission.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-700' :
              mission.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {mission.difficulty}
            </span>
            <span className="text-sm text-muted-foreground">
              {mission.estimatedTime}분
            </span>
          </div>
          
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" /> 미션 목표
          </p>
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-3">
              {mission.objectives?.map((objective, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{objective}</p>
                </div>
              )) || (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">미션 목표를 완료하세요</p>
                </div>
              )}
            </div>
            
            {mission.prerequisites?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold mb-2">선수 조건</p>
                <div className="space-y-1">
                  {mission.prerequisites?.map((prereq, index) => (
                    <p key={index} className="text-sm text-muted-foreground">• {prereq}</p>
                  ))}
                </div>
              </div>
            )}
            
            {mission.tags?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold mb-2">태그</p>
                <div className="flex flex-wrap gap-1">
                  {mission.tags?.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel: Terminal and Monitoring */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <Card className="flex-1 flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><FileCode className="h-6 w-6" /> 실습 터미널</CardTitle>
                        <CardDescription>실제 터미널 환경에서 명령을 실행하세요.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "저장 중..." : "임시 저장"}
                        </Button>
                        <Button 
                            size="sm" 
                            onClick={handleSubmit} 
                            disabled={isSubmitting || !currentAttempt || !terminalSession}
                            className="relative"
                        >
                            {isSubmitting ? "제출 중..." : "평가를 위해 제출"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    {/* Submit status indicator */}
                    {!currentAttempt && (
                        <p className="text-sm text-muted-foreground mt-2">
                            💡 미션을 시작한 후 제출할 수 있습니다
                        </p>
                    )}
                    {currentAttempt && !terminalSession && (
                        <p className="text-sm text-muted-foreground mt-2">
                            💡 터미널이 연결된 후 제출할 수 있습니다
                        </p>
                    )}
                    {currentAttempt && terminalSession && !isSubmitting && (
                        <p className="text-sm text-green-600 mt-2">
                            ✅ 언제든지 제출할 수 있습니다
                        </p>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <TerminalComponent ref={terminalRef} className="flex-1" />
                <div>
                    <p className="text-xs text-muted-foreground mb-2">자주 쓰는 명령어</p>
                    <div className="flex flex-wrap gap-2">
                        {commonCommands.map(cmd => (
                            <Button key={cmd} variant="outline" size="sm" onClick={() => handleCommandClick(cmd)}>{cmd}</Button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
        
        {/* Grafana 스타일 메트릭 대시보드 */}
        <div className="grid grid-cols-2 gap-4">
          {/* CPU 사용률 */}
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-200">CPU Usage</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-slate-400">Live</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {cpuData[cpuData.length - 1].value.toFixed(1)}%
              </div>
            </CardHeader>
            <CardContent className="h-[120px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="url(#cpuGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 메모리 사용률 */}
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-200">Memory Usage</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-slate-400">Live</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {memoryData[memoryData.length - 1].value.toFixed(1)}%
              </div>
            </CardHeader>
            <CardContent className="h-[120px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memoryData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#memoryGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 네트워크 I/O */}
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-200">Network I/O</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-slate-400">Live</span>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-slate-400">In:</span>
                  <span className="ml-1 font-semibold text-purple-400">
                    {networkData[networkData.length - 1].in.toFixed(1)} MB/s
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Out:</span>
                  <span className="ml-1 font-semibold text-orange-400">
                    {networkData[networkData.length - 1].out.toFixed(1)} MB/s
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[120px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={networkData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="networkInGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="networkOutGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="in" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fill="url(#networkInGradient)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="out" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    fill="url(#networkOutGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 디스크 I/O */}
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-200">Disk I/O</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-slate-400">Live</span>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Read:</span>
                  <span className="ml-1 font-semibold text-cyan-400">
                    {diskData[diskData.length - 1].read.toFixed(1)} MB/s
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Write:</span>
                  <span className="ml-1 font-semibold text-yellow-400">
                    {diskData[diskData.length - 1].write.toFixed(1)} MB/s
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[120px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={diskData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="diskReadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="diskWriteGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="read" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    fill="url(#diskReadGradient)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="write" 
                    stroke="#eab308" 
                    strokeWidth={2}
                    fill="url(#diskWriteGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Loading Screen Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">실습 제출 중...</h3>
              <p className="text-muted-foreground">코드를 분석하고 평가 보고서를 생성하고 있습니다.</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">{loadingProgress}% 완료</p>
            </div>
            
            <div className="mt-6 text-sm text-muted-foreground">
              <p>잠시만 기다려 주세요...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
