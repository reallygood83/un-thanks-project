import { PARTICIPATING_COUNTRIES } from '../../src/data/participatingCountries';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Successfully retrieved countries',
      data: PARTICIPATING_COUNTRIES
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}