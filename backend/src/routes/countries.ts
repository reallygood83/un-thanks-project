import express from 'express';

const router = express.Router();

// GET all countries
router.get('/', (req, res) => {
  // In a real app, this would fetch data from a database
  res.status(200).json({
    message: 'Successfully retrieved countries',
    // Placeholder data - in a real app, this would be fetched from a database
    data: []
  });
});

// GET a single country by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // In a real app, this would fetch data from a database
  res.status(200).json({
    message: `Successfully retrieved country with id ${id}`,
    // Placeholder data - in a real app, this would be fetched from a database
    data: {}
  });
});

export default router;