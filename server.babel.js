import express from 'express';
import fs from 'fs';

const app = express();
app.use(express.static('public'));
app.get('*', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(process.env.PORT || 3000);
