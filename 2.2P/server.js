const express = require('express');
const app = express();


app.get('/add', (req, res) => {
    
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    
    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({ error: 'Invalid numbers provided' });
    }

    
    const sum = num1 + num2;

    
    res.json({ num1, num2, sum });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});