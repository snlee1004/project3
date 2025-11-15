package com.example.backend.entity;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data	// setter, getter, toString 자동 추가
@AllArgsConstructor // 모든 멤버로 구성된 생성자
@NoArgsConstructor  // 디폴트 생성자
public class Member {
	private String name;
	@Id  // primary key 설정
	private String id;
	private String pwd;
	private String gender;
	private String email1;
	private String email2;
	private String tel1;
	private String tel2;
	private String tel3;
	private String addr;
	@Temporal(TemporalType.DATE)  // 년월일 저장 설정
	private Date logtime;
}
