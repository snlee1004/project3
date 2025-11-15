package com.example.backend.contoller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.example.backend.dto.MemberDTO;
import com.example.backend.entity.Member;
import com.example.backend.repository.MemberRepository;


@RestController  // Rest API 작업용 어노테이션
// react 서버에서 동작할 때 사용,
// postman으로 테스트할 때는 주석처리함
@CrossOrigin(origins = "http://localhost:5173") // 특정 도메인만 허용
public class MemberController {
	@Autowired
	MemberRepository memberRepository;
	
	// http://localhost:8080/login
	@PostMapping("/login")
	// @RequestBody : json 데이터에서 해당되는 값을 저장시킴
	// 리턴값을 Map을 설정하면, json 데이터로 응답된다.
	public Map<String, Object> login(@RequestBody MemberDTO dto) {
		System.out.println(dto.toString());
		Map<String, Object> map = new HashMap<String, Object>();
		// id와 pwd로 조회하기
		Member member = 
			memberRepository.findByIdAndPwd(dto.getId(), dto.getPwd());
		// 결과 처리
		if(member != null) {
			map.put("rt", "OK");
			map.put("memId", member.getId());
			map.put("memName", member.getName());
		} else {
			map.put("rt", "FAIL");
		}
		
		return map;
	}
}
