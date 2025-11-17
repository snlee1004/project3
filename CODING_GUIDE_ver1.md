# CODING_GUIDELINES
- **프로젝트명**: 플랜잇
- **기술 스택**: react : frontend -> React + Vite
                springboot : backend
                db : oreacle 
                Java 17+

## 🏗️ 프로젝트 구조

project-root/
 ├── backend/        # Spring Boot
 │     ├── src/
 │     ├── build.gradle or pom.xml
 │     └── ...
 ├── frontend/       # React
 │     ├── src/
 │     ├── package.json
 │     └── ...
 ├── README.md

root/
  backend -> Spring Boot 3 + Gradle 기반 API 서버
  frontend -> React + Vite 기반 프론트엔드


## 📚 추가 참고사항
일정 등록/조회/수정/삭제가 가능한 일정 관리 프로그램의 기본 구조

### 1. 기존 코드 활용
- **기존 코드를 적극 반영**하여 일관성 유지
- **비슷한 기능이 있다면 참고**하여 구현

### 2. 기능 구현 순서
1. **DTO 클래스** 생성
2. **엔티티 클래스** 생성
3. **Repository 인터페이스** 생성  
4. **DAO 클래스** 생성
5. **Service 클래스** 생성
6. **Controller 클래스** 생성


### 3. 테스트
- **기능 구현 후 순차적으로 다음 지시사항** 확인
- **에러 발생 시 즉시 수정**

## 📊 오라클 DB 테이블 생성 쿼리


### 1. 회원(MEMBER) 테이블
```sql
-- 회원 테이블 생성
CREATE TABLE MEMBER1 (
    MEM_ID VARCHAR2(50) PRIMARY KEY,           -- 회원 ID (PK)
    MEM_PWD VARCHAR2(100) NOT NULL,            -- 비밀번호
    MEM_NAME VARCHAR2(50) NOT NULL,             -- 이름
    MEM_EMAIL VARCHAR2(100) NOT NULL,           -- 이메일
    MEM_PHONE VARCHAR2(20),                    -- 전화번호 (선택사항)
    MEM_ADDRESS VARCHAR2(200),                 -- 주소 (선택사항, 구글 캘린더 연동용)
    GOOGLE_EMAIL VARCHAR2(100),                -- 구글 이메일 (구글 캘린더 연동)
    GOOGLE_CALENDAR_ID VARCHAR2(100),          -- 구글 캘린더 ID
    CREATED_AT DATE DEFAULT SYSDATE,            -- 가입일
    UPDATED_AT DATE DEFAULT SYSDATE            -- 수정일
);

-- 회원 테이블 인덱스 생성
CREATE INDEX IDX_MEMBER_EMAIL ON MEMBER1(MEM_EMAIL);
CREATE INDEX IDX_MEMBER_GOOGLE_EMAIL ON MEMBER1(GOOGLE_EMAIL);
```

### 2. 일정(EVENT) 테이블
```sql
-- 일정 테이블 생성
CREATE TABLE EVENT (
    EVENT_ID NUMBER PRIMARY KEY,               -- 일정 ID (PK, 시퀀스 사용)
    MEM_ID VARCHAR2(50) NOT NULL,              -- 회원 ID (FK)
    EVENT_TITLE VARCHAR2(200) NOT NULL,        -- 일정 제목
    EVENT_DESCRIPTION CLOB,                    -- 일정 설명
    START_DATE DATE NOT NULL,                  -- 시작 날짜
    END_DATE DATE NOT NULL,                    -- 종료 날짜
    START_TIME VARCHAR2(10),                   -- 시작 시간 (HH:MM 형식)
    END_TIME VARCHAR2(10),                     -- 종료 시간 (HH:MM 형식)
    COLOR VARCHAR2(20) DEFAULT '#007bff',      -- 색상 코드
    CATEGORY VARCHAR2(50),                     -- 카테고리
    IS_COMPLETED CHAR(1) DEFAULT 'N',           -- 완료 여부 (Y/N)
    REMINDER CHAR(1) DEFAULT 'N',              -- 알림 설정 여부 (Y/N)
    REMINDER_TIME VARCHAR2(10),                -- 알림 시점 ('1day', '1hour', '30min', '10min')
    REMINDER_DATETIME DATE,                    -- 계산된 알림 시간
    CREATED_AT DATE DEFAULT SYSDATE,            -- 생성일
    UPDATED_AT DATE DEFAULT SYSDATE,            -- 수정일
    CONSTRAINT FK_EVENT_MEMBER FOREIGN KEY (MEM_ID) REFERENCES MEMBER1(MEM_ID) ON DELETE CASCADE
);

-- 일정 테이블 시퀀스 생성
CREATE SEQUENCE SEQ_EVENT_ID
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- 일정 테이블 인덱스 생성
CREATE INDEX IDX_EVENT_MEM_ID ON EVENT(MEM_ID);
CREATE INDEX IDX_EVENT_START_DATE ON EVENT(START_DATE);
CREATE INDEX IDX_EVENT_END_DATE ON EVENT(END_DATE);
CREATE INDEX IDX_EVENT_IS_COMPLETED ON EVENT(IS_COMPLETED);
```

### 3. Todo(TODO) 테이블
```sql
-- Todo 테이블 생성
CREATE TABLE TODO (
    TODO_ID NUMBER PRIMARY KEY,                -- Todo ID (PK, 시퀀스 사용)
    MEM_ID VARCHAR2(50) NOT NULL,              -- 회원 ID (FK)
    TODO_TITLE VARCHAR2(200),                 -- Todo 제목 (선택사항)
    TODO_CONTENT VARCHAR2(1000) NOT NULL,      -- Todo 내용
    IS_COMPLETED CHAR(1) DEFAULT 'N',          -- 완료 여부 (Y/N)
    CREATED_AT DATE DEFAULT SYSDATE,            -- 생성일
    UPDATED_AT DATE DEFAULT SYSDATE,            -- 수정일
    CONSTRAINT FK_TODO_MEMBER FOREIGN KEY (MEM_ID) REFERENCES MEMBER1(MEM_ID) ON DELETE CASCADE
);

-- Todo 테이블 시퀀스 생성
CREATE SEQUENCE SEQ_TODO_ID
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Todo 테이블 인덱스 생성
CREATE INDEX IDX_TODO_MEM_ID ON TODO(MEM_ID);
CREATE INDEX IDX_TODO_IS_COMPLETED ON TODO(IS_COMPLETED);
CREATE INDEX IDX_TODO_CREATED_AT ON TODO(CREATED_AT);
```

-----------------------------------------------------------------------
```
-- 여기까지 테이블 완성
-----------------------------------------------------------------------


### 4. 테이블 관계도
```
MEMBER1 (회원)
  ├── MEM_ID (PK)
  │
  ├── EVENT (일정)
  │   ├── EVENT_ID (PK)
  │   └── MEM_ID (FK) → MEMBER1.MEM_ID
  │
  └── TODO (Todo)
      ├── TODO_ID (PK)
      └── MEM_ID (FK) → MEMBER1.MEM_ID
```

### 5. 초기 테스트 데이터 삽입 (선택사항)
```sql
-- 테스트 회원 데이터
INSERT INTO MEMBER1 (MEM_ID, MEM_PWD, MEM_NAME, MEM_EMAIL, CREATED_AT, UPDATED_AT)
VALUES ('test', '1111', '테스트 사용자', 'test@example.com', SYSDATE, SYSDATE);

COMMIT;
```

### 6. 테이블 삭제 순서 (필요시)
```sql
-- 외래키 제약조건 때문에 순서대로 삭제
DROP TABLE TODO;
DROP TABLE EVENT;
DROP TABLE MEMBER1;

-- 시퀀스 삭제
DROP SEQUENCE SEQ_TODO_ID;
DROP SEQUENCE SEQ_EVENT_ID;
```

-----------------------------------------------------------------------------
```

###  회원 테이블 코멘트 (선택사항 : 테이블 코멘트는 안해도됨)
```sql
COMMENT ON TABLE MEMBER1 IS '회원 정보 테이블';
COMMENT ON COLUMN MEMBER1.MEM_ID IS '회원 ID (PK)';
COMMENT ON COLUMN MEMBER1.MEM_PWD IS '비밀번호';
COMMENT ON COLUMN MEMBER1.MEM_NAME IS '이름';
COMMENT ON COLUMN MEMBER1.MEM_EMAIL IS '이메일';
COMMENT ON COLUMN MEMBER1.MEM_PHONE IS '전화번호';
COMMENT ON COLUMN MEMBER1.MEM_ADDRESS IS '주소 (구글 캘린더 연동용)';
COMMENT ON COLUMN MEMBER1.GOOGLE_EMAIL IS '구글 이메일 (구글 캘린더 연동)';
COMMENT ON COLUMN MEMBER1.GOOGLE_CALENDAR_ID IS '구글 캘린더 ID';
COMMENT ON COLUMN MEMBER1.CREATED_AT IS '가입일';
COMMENT ON COLUMN MEMBER1.UPDATED_AT IS '수정일';
```

### 일정 테이블 코멘트 (선택사항 : 테이블 코멘트는 안해도됨)
```sql
COMMENT ON TABLE EVENT IS '일정 정보 테이블';
COMMENT ON COLUMN EVENT.EVENT_ID IS '일정 ID (PK)';
COMMENT ON COLUMN EVENT.MEM_ID IS '회원 ID (FK)';
COMMENT ON COLUMN EVENT.EVENT_TITLE IS '일정 제목';
COMMENT ON COLUMN EVENT.EVENT_DESCRIPTION IS '일정 설명';
COMMENT ON COLUMN EVENT.START_DATE IS '시작 날짜';
COMMENT ON COLUMN EVENT.END_DATE IS '종료 날짜';
COMMENT ON COLUMN EVENT.START_TIME IS '시작 시간';
COMMENT ON COLUMN EVENT.END_TIME IS '종료 시간';
COMMENT ON COLUMN EVENT.COLOR IS '색상 코드';
COMMENT ON COLUMN EVENT.CATEGORY IS '카테고리';
COMMENT ON COLUMN EVENT.IS_COMPLETED IS '완료 여부 (Y/N)';
COMMENT ON COLUMN EVENT.REMINDER IS '알림 설정 여부 (Y/N)';
COMMENT ON COLUMN EVENT.REMINDER_TIME IS '알림 시점';
COMMENT ON COLUMN EVENT.REMINDER_DATETIME IS '계산된 알림 시간';
COMMENT ON COLUMN EVENT.CREATED_AT IS '생성일';
COMMENT ON COLUMN EVENT.UPDATED_AT IS '수정일';
```

### Todo 테이블 코멘트
```sql
COMMENT ON TABLE TODO IS 'Todo (노트 메모장) 테이블';
COMMENT ON COLUMN TODO.TODO_ID IS 'Todo ID (PK)';
COMMENT ON COLUMN TODO.MEM_ID IS '회원 ID (FK)';
COMMENT ON COLUMN TODO.TODO_TITLE IS 'Todo 제목';
COMMENT ON COLUMN TODO.TODO_CONTENT IS 'Todo 내용';
COMMENT ON COLUMN TODO.IS_COMPLETED IS '완료 여부 (Y/N)';
COMMENT ON COLUMN TODO.CREATED_AT IS '생성일';
COMMENT ON COLUMN TODO.UPDATED_AT IS '수정일';
```

