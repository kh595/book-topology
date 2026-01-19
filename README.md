# Book Topology

책들의 연결 관계(작가, 시대, 사조, 플롯, 인물)를 3D 그래프로 시각화하고 탐험할 수 있는 웹앱

## 실행 방법

### 1. Neo4j Aura 설정 (무료)

1. [Neo4j Aura](https://neo4j.com/cloud/aura-free/) 에서 무료 계정 생성
2. 새 인스턴스 생성 후 연결 정보 복사
3. `backend/.env` 파일 생성:

```env
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password_here
```

### 2. 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

백엔드가 http://localhost:8000 에서 실행됩니다.

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드가 http://localhost:5173 에서 실행됩니다.

### 4. 샘플 데이터 가져오기

1. 웹앱에서 "+ 추가" 버튼 클릭
2. "가져오기" 탭 선택
3. `sample_data.json` 파일 업로드

## 주요 기능

- **3D 그래프 탐험**: 마우스로 회전, 확대/축소, 노드 클릭
- **필터링**: 노드 유형(책, 저자 등) 및 관계 유형별 필터
- **검색**: 책 제목 또는 저자 이름으로 검색
- **데이터 입력**: 책, 저자, 관계 직접 추가
- **데이터 가져오기**: JSON 파일로 일괄 입력

## 기술 스택

- **프론트엔드**: React + TypeScript + 3d-force-graph
- **백엔드**: FastAPI (Python)
- **데이터베이스**: Neo4j Aura (무료)
