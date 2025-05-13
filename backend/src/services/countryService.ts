import Country, { ICountry } from '../models/country';

export const getAllCountries = async (): Promise<ICountry[]> => {
  try {
    return await Country.find().sort({ name: 1 });
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export const getCountriesByType = async (type: string): Promise<ICountry[]> => {
  try {
    return await Country.find({ participationType: type }).sort({ name: 1 });
  } catch (error) {
    console.error(`Error fetching countries by type ${type}:`, error);
    throw error;
  }
};

export const getCountryById = async (id: string): Promise<ICountry | null> => {
  try {
    return await Country.findById(id);
  } catch (error) {
    console.error(`Error fetching country with ID ${id}:`, error);
    throw error;
  }
};

export const getCountryByCode = async (code: string): Promise<ICountry | null> => {
  try {
    // 대소문자 구분 없이 검색하기 위해 정규식 사용
    const regex = new RegExp(`^${code}$`, 'i');
    return await Country.findOne({ code: regex });
  } catch (error) {
    console.error(`Error fetching country with code ${code}:`, error);
    throw error;
  }
};

export const searchCountries = async (query: string): Promise<ICountry[]> => {
  try {
    const regex = new RegExp(query, 'i');
    return await Country.find({
      $or: [
        { name: regex },
        { description: regex },
        { history: regex },
        { relations: regex }
      ]
    }).sort({ name: 1 });
  } catch (error) {
    console.error(`Error searching countries with query "${query}":`, error);
    throw error;
  }
};

export const createCountry = async (countryData: Partial<ICountry>): Promise<ICountry> => {
  try {
    const country = new Country(countryData);
    return await country.save();
  } catch (error) {
    console.error('Error creating country:', error);
    throw error;
  }
};

export const updateCountry = async (id: string, updateData: Partial<ICountry>): Promise<ICountry | null> => {
  try {
    return await Country.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error(`Error updating country with ID ${id}:`, error);
    throw error;
  }
};

export const deleteCountry = async (id: string): Promise<ICountry | null> => {
  try {
    return await Country.findByIdAndDelete(id);
  } catch (error) {
    console.error(`Error deleting country with ID ${id}:`, error);
    throw error;
  }
};