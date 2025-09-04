import { MissionView } from "@/components/mission-view";
import type { Mission } from "@/components/mission-ticket";

// Mock data, in a real app this would be fetched from a DB
const missionDetails: { [key: string]: Mission & { description: string; steps: { title: string; content: string }[]; objectives?: string[]; tags?: string[] } } = {
  "docker-basics": {
    id: "docker-basics",
    title: "첫 번째 컨테이너",
    difficulty: "Beginner",
    estimatedTime: 30,
    prerequisites: [],
    stack: "docker",
    city: "샌프란시스코",
    description: "Docker의 기초를 배우고 첫 번째 컨테이너를 실행해보세요. 컨테이너 생성, 실행, 관리하는 방법을 익힙니다.",
    objectives: [
      "Docker 기본 명령어 익히기",
      "컨테이너 이미지 다운로드 및 실행",
      "실행 중인 컨테이너 관리하기",
      "컨테이너 로그 확인하기"
    ],
    tags: ["docker", "container", "nginx", "beginner"],
    steps: [
      {
        title: "1단계: Docker 이미지 확인",
        content: "`docker images`를 실행하여 현재 시스템에 있는 Docker 이미지를 확인하세요."
      },
      {
        title: "2단계: Hello World 컨테이너 실행",
        content: "`docker run hello-world`를 실행하여 Docker가 제대로 작동하는지 확인하세요."
      },
      {
        title: "3단계: NGINX 웹 서버 실행",
        content: "`docker run -d -p 8080:80 --name my-nginx nginx`를 실행하여 NGINX 웹 서버를 백그라운드에서 실행하세요."
      },
      {
        title: "4단계: 컨테이너 상태 확인",
        content: "`docker ps`로 실행 중인 컨테이너를 확인하고, `docker logs my-nginx`로 로그를 확인하세요."
      }
    ]
  },
  "docker-compose": {
    id: "docker-compose",
    title: "멀티 컨테이너",
    difficulty: "Intermediate",
    estimatedTime: 45,
    prerequisites: ["Docker 기초"],
    stack: "docker",
    city: "뉴욕",
    description: "Docker Compose를 사용하여 여러 컨테이너를 함께 관리하는 방법을 배웁니다. 웹 애플리케이션과 데이터베이스를 연동해보세요.",
    objectives: [
      "Docker Compose 파일 작성하기",
      "멀티 컨테이너 애플리케이션 구성",
      "컨테이너 간 네트워킹 이해하기",
      "볼륨을 통한 데이터 관리"
    ],
    tags: ["docker", "compose", "database", "networking"],
    steps: [
      {
        title: "1단계: docker-compose.yml 작성",
        content: "웹 서버와 데이터베이스 서비스를 정의하는 `docker-compose.yml` 파일을 작성하세요."
      },
      {
        title: "2단계: 서비스 시작",
        content: "`docker-compose up -d`를 실행하여 모든 서비스를 백그라운드에서 시작하세요."
      },
      {
        title: "3단계: 서비스 확인",
        content: "`docker-compose ps`로 서비스 상태를 확인하고, 웹 브라우저에서 애플리케이션에 접속해보세요."
      },
      {
        title: "4단계: 로그 및 종료",
        content: "`docker-compose logs`로 로그를 확인하고, `docker-compose down`으로 모든 서비스를 정리하세요."
      }
    ]
  },
  "k8s-deployments": {
    id: "k8s-deployments",
    title: "기초: 배포",
    difficulty: "Intermediate",
    estimatedTime: 45,
    prerequisites: ["Docker 기초"],
    stack: "kubernetes",
    city: "베를린",
    description: "쿠버네티스 배포를 사용하여 애플리케이션을 배포, 업데이트 및 관리하는 방법을 배웁니다. 간단한 웹 서버에 대한 배포를 생성하고 노출합니다.",
    objectives: [
      "Kubernetes Deployment YAML 파일 작성하기",
      "kubectl을 사용하여 배포 리소스 생성하기",
      "Pod와 Deployment 상태 확인하기",
      "Service를 통해 애플리케이션 노출하기"
    ],
    tags: ["kubernetes", "deployment", "service", "nginx", "beginner-friendly"],
    steps: [
      {
        title: "1단계: 배포 YAML 생성",
        content: "`deployment.yaml`이라는 파일을 만듭니다. `nginx:1.14.2` 이미지의 복제본 2개를 사용하여 배포를 정의합니다. 컨테이너는 포트 80을 노출해야 합니다."
      },
      {
        title: "2단계: 배포 적용",
        content: "`kubectl apply -f deployment.yaml`을 사용하여 환경에 배포 리소스를 생성합니다."
      },
      {
        title: "3단계: 배포 확인",
        content: "`kubectl get deployments` 및 `kubectl get pods`를 사용하여 배포 및 파드의 상태를 확인합니다."
      },
      {
        title: "4단계: 배포 노출",
        content: "`NodePort` 유형의 서비스를 생성하여 NGINX 파드를 클러스터 외부 트래픽에 노출합니다. `service.yaml`을 만들고 적용하여 이 작업을 수행할 수 있습니다."
      }
    ]
  },
};

export default async function MissionPage({ params }: { params: Promise<{ mission: string }> }) {
  const { mission: missionId } = await params;
  const mission = missionDetails[missionId];

  if (!mission) {
    return <div>미션을 찾을 수 없습니다.</div>;
  }

  return (
      <MissionView mission={mission} />
  );
}
