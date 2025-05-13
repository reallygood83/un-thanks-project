import Letter, { ILetter } from '../models/letter';

// 편지 생성
export const createLetter = async (letterData: any): Promise<ILetter> => {
  try {
    const newLetter = new Letter(letterData);
    return await newLetter.save();
  } catch (error) {
    console.error('Error creating letter:', error);
    throw error;
  }
};

// 모든 편지 조회 (국가별 필터링 가능)
export const getLetters = async (countryId?: string): Promise<ILetter[]> => {
  try {
    const query = countryId ? { countryId } : {};
    
    // 최신순 정렬
    return await Letter.find(query).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error getting letters:', error);
    throw error;
  }
};

// ID로 특정 편지 조회
export const getLetterById = async (id: string): Promise<ILetter | null> => {
  try {
    return await Letter.findById(id);
  } catch (error) {
    console.error(`Error getting letter with ID ${id}:`, error);
    throw error;
  }
};

// 통계 데이터 조회 (국가별 편지 수)
export const getLetterStatsByCountry = async (): Promise<any[]> => {
  try {
    return await Letter.aggregate([
      { $group: { _id: '$countryId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  } catch (error) {
    console.error('Error getting letter statistics:', error);
    throw error;
  }
};

export default {
  createLetter,
  getLetters,
  getLetterById,
  getLetterStatsByCountry
};
