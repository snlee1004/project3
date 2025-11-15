// 한국 공휴일 및 기념일 데이터
// 양력 고정 공휴일
const fixedHolidays = {
  '01-01': { name: '신정', type: 'holiday' },
  '03-01': { name: '삼일절', type: 'holiday' },
  '05-05': { name: '어린이날', type: 'holiday' },
  '06-06': { name: '현충일', type: 'holiday' },
  '08-15': { name: '광복절', type: 'holiday' },
  '10-03': { name: '개천절', type: 'holiday' },
  '10-09': { name: '한글날', type: 'holiday' },
  '12-25': { name: '크리스마스', type: 'holiday' },
};

// 음력 공휴일 (2024-2025년 기준, 추후 확장 가능)
const lunarHolidays = {
  '2024': {
    '01-29': { name: '설날', type: 'holiday' }, // 2024년 설날
    '01-30': { name: '설날', type: 'holiday' },
    '01-31': { name: '설날', type: 'holiday' },
    '05-15': { name: '부처님오신날', type: 'holiday' }, // 2024년 부처님오신날
    '09-16': { name: '추석', type: 'holiday' }, // 2024년 추석
    '09-17': { name: '추석', type: 'holiday' },
    '09-18': { name: '추석', type: 'holiday' },
  },
  '2025': {
    '01-28': { name: '설날', type: 'holiday' }, // 2025년 설날
    '01-29': { name: '설날', type: 'holiday' },
    '01-30': { name: '설날', type: 'holiday' },
    '05-05': { name: '부처님오신날', type: 'holiday' }, // 2025년 부처님오신날
    '10-05': { name: '추석', type: 'holiday' }, // 2025년 추석
    '10-06': { name: '추석', type: 'holiday' },
    '10-07': { name: '추석', type: 'holiday' },
  },
};

// 기념일 (공휴일이 아닌 기념일)
const memorialDays = {
  '02-14': { name: '밸런타인데이', type: 'memorial' },
  '03-14': { name: '화이트데이', type: 'memorial' },
  '04-05': { name: '식목일', type: 'memorial' },
  '04-14': { name: '블랙데이', type: 'memorial' },
  '05-08': { name: '어버이날', type: 'memorial' },
  '05-15': { name: '스승의날', type: 'memorial' },
  '05-21': { name: '부부의날', type: 'memorial' },
  '06-14': { name: '로즈데이', type: 'memorial' },
  '07-17': { name: '제헌절', type: 'memorial' },
  '11-11': { name: '빼빼로데이', type: 'memorial' },
  '12-31': { name: '연말', type: 'memorial' },
};

// 날짜 포맷팅 (MM-DD)
const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

// 특정 날짜의 휴일/기념일 정보 가져오기
export const getHolidayInfo = (date) => {
  const dateStr = formatDate(date);
  const year = date.getFullYear().toString();

  // 양력 고정 공휴일 확인
  if (fixedHolidays[dateStr]) {
    return fixedHolidays[dateStr];
  }

  // 음력 공휴일 확인
  if (lunarHolidays[year] && lunarHolidays[year][dateStr]) {
    return lunarHolidays[year][dateStr];
  }

  // 기념일 확인
  if (memorialDays[dateStr]) {
    return memorialDays[dateStr];
  }

  return null;
};

// 특정 날짜가 공휴일인지 확인
export const isHoliday = (date) => {
  const holidayInfo = getHolidayInfo(date);
  return holidayInfo && holidayInfo.type === 'holiday';
};

// 특정 날짜가 기념일인지 확인
export const isMemorialDay = (date) => {
  const holidayInfo = getHolidayInfo(date);
  return holidayInfo && holidayInfo.type === 'memorial';
};

// 특정 월의 모든 휴일/기념일 가져오기
export const getHolidaysForMonth = (year, month) => {
  const holidays = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const holidayInfo = getHolidayInfo(date);
    if (holidayInfo) {
      holidays.push({
        date: new Date(date),
        ...holidayInfo
      });
    }
  }

  return holidays;
};

// 특정 연도의 모든 휴일/기념일 가져오기
export const getHolidaysForYear = (year) => {
  const holidays = [];
  
  for (let month = 0; month < 12; month++) {
    const monthHolidays = getHolidaysForMonth(year, month);
    holidays.push(...monthHolidays);
  }

  return holidays;
};

