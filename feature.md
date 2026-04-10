[x] 프로젝트 폴더 생성 및 index.html, style.css, script.js 파일 연결 <requirement: 기술 스택>

[x] HTML에 10x10 보드가 들어갈 container 요소 생성 <requirement: 보드 시스템>

[x] CSS를 이용해 10x10 격자 레이아웃 정의 (Grid 활용) <requirement: 디자인 요구>

[x] JS에서 for문을 사용하여 100개의 div 타일을 생성하고 보드에 부착 <requirement: 보드 시스템>

[x] 보드 타일에 기본 테두리와 배경색 스타일 적용 <requirement: 디자인 요구>

Phase 2: 블록 데이터 및 생성 로직
[x] 블록 모양(I, L, O 등)을 좌표 배열(예: [[0,0], [0,1]])로 정의 <requirement: 블록 생성>

[x] 하단에 블록이 나타날 '대기 영역(Hand)' HTML 요소 추가 <requirement: 디자인 요구>

[x] 무작위로 블록 데이터 1개를 선택하는 함수 작성 <requirement: 블록 생성>

[x] 선택된 블록을 대기 영역에 시각적으로 그리는 함수 작성 <requirement: 블록 생성>

[x] 한 번에 3개의 무작위 블록을 대기 영역에 생성하는 로직 구현 <requirement: 블록 생성>

Phase 3: 드래그 앤 드롭 기초 (Interactions)
[x] 생성된 블록 요소에 draggable="true" 속성 부여 <requirement: 배치 로직>

[x] dragstart 이벤트로 현재 잡은 블록의 데이터 저장 <requirement: 배치 로직>

[x] 보드 타일에 dragover 이벤트를 걸어 드롭 가능 상태로 설정 <requirement: 배치 로직>

[x] drop 이벤트 발생 시 해당 타일의 인덱스(좌표) 로그 출력 <requirement: 배치 로직>

Phase 4: 배치 및 검증 알고리즘
[x] 드롭된 위치를 기준으로 블록의 모든 타일이 보드 안에 있는지 체크 <requirement: 배치 로직>

[x] 드롭할 위치에 이미 블록이 있는지(중복) 확인하는 함수 <requirement: 배치 로직>

[x] 배치가 가능한 경우, 보드 타일의 색상을 변경(데이터 상태 업데이트) <requirement: 배치 로직>

[x] 배치가 완료된 하단 블록은 화면에서 제거 <requirement: 배치 로직>

[x] 하단 블록 3개를 모두 쓰면 다시 3개를 생성하는 트리거 연결 <requirement: 배치 로직>

Phase 5: 라인 제거 및 점수
[x] 가로 한 줄(10칸)이 모두 채워졌는지 검사하는 함수 <requirement: 라인 제거>

[x] 세로 한 줄(10칸)이 모두 채워졌는지 검사하는 함수 <requirement: 라인 제거>

[x] 채워진 줄의 타일들을 다시 빈 상태(색상 초기화)로 변경 <requirement: 라인 제거>

[x] 블록 배치 시 기본 점수 추가 로직 <requirement: 점수 시스템>

[x] 라인 제거 시 보너스 점수 추가 및 화면 표시 <requirement: 점수 시스템>

Phase 6: 시각 효과 및 게임 종료
[x] dragenter 시 보드 위에 블록이 놓일 자리를 미리 보여주는 하이라이트 <requirement: 디자인 요구>

[x] 라인이 터질 때 CSS transition으로 부드러운 효과 추가 <requirement: 디자인 요구>

[x] 보드 전체를 순회하며 남은 블록을 놓을 곳이 있는지 확인하는 함수 <requirement: 게임 오버>

[x] 더 이상 놓을 곳이 없을 때 "Game Over" 팝업 띄우기 <requirement: 게임 오버>

[x] '다시 시작' 버튼 클릭 시 보드 및 점수 초기화 <requirement: 필수 기능>