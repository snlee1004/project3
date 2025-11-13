const oracledb = require("oracledb");

// db 연결 설정
const dbConfig = {
    user: "C##jspexam",
    password: "m1234",
    connectString: "localhost:1521/xe"
}
// db 연결
async function getConnection() {
    return await oracledb.getConnection(dbConfig);
}
// db 연결 종료
async function closeConnection(connection) {
    if(connection) {
        try {
            await connection.close();
        } catch(err) {
            console.error("Error closing connection: ", err);
        }        
    }     
}

// 1) 저장
// data =  { imageId: 'img_5', imageName: '진라면', imagePrice: '1000', 
//           imageQty: '10', imageContent: '맛있는 진라면', image1: 'jinra.jpg'}
async function imageboardWrite(data) {
    let conn;
    try {
        // 1. 접속하기
        conn = await getConnection();
        // 2. db 처리
        const sql = "insert into imageboard values "
                  + "(seq_imageboard.nextval, :imageId, "
                  + ":imageName, :imagePrice, :imageQty, "
                  + ":imageContent, :image1, sysdate)";
        const result = await conn.execute(sql, data, {autoCommit: true});
        return result.rowsAffected > 0 ? "OK" : "FAIL";
    } catch(err) {
        throw err;
    } finally {
        // 3. 접속끊기
        await closeConnection(conn);
    }
}
// 2) 목록
async function imageboardList(startNum, endNum) {
    let conn;
    try {
        // 1. 접속하기
        conn = await getConnection();
        // 2. db 처리
        const sql = "select * from "    
                  + "(select rownum rn, tt.* from "
                  + "(select * from imageboard order by seq desc) tt) "
                  + "where rn>=:startNum and rn<=:endNum";
        const result = await conn.execute(sql, [startNum, endNum],
                                {outFormat: oracledb.OUT_FORMAT_OBJECT});
        return result.rows;  // 객체 배열 리턴
    } catch(err) {
        throw err;
    } finally {
        // 3. 접속끊기
        await closeConnection(conn);
    }
}
// 3) 전체 데이터수 조회
async function getTotalA() {
    let conn;
    try {
        // 1. 접속하기
        conn = await getConnection();
        // 2. db 처리
        const sql = "select count(*) as cnt from imageboard";
        const result = await conn.execute(sql, [],
                                {outFormat: oracledb.OUT_FORMAT_OBJECT});
        return result.rows[0].CNT;
    } catch(err) {
        throw err;
    } finally {
        // 3. 접속끊기
        await closeConnection(conn);
    }
}
// 4) 상세보기
async function imageboardView(seq) {
    let conn;
    try {
        // 1. 접속하기
        conn = await getConnection();
        // 2. db 처리
        const sql = "select * from imageboard where seq=:seq";
        const result = await conn.execute(sql, [seq],
                                {outFormat: oracledb.OUT_FORMAT_OBJECT});
        return result.rows[0];
    } catch(err) {
        throw err;
    } finally {
        // 3. 접속끊기
        await closeConnection(conn);
    }
}
// 5) 삭제
async function imageboardDelete(seq) {
    let conn;
    try {
        // 1. 접속하기
        conn = await getConnection();
        // 2. db 처리
        const sql = "delete imageboard where seq=:seq";
        const result = await conn.execute(sql, [seq], {autoCommit: true});
        return result.rowsAffected > 0 ? "OK" : "FAIL";
    } catch(err) {
        console.error(err);
        throw err;
    } finally {
        // 3. 접속끊기
        await closeConnection(conn);
    }
}

module.exports = {
    imageboardWrite,
    imageboardList,
    getTotalA,
    imageboardView,
    imageboardDelete
};

