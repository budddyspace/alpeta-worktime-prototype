# Alpeta X · 근무시간 관리 프로토타입

## 1) 로컬 실행
```bash
npm install
npm run dev
```
- 브라우저: http://localhost:3000

## 2) GitHub 업로드
```bash
git init
git add .
git commit -m "init prototype"
git branch -M main
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

## 3) Vercel 배포
- Vercel > Add New > Project > GitHub repo 선택 > Deploy
- Framework: Next.js (자동 감지)
- 배포 완료 후 vercel.app URL 생성

## 4) PNG 아이콘 교체
- `/public/icons` 폴더에 아이콘 파일을 넣고, 컴포넌트에서 `next/image`로 교체하세요.
- 현재는 데모용으로 텍스트/이모지/원형 뱃지로 표시합니다.

## 5) 구현 범위(요청 반영)
- 메인: 편집 버튼 → 취소/저장 버튼 전환, 상세 입력 활성화
- 기준 만들기: 기준 이름 입력 후 단계별 다음, 근무유형 카드 선택 시 하단 상세 영역 노출
- 기준 생성: 생성 후 메인으로 복귀 + 리스트 상단에 신규 기준 추가
- 리스트: 사용 3 / 미사용 2 (초기 더미 데이터)
- 한글 UI 고정 / Nanum Gothic 적용
