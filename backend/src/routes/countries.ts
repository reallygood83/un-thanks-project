import express from 'express';
import * as countryService from '../services/countryService';

const router = express.Router();

// GET all countries
router.get('/', async (req, res) => {
  try {
    const countries = await countryService.getAllCountries();
    res.status(200).json({
      message: 'Successfully retrieved countries',
      data: countries
    });
  } catch (error) {
    console.error('Error in GET /countries:', error);
    res.status(500).json({
      message: 'Error retrieving countries',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET countries by participation type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const countries = await countryService.getCountriesByType(type);
    res.status(200).json({
      message: `Successfully retrieved countries of type ${type}`,
      data: countries
    });
  } catch (error) {
    console.error(`Error in GET /countries/type/${req.params.type}:`, error);
    res.status(500).json({
      message: 'Error retrieving countries by type',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET a country by country code
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const country = await countryService.getCountryByCode(code);
    
    if (!country) {
      return res.status(404).json({
        message: `Country with code ${code} not found`
      });
    }
    
    res.status(200).json({
      message: 'Successfully retrieved country',
      data: country
    });
  } catch (error) {
    console.error(`Error in GET /countries/code/${req.params.code}:`, error);
    res.status(500).json({
      message: 'Error retrieving country',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search countries
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const countries = await countryService.searchCountries(query);
    
    res.status(200).json({
      message: 'Successfully searched countries',
      data: countries
    });
  } catch (error) {
    console.error(`Error in GET /countries/search/${req.params.query}:`, error);
    res.status(500).json({
      message: 'Error searching countries',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET a single country by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const country = await countryService.getCountryById(id);
    
    if (!country) {
      return res.status(404).json({
        message: `Country with ID ${id} not found`
      });
    }
    
    res.status(200).json({
      message: 'Successfully retrieved country',
      data: country
    });
  } catch (error) {
    console.error(`Error in GET /countries/${req.params.id}:`, error);
    res.status(500).json({
      message: 'Error retrieving country',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create a new country (admin only in a real app)
router.post('/', async (req, res) => {
  try {
    const newCountry = await countryService.createCountry(req.body);
    res.status(201).json({
      message: 'Successfully created new country',
      data: newCountry
    });
  } catch (error) {
    console.error('Error in POST /countries:', error);
    res.status(500).json({
      message: 'Error creating country',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update a country (admin only in a real app)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCountry = await countryService.updateCountry(id, req.body);
    
    if (!updatedCountry) {
      return res.status(404).json({
        message: `Country with ID ${id} not found`
      });
    }
    
    res.status(200).json({
      message: 'Successfully updated country',
      data: updatedCountry
    });
  } catch (error) {
    console.error(`Error in PUT /countries/${req.params.id}:`, error);
    res.status(500).json({
      message: 'Error updating country',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete a country (admin only in a real app)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCountry = await countryService.deleteCountry(id);
    
    if (!deletedCountry) {
      return res.status(404).json({
        message: `Country with ID ${id} not found`
      });
    }
    
    res.status(200).json({
      message: 'Successfully deleted country',
      data: deletedCountry
    });
  } catch (error) {
    console.error(`Error in DELETE /countries/${req.params.id}:`, error);
    res.status(500).json({
      message: 'Error deleting country',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;