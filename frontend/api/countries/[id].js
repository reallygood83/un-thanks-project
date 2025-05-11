import { PARTICIPATING_COUNTRIES } from '../../src/data/participatingCountries';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    
    const country = PARTICIPATING_COUNTRIES.find(c => c.id === id);
    
    if (!country) {
      return res.status(404).json({
        message: `Country with id ${id} not found`,
        success: false
      });
    }
    
    return res.status(200).json({
      message: `Successfully retrieved country with id ${id}`,
      data: country,
      success: true
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}