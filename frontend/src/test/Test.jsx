import { useState } from "react"; 

function Test() {
    const [obj, setObj] = useState({});
    // 로그인
    const fetchTestData1 = async () => {
        try{
            const login_data = {
                id: "hong",
                pwd: "1234"
            };
            const response = await fetch("http://localhost:5000/login", 
                                         {  method: "POST",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify(login_data)
                                         });
            // response.json() : json 데이터를 객체로 변경하는 함수
            // => {rt: "OK", memId: "hong", memName: "홍길동"}
            const data = await response.json();
            setObj(data);
        } catch(error) {
            console.error("Error fetching data: ", error);
        }
    };
    // 글쓰기 : insert
    const fetchTestData2 = async () => {
        const board_data = {
            id: "hong",
            name: "홍길동",
            subject: "내일은",
            content: "웃으리..."
        }
        try {
            const response = await fetch("http://localhost:5000/insertBoard", 
                                     {  method: "POST",
                                        headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify(board_data)
                                     });
            const data = await response.json();
            setObj(data);
        } catch(error) {
            console.error("Error fetching data: ", error);
        }        
    };
    // 상세보기
    const fetchTestData3 = async () => {
        try {
            // 1) 조회수 증가
            await fetch("http://localhost:5000/updateHit?seq=13");
            // 2) seq로 조회하여 상세보기 데이터 가져오기
            const response = await fetch("http://localhost:5000/boardView?seq=13");
            const data = await response.json();
            setObj(data);
        } catch(error) {
            console.error("Error fetching data: ", error);
        }        
    };
    // 목록보기
    const fetchTestData4 = async () => {
        try {
            const response = await fetch("http://localhost:5000/boardList?pg=1");
            const data = await response.json();
            setObj(data);
        } catch(error) {
            console.error("Error fetching data: ", error);
        }  
    };
    // 수정하기
    const fetchTestData5 = async () => {
        const board_data = {
            seq: 13,
            subject: "내일은",
            content: "목요일입니다."
        }
        try {
            const response = await fetch("http://localhost:5000/modifyBoard", 
                                     {  method: "POST",
                                        headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify(board_data)
                                     });
            const data = await response.json();
            setObj(data);
        } catch(error) {
            console.error("Error fetching data: ", error);
        }
    };
    // 삭제하기
    const fetchTestData6 = async () => {
        try {
            const response = await fetch("http://localhost:5000/deleteBoard?seq=13");
            const data = await response.json();
            setObj(data);
        } catch(error) {
            console.error("Error fetching data: ", error);
        } 
    };

    return (
        <div style={{marginLeft: 10}}>
            <h3>데이터 확인</h3>
            <input type="button" value="로그인" onClick={fetchTestData1}/>&nbsp;
            <input type="button" value="입력" onClick={fetchTestData2}/>&nbsp;
            <input type="button" value="조회" onClick={fetchTestData3}/>&nbsp;
            <input type="button" value="목록" onClick={fetchTestData4}/>&nbsp;
            <input type="button" value="수정" onClick={fetchTestData5}/>&nbsp;
            <input type="button" value="삭제" onClick={fetchTestData6}/>&nbsp;

            <h3>결과</h3>
            {/* JSON.stringify() : 객체를 json 데이터로 변경하는 함수
                2 : 들여쓰기 문자의 개수 */}
            <p>{JSON.stringify(obj, null, 2)}</p>
        </div>
    );
}

export default Test;