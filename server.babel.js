import express from 'express';
import fs from 'fs';

const app = express();
app.use(express.static('public'));
app.get('/r/:room', function(req, res){
	console.log(111, req.params.room)
    res.sendFile(__dirname + '/public/index.html');
});
app.get('*', function(req, res){
	console.log(110)
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(process.env.PORT || 3000);
