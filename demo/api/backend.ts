import express from 'express';

const app = express();
const port = 3000;



app.get('/api/graph-data', (req, res) => {
  const data = {
    monthlyData: [
      { month: 'Jan', value: 20 },
      { month: 'Feb', value: 40 },
      { month: 'Mar', value: 30 },
      { month: 'Apr', value: 50 },
      { month: 'May', value: 70 },
      { month: 'Jun', value: 90 },
      { month: 'Jul', value: 80 },
      { month: 'Aug', value: 100 },
      { month: 'Sep', value: 120 },
      { month: 'Oct', value: 140 },
      { month: 'Nov', value: 110 },
      { month: 'Dec', value: 100 },
    ],
  };
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
