package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.entity.Member;

public interface MemberRepository 
			extends JpaRepository<Member, String>{
	// 아이디와 비밀번호로 조회
	Member findByIdAndPwd(String id, String pwd);
}
