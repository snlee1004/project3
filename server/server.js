const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const imageboardDao = require("./dao/imageboardDAO");

const app = express();
const PORT = 5000;

// middle ware
app.use(cors());
// uploads 폴더를 정적 폴더로 설정
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.json());

// uploads 폴더가 없으면 생성
if(!fs.existsSync("uploads/")) fs.mkdirSync("uploads/");
// 업로드 파일 저장 설정
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/"); // 저장 폴더 설정
    },
    filename: function(req, file, cb) {
        const uniqueName = file.originalname;
        cb(null, uniqueName);  // 저장 파일명 설정
    }
});
// multer 객체 생성
const upload = multer({storage});

// 1) 글 등록
app.post("/imageboard/imageboardWrite", upload.single("img"), 
         async (req, res) => {
    const {imageId, imageName, imagePrice, imageQty, imageContent} = req.body;
    const img = req.file.originalname;

    const result = await imageboardDao.imageboardWrite({
        imageId, imageName, imagePrice, imageQty, imageContent,
        image1: img
    });
    // 결과 응답
    res.json({rt: result});
});

// 2) 목록보기 + 페이징
// http://localhost:5000/imageboard/imageboardList?pg=1
app.get("/imageboard/imageboardList", async (req, res) => {
    let pg = 1;
    if(req.query.pg) pg = Number(req.query.pg);
    // 1) 목록 : 5개
    const endNum = pg * 5;
    const startNum = endNum - 4;
    const rows = await imageboardDao.imageboardList(startNum, endNum);

    // 2) 페이징 : 3블럭
    const totalA = await imageboardDao.getTotalA(); // 총 데이터 개수
    const totalP = parseInt((totalA + 4) / 5);      // 총 페이지수
    const startPage = Math.floor((pg-1)/3) * 3 + 1;
    let endPage = startPage + 2;
    if(endPage > totalP) endPage = totalP;

    // 3) 결과 응답
    // 객체배열 모양 수정 : 대문자를 소문자로, 년월일로 수정
    const items = rows.map(row => ({
        seq: row.SEQ,
        imageId: row.IMAGEID,
        imageName: row.IMAGENAME,
        imagePrice: row.IMAGEPRICE,
        imageQty: row.IMAGEQTY,
        imageContent: row.IMAGECONTENT,
        image1: row.IMAGE1,
        logtime: row.LOGTIME.toLocaleDateString("sv-SE"),
    }));
    // 응답 데이터 개수
    const total = items.length;
    // 결과 응답
    res.json({
        rt: "OK",
        total, pg, totalP, startPage, endPage, items
    });
});

// 3) 상세보기
// http://localhost:5000/imageboard/imageboardView?seq=5
app.get("/imageboard/imageboardView", async (req, res) => {
    const seq = req.query.seq;
    const row = await imageboardDao.imageboardView(seq);

    if(row) {
        // 객체 모양 수정 : 대문자를 소문자로, 년월일로 수정
        const item = {
            seq: row.SEQ,
            imageId: row.IMAGEID,
            imageName: row.IMAGENAME,
            imagePrice: row.IMAGEPRICE,
            imageQty: row.IMAGEQTY,
            imageContent: row.IMAGECONTENT,
            image1: row.IMAGE1,
            logtime: row.LOGTIME.toLocaleDateString("sv-SE"),
        };
        // 결과 응답
        res.json({
            rt: "OK",
            total: 1,
            item: item
        });
    } else {
        res.json({rt: "FAIL"});
    }
});

// 4) 글 삭제
// http://localhost:5000/imageboard/imageboardDelete?seq=5
app.get("/imageboard/imageboardDelete", async (req, res) => {
    const seq = req.query.seq;
    const result = await imageboardDao.imageboardDelete(seq);    
    res.json({rt: result});
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});



