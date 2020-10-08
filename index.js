//#region  whats app BOT
const wa = require('@open-wa/wa-automate');

wa.create().then(client => start(client));

function start(client) {
  client.onMessage(message => {
    if (message.body === 'Hi') {
      client.sendText(message.from, '👋 Hello!');
    }
  });
  function sendMessWhatsApp(){
      console.log("Niceee!");
  }
}
//#endregion


var CANIload = true;
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var $isLogin = 0;
var bodyparser = require("body-parser");
server.listen(3000);

const facebook = require('fb-messenger-bot-api');
const messageClient = new facebook.FacebookMessagingAPIClient("EAALULT5RuccBACmSQo3FDC3vY5zukoGUbV9vOvZCaUfP3f16y5jSka9RNvkwNQNHMfcZBidZCGLSyFRQnwO1HtscPZASCla0ZCkGcesmIbIZBCb3ZBOdj14x35ZCGZBW0GkUdUaAp6h2pMeQA5TPqttNGMdaRZBB9XbcrIndyEAunjmVlwWi1dVH7ZA");

//отслеживание ссылки
app.get('/', function(request,respons){
    respons.sendFile(__dirname + '/index.html');
});//если пользователь будет на главной странице оо его перекинет на index.html


app.get('/operator', function(request,respons){
    if($isLogin == 0){
        respons.sendFile(__dirname + '/login.html');
    }
    else{
        respons.sendFile(__dirname + '/operator.html');
    }
});

app.get('/login', function(request,respons){
    respons.sendFile(__dirname + '/login.html');
});


users = [];
connections = [];

io.sockets.on('connection', function(socket){
    console.log("Успешное соединение");
    connections.push(socket);

    socket.on('disconnect', function(data){//если человек выход из сайта(отключаеться) то удаляем его из массива
        connections.splice(connections.indexOf(socket), 1);
        console.log("Отключились");
    });
    
    socket.on('canIload', function(){//data єто параметр который мы передаем в index.html
        if(CANIload == true){
            io.sockets.emit('canLoadOperator');
        }
    });

    socket.on('send mess', function(data){//data єто параметр который мы передаем в index.html
        io.sockets.emit('add mess', {mess: data.mess, name: data.name, userID: data.userID});
    });

    socket.on('send messOperatorTelegram', function(data){//data єто параметр который мы передаем в index.html
        botTelegramMessage(data.userID, data.mess);
    });
    socket.on('send messOperatorViber', function(data){//data єто параметр который мы передаем в index.html
        botViberMessage(data.userID, data.mess);
    });
    socket.on('send messOperatorFacebook', function(data){//data єто параметр который мы передаем в index.html
        botFacebookMessage(data.userID, data.mess);
    });
    socket.on('send messOperator', function(data){
        io.sockets.emit('add messOperator', {mess: data.mess, userID: data.userID});
    });

    socket.on('new name', function(data){
        io.sockets.emit('add name', {name: data.name, userID: data.userId});
    });
    socket.on('send login', function(data){
        $isLogin = data.isTrue;
        io.sockets.emit('add login', {check: data.isTrue});
    });
    socket.on('loadUser', function(data){
        loadUser(data.userID).then(tabl => {
            for($i=0;$i<tabl.length;$i++){
                io.sockets.emit('homeLoadUser', {oldMess: tabl[$i]});
            }
        });
    });
    
    socket.on('loadOperator', function(){
        users = [
            ["Sergei","42131dfaf3cd","2019.01.23","sessionId23", 1, "Some message"]//name userId  dateOfMessage  sessionId dispetcherId  message  
        ];
        sessions = [
            [,]
        ];
        usersMessages = [
            [,]
        ];
        sessionsViber = [
            [,]
        ];
        usersMessagesFacebook = [
            [,]
        ];
        sessionsFacebook = [
            [,]
        ];
        checkForOperator().then(tabl => {
            for($i=0;$i<tabl.length;$i++){
                io.sockets.emit('homeLoadOperator', {name: tabl[$i].name, userId: tabl[$i].id, mess: tabl[$i].message});
            }
        });
        
    });

    socket.on('closeWindow', function(data){
        addNewMessage(data.userId, data.mess, data.name, data.timeMess, data.sessionId, data.operatorId);
    });
    
    socket.on('closeOperator', function(){
        CANIload = false;
        closeOp();
    });
});

async function addNewMessage($userID,$Message,$nameUser,$timeMessage,$idSession, $idOperator){
    
    const { GoogleSpreadsheet } = require('google-spreadsheet');

    // spreadsheet key is the long id in the sheets URL
    const creds = require('./argumentwidjet-011f45de6409.json'); // the file saved above
    const doc = new GoogleSpreadsheet('1iA6eKRha9rPMLtPlilRlbNZV0Dq7MNLRetJvTcYUfTw');
    await doc.useServiceAccountAuth(creds);
    
    // or preferably, loading that info from env vars / config instead of the file
    await doc.useServiceAccountAuth({
      client_email: "widjet-argumentagency@argumentwidjet.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCT/qwpJTX6XjrO\nh4tVEX33E1nIwPn7unJZot9kAuLAoFm3ISQyCP7Y5lxXuxEOfILYQg9Zqsco/FoM\nPHgEqtlPtFx7ArnmlpV4T+tym+mpL8BqAvao43RmCfphtJQMjyS5/FsRJVcuDWl1\niAKMzfM08bIcMJOGmFdy/r47RMIIrvaIwMKPMdlqlzaTOXhqHhbnYDq0U7bolk+N\nuZW7w2z65rl/06sexGxv9PugXGaIgnAcshpjH+NMpI143IzhW+KvYX6sRrQ5IVnb\nBpzNi33nykJ10LAF0NMYe5n8oRJl1q0y1yfkrCUmRkdRSzAdhe1gfSGOmbEVU2qh\ngdj08UHlAgMBAAECggEALApQ1CuxHPDWoige0/FRIWn+QWn/2iO5LKh1vs7HCJiP\nKhpwKX2YzRX8K9VMtZli3JUH+WCDRNSXvWVvN8BZy8i57pc4mAB+uV9bCu+PwJun\nsERyf360YDse6d1xYy1juf75YKhSga9XDzUqwRj2g25bWN0xwY9rEprxJDUJYsiu\nOYWbSgNAaz4x4YSj5VsA/9Ymt4ki/zi/9c2svUUd20hBeLD+TyiXzn35qBgJsHPc\nj4y/WZPZBIGU5SKsRoyDSJtF156sKv6eeDMzsDGHB37PFq6DZXRoNaI6YuQ6jLm5\n77RACwkIIlfx0FQWAJhs/6zacqn2QBqIgHKxbc+4nwKBgQDLguV79658FyrZbZNV\nN/pMRTzOcWGjOXKrJIMjjt7+PHpgZt72UnAV/dOFtrZlEU80nageNUec93AdUKtr\nJIj+0pPFJPqKvNKNgGc3oHc8TljbCh1sRYCk9kFUW2PevGrDr8tE0nijMYvy93K6\nlgo4REXQ6B+PWSkzKw1xgS1nYwKBgQC6KjnNZKJbb4ud0ZLFOs38QPKXbqOgNJY2\n9hq8P8HL7itjW0cxfCkWFCyGOLNMlr4T+TQYpXAfAEm+Zr7XH5+S+1yFsyjawCD3\nrIRKWMtPKlQ/to2LaMnDMP7rj4X4LfgzIgaeuV9/u4+RWlbPh2K/A0pupOjeRTjF\nx9zi4yyoFwKBgQDF6/q1Us+eHYXtybSFJ5jEvn2BpSE49jEAItVrKpLSnQzDXqiu\n1MPvj1k87NJ8fpYSbNXI8zY/gSHHUOI1pGWbtj5CeFE1xqfbOCqqHeR4gRXHiRHO\nb9XKGTi2Ct+ZCpOm1vwQZcUvqYsa8+7fafZsfHGN14KCDkuUWOWNIv1+UwKBgAHX\nOQsW26Qbzj2ZPOJGWpML8Vod9fA3lOSmOk1yM/BYQoWQ+Xs7xww41tfc56jyNJ7t\n793uhNVJo3EGgwyNe35wjdGkm9rN24WXZxd1GU2HFZ4rp+qg9p2/dkXN/X0etz2K\nMJaRLqiMqja9te4HYKqS1cGST9sixBTwjPaRWHexAoGBAJOcbak+RSYQbbtXqrs5\nBH14oASxCkwRoFOU9/gb3B7az52aKD6d9g5jI6gqN/z9BpfEhDRdiT4V82ZuUXJe\n2PiB/vqEhNj8pvH8V423lrwwXhCxJBMD0GPWw9db/nFc8CbM+1NRNq4xhIdwEiAs\n2WzSsc8okGno/b1CwdaQBcnb\n-----END PRIVATE KEY-----\n",
    });

    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByIndex[0];

    for($i=0;$i<$Message.length;$i++){
        await sheet.addRow({ name: $nameUser[$i], userId: $userID, message: $Message[$i], dispetcherId: $idOperator, sessionId: $idSession, time: $timeMessage[$i]});
    }
}

async function loadUser($userID){
    const { GoogleSpreadsheet } = require('google-spreadsheet');

    // spreadsheet key is the long id in the sheets URL
    const creds = require('./argumentwidjet-011f45de6409.json'); // the file saved above
    const doc = new GoogleSpreadsheet('1iA6eKRha9rPMLtPlilRlbNZV0Dq7MNLRetJvTcYUfTw');
    await doc.useServiceAccountAuth(creds);
    
    // or preferably, loading that info from env vars / config instead of the file
    await doc.useServiceAccountAuth({
      client_email: "widjet-argumentagency@argumentwidjet.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCT/qwpJTX6XjrO\nh4tVEX33E1nIwPn7unJZot9kAuLAoFm3ISQyCP7Y5lxXuxEOfILYQg9Zqsco/FoM\nPHgEqtlPtFx7ArnmlpV4T+tym+mpL8BqAvao43RmCfphtJQMjyS5/FsRJVcuDWl1\niAKMzfM08bIcMJOGmFdy/r47RMIIrvaIwMKPMdlqlzaTOXhqHhbnYDq0U7bolk+N\nuZW7w2z65rl/06sexGxv9PugXGaIgnAcshpjH+NMpI143IzhW+KvYX6sRrQ5IVnb\nBpzNi33nykJ10LAF0NMYe5n8oRJl1q0y1yfkrCUmRkdRSzAdhe1gfSGOmbEVU2qh\ngdj08UHlAgMBAAECggEALApQ1CuxHPDWoige0/FRIWn+QWn/2iO5LKh1vs7HCJiP\nKhpwKX2YzRX8K9VMtZli3JUH+WCDRNSXvWVvN8BZy8i57pc4mAB+uV9bCu+PwJun\nsERyf360YDse6d1xYy1juf75YKhSga9XDzUqwRj2g25bWN0xwY9rEprxJDUJYsiu\nOYWbSgNAaz4x4YSj5VsA/9Ymt4ki/zi/9c2svUUd20hBeLD+TyiXzn35qBgJsHPc\nj4y/WZPZBIGU5SKsRoyDSJtF156sKv6eeDMzsDGHB37PFq6DZXRoNaI6YuQ6jLm5\n77RACwkIIlfx0FQWAJhs/6zacqn2QBqIgHKxbc+4nwKBgQDLguV79658FyrZbZNV\nN/pMRTzOcWGjOXKrJIMjjt7+PHpgZt72UnAV/dOFtrZlEU80nageNUec93AdUKtr\nJIj+0pPFJPqKvNKNgGc3oHc8TljbCh1sRYCk9kFUW2PevGrDr8tE0nijMYvy93K6\nlgo4REXQ6B+PWSkzKw1xgS1nYwKBgQC6KjnNZKJbb4ud0ZLFOs38QPKXbqOgNJY2\n9hq8P8HL7itjW0cxfCkWFCyGOLNMlr4T+TQYpXAfAEm+Zr7XH5+S+1yFsyjawCD3\nrIRKWMtPKlQ/to2LaMnDMP7rj4X4LfgzIgaeuV9/u4+RWlbPh2K/A0pupOjeRTjF\nx9zi4yyoFwKBgQDF6/q1Us+eHYXtybSFJ5jEvn2BpSE49jEAItVrKpLSnQzDXqiu\n1MPvj1k87NJ8fpYSbNXI8zY/gSHHUOI1pGWbtj5CeFE1xqfbOCqqHeR4gRXHiRHO\nb9XKGTi2Ct+ZCpOm1vwQZcUvqYsa8+7fafZsfHGN14KCDkuUWOWNIv1+UwKBgAHX\nOQsW26Qbzj2ZPOJGWpML8Vod9fA3lOSmOk1yM/BYQoWQ+Xs7xww41tfc56jyNJ7t\n793uhNVJo3EGgwyNe35wjdGkm9rN24WXZxd1GU2HFZ4rp+qg9p2/dkXN/X0etz2K\nMJaRLqiMqja9te4HYKqS1cGST9sixBTwjPaRWHexAoGBAJOcbak+RSYQbbtXqrs5\nBH14oASxCkwRoFOU9/gb3B7az52aKD6d9g5jI6gqN/z9BpfEhDRdiT4V82ZuUXJe\n2PiB/vqEhNj8pvH8V423lrwwXhCxJBMD0GPWw9db/nFc8CbM+1NRNq4xhIdwEiAs\n2WzSsc8okGno/b1CwdaQBcnb\n-----END PRIVATE KEY-----\n",
    });

    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByIndex[0];

    
    // read rows
    var $mess = new Array();
    const rows = await sheet.getRows();
    for await(let i of rows){
        if(i.userId == $userID){
            if(i.name == "Оператор"){
                $mess.push('<div class="word alert alert-success"><b>'+i.name+'</b>: '+i.message+'<p class="timeP">'+i.time+'</p></div>');
            }else{
                $mess.push('<div class="word alert alert-primary"><b>'+i.name+'</b>: '+i.message+'<p class="timeP">'+i.time+'</p></div>');
            }
        }
    }
    return $mess;
}

async function checkForOperator(){
    const { GoogleSpreadsheet } = require('google-spreadsheet');

    // spreadsheet key is the long id in the sheets URL
    const creds = require('./argumentwidjet-011f45de6409.json'); // the file saved above
    const doc = new GoogleSpreadsheet('1iA6eKRha9rPMLtPlilRlbNZV0Dq7MNLRetJvTcYUfTw');
    await doc.useServiceAccountAuth(creds);
    
    // or preferably, loading that info from env vars / config instead of the file
    await doc.useServiceAccountAuth({
      client_email: "widjet-argumentagency@argumentwidjet.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCT/qwpJTX6XjrO\nh4tVEX33E1nIwPn7unJZot9kAuLAoFm3ISQyCP7Y5lxXuxEOfILYQg9Zqsco/FoM\nPHgEqtlPtFx7ArnmlpV4T+tym+mpL8BqAvao43RmCfphtJQMjyS5/FsRJVcuDWl1\niAKMzfM08bIcMJOGmFdy/r47RMIIrvaIwMKPMdlqlzaTOXhqHhbnYDq0U7bolk+N\nuZW7w2z65rl/06sexGxv9PugXGaIgnAcshpjH+NMpI143IzhW+KvYX6sRrQ5IVnb\nBpzNi33nykJ10LAF0NMYe5n8oRJl1q0y1yfkrCUmRkdRSzAdhe1gfSGOmbEVU2qh\ngdj08UHlAgMBAAECggEALApQ1CuxHPDWoige0/FRIWn+QWn/2iO5LKh1vs7HCJiP\nKhpwKX2YzRX8K9VMtZli3JUH+WCDRNSXvWVvN8BZy8i57pc4mAB+uV9bCu+PwJun\nsERyf360YDse6d1xYy1juf75YKhSga9XDzUqwRj2g25bWN0xwY9rEprxJDUJYsiu\nOYWbSgNAaz4x4YSj5VsA/9Ymt4ki/zi/9c2svUUd20hBeLD+TyiXzn35qBgJsHPc\nj4y/WZPZBIGU5SKsRoyDSJtF156sKv6eeDMzsDGHB37PFq6DZXRoNaI6YuQ6jLm5\n77RACwkIIlfx0FQWAJhs/6zacqn2QBqIgHKxbc+4nwKBgQDLguV79658FyrZbZNV\nN/pMRTzOcWGjOXKrJIMjjt7+PHpgZt72UnAV/dOFtrZlEU80nageNUec93AdUKtr\nJIj+0pPFJPqKvNKNgGc3oHc8TljbCh1sRYCk9kFUW2PevGrDr8tE0nijMYvy93K6\nlgo4REXQ6B+PWSkzKw1xgS1nYwKBgQC6KjnNZKJbb4ud0ZLFOs38QPKXbqOgNJY2\n9hq8P8HL7itjW0cxfCkWFCyGOLNMlr4T+TQYpXAfAEm+Zr7XH5+S+1yFsyjawCD3\nrIRKWMtPKlQ/to2LaMnDMP7rj4X4LfgzIgaeuV9/u4+RWlbPh2K/A0pupOjeRTjF\nx9zi4yyoFwKBgQDF6/q1Us+eHYXtybSFJ5jEvn2BpSE49jEAItVrKpLSnQzDXqiu\n1MPvj1k87NJ8fpYSbNXI8zY/gSHHUOI1pGWbtj5CeFE1xqfbOCqqHeR4gRXHiRHO\nb9XKGTi2Ct+ZCpOm1vwQZcUvqYsa8+7fafZsfHGN14KCDkuUWOWNIv1+UwKBgAHX\nOQsW26Qbzj2ZPOJGWpML8Vod9fA3lOSmOk1yM/BYQoWQ+Xs7xww41tfc56jyNJ7t\n793uhNVJo3EGgwyNe35wjdGkm9rN24WXZxd1GU2HFZ4rp+qg9p2/dkXN/X0etz2K\nMJaRLqiMqja9te4HYKqS1cGST9sixBTwjPaRWHexAoGBAJOcbak+RSYQbbtXqrs5\nBH14oASxCkwRoFOU9/gb3B7az52aKD6d9g5jI6gqN/z9BpfEhDRdiT4V82ZuUXJe\n2PiB/vqEhNj8pvH8V423lrwwXhCxJBMD0GPWw9db/nFc8CbM+1NRNq4xhIdwEiAs\n2WzSsc8okGno/b1CwdaQBcnb\n-----END PRIVATE KEY-----\n",
    });

    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByIndex[0];

    
    // read rows
    const rows = await sheet.getRows();
    if(rows.length != 0){
        let idies = [rows[0].userId];
        var $messages = new Array();
        var $names = new Array();

        for await(let i of rows){
            var $abc = 0;
            for(var $j=0;$j<idies.length;$j++){
                if(i.userId == idies[$j]){
                    $abc += 1;
                }
            }
            if($abc == 0){
                idies.push(i.userId);
            }
        }

        for(var $i=0;$i<idies.length;$i++){
            for await(let j of rows){
                if(idies[$i] == j.userId){
                    if(j.name == "Оператор"){
                        $messages[$i] += '<div class="word alert alert-success"><b>'+j.name+'</b>: '+j.message+'<p class="timeP">'+j.time+'</p></div>';
                    }else{
                        $messages[$i] += '<div class="word alert alert-primary"><b>'+j.name+'</b>: '+j.message+'<p class="timeP">'+j.time+'</p></div>';
                    }
                }
            }
        }
        for($i=0;$i<$messages.length;$i++){
            $messages[$i] = $messages[$i].toString().replace('undefined', '');
        }
        
        for(var $i=0;$i<idies.length;$i++){
            for await(let j of rows){
                if(idies[$i] == j.userId){
                    if(j.name != "Оператор"){
                        $names[$i] = j.name;
                    }
                }
            }
        }
        
        var userObjects = [];
        for(var $i=0; $i<idies.length;$i++){
            userObjects[$i] = {
                id: idies[$i],
                message: $messages[$i],
                name: $names[$i]
            }
        }
        
        return userObjects;
    }
    else{
        return 0;
    }
    
}

async function searchUser($userID){
    const { GoogleSpreadsheet } = require('google-spreadsheet');

    // spreadsheet key is the long id in the sheets URL
    const creds = require('./argumentwidjet-011f45de6409.json'); // the file saved above
    const doc = new GoogleSpreadsheet('1iA6eKRha9rPMLtPlilRlbNZV0Dq7MNLRetJvTcYUfTw');
    await doc.useServiceAccountAuth(creds);
    
    // or preferably, loading that info from env vars / config instead of the file
    await doc.useServiceAccountAuth({
      client_email: "widjet-argumentagency@argumentwidjet.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCT/qwpJTX6XjrO\nh4tVEX33E1nIwPn7unJZot9kAuLAoFm3ISQyCP7Y5lxXuxEOfILYQg9Zqsco/FoM\nPHgEqtlPtFx7ArnmlpV4T+tym+mpL8BqAvao43RmCfphtJQMjyS5/FsRJVcuDWl1\niAKMzfM08bIcMJOGmFdy/r47RMIIrvaIwMKPMdlqlzaTOXhqHhbnYDq0U7bolk+N\nuZW7w2z65rl/06sexGxv9PugXGaIgnAcshpjH+NMpI143IzhW+KvYX6sRrQ5IVnb\nBpzNi33nykJ10LAF0NMYe5n8oRJl1q0y1yfkrCUmRkdRSzAdhe1gfSGOmbEVU2qh\ngdj08UHlAgMBAAECggEALApQ1CuxHPDWoige0/FRIWn+QWn/2iO5LKh1vs7HCJiP\nKhpwKX2YzRX8K9VMtZli3JUH+WCDRNSXvWVvN8BZy8i57pc4mAB+uV9bCu+PwJun\nsERyf360YDse6d1xYy1juf75YKhSga9XDzUqwRj2g25bWN0xwY9rEprxJDUJYsiu\nOYWbSgNAaz4x4YSj5VsA/9Ymt4ki/zi/9c2svUUd20hBeLD+TyiXzn35qBgJsHPc\nj4y/WZPZBIGU5SKsRoyDSJtF156sKv6eeDMzsDGHB37PFq6DZXRoNaI6YuQ6jLm5\n77RACwkIIlfx0FQWAJhs/6zacqn2QBqIgHKxbc+4nwKBgQDLguV79658FyrZbZNV\nN/pMRTzOcWGjOXKrJIMjjt7+PHpgZt72UnAV/dOFtrZlEU80nageNUec93AdUKtr\nJIj+0pPFJPqKvNKNgGc3oHc8TljbCh1sRYCk9kFUW2PevGrDr8tE0nijMYvy93K6\nlgo4REXQ6B+PWSkzKw1xgS1nYwKBgQC6KjnNZKJbb4ud0ZLFOs38QPKXbqOgNJY2\n9hq8P8HL7itjW0cxfCkWFCyGOLNMlr4T+TQYpXAfAEm+Zr7XH5+S+1yFsyjawCD3\nrIRKWMtPKlQ/to2LaMnDMP7rj4X4LfgzIgaeuV9/u4+RWlbPh2K/A0pupOjeRTjF\nx9zi4yyoFwKBgQDF6/q1Us+eHYXtybSFJ5jEvn2BpSE49jEAItVrKpLSnQzDXqiu\n1MPvj1k87NJ8fpYSbNXI8zY/gSHHUOI1pGWbtj5CeFE1xqfbOCqqHeR4gRXHiRHO\nb9XKGTi2Ct+ZCpOm1vwQZcUvqYsa8+7fafZsfHGN14KCDkuUWOWNIv1+UwKBgAHX\nOQsW26Qbzj2ZPOJGWpML8Vod9fA3lOSmOk1yM/BYQoWQ+Xs7xww41tfc56jyNJ7t\n793uhNVJo3EGgwyNe35wjdGkm9rN24WXZxd1GU2HFZ4rp+qg9p2/dkXN/X0etz2K\nMJaRLqiMqja9te4HYKqS1cGST9sixBTwjPaRWHexAoGBAJOcbak+RSYQbbtXqrs5\nBH14oASxCkwRoFOU9/gb3B7az52aKD6d9g5jI6gqN/z9BpfEhDRdiT4V82ZuUXJe\n2PiB/vqEhNj8pvH8V423lrwwXhCxJBMD0GPWw9db/nFc8CbM+1NRNq4xhIdwEiAs\n2WzSsc8okGno/b1CwdaQBcnb\n-----END PRIVATE KEY-----\n",
    });

    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByIndex[0];

    var $a = 0;
    // read rows
    const rows = await sheet.getRows();
    for await(let i of rows){
        if(i.userId == $userID){
            $a++;
        }
    }
    
    if($a == 0){
        return 0;
    }else{
        return 1;
    }
}

async function searchNameOfUserFacebook($userID){
    const { GoogleSpreadsheet } = require('google-spreadsheet');

    // spreadsheet key is the long id in the sheets URL
    const creds = require('./argumentwidjet-011f45de6409.json'); // the file saved above
    const doc = new GoogleSpreadsheet('1iA6eKRha9rPMLtPlilRlbNZV0Dq7MNLRetJvTcYUfTw');
    await doc.useServiceAccountAuth(creds);
    
    // or preferably, loading that info from env vars / config instead of the file
    await doc.useServiceAccountAuth({
      client_email: "widjet-argumentagency@argumentwidjet.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCT/qwpJTX6XjrO\nh4tVEX33E1nIwPn7unJZot9kAuLAoFm3ISQyCP7Y5lxXuxEOfILYQg9Zqsco/FoM\nPHgEqtlPtFx7ArnmlpV4T+tym+mpL8BqAvao43RmCfphtJQMjyS5/FsRJVcuDWl1\niAKMzfM08bIcMJOGmFdy/r47RMIIrvaIwMKPMdlqlzaTOXhqHhbnYDq0U7bolk+N\nuZW7w2z65rl/06sexGxv9PugXGaIgnAcshpjH+NMpI143IzhW+KvYX6sRrQ5IVnb\nBpzNi33nykJ10LAF0NMYe5n8oRJl1q0y1yfkrCUmRkdRSzAdhe1gfSGOmbEVU2qh\ngdj08UHlAgMBAAECggEALApQ1CuxHPDWoige0/FRIWn+QWn/2iO5LKh1vs7HCJiP\nKhpwKX2YzRX8K9VMtZli3JUH+WCDRNSXvWVvN8BZy8i57pc4mAB+uV9bCu+PwJun\nsERyf360YDse6d1xYy1juf75YKhSga9XDzUqwRj2g25bWN0xwY9rEprxJDUJYsiu\nOYWbSgNAaz4x4YSj5VsA/9Ymt4ki/zi/9c2svUUd20hBeLD+TyiXzn35qBgJsHPc\nj4y/WZPZBIGU5SKsRoyDSJtF156sKv6eeDMzsDGHB37PFq6DZXRoNaI6YuQ6jLm5\n77RACwkIIlfx0FQWAJhs/6zacqn2QBqIgHKxbc+4nwKBgQDLguV79658FyrZbZNV\nN/pMRTzOcWGjOXKrJIMjjt7+PHpgZt72UnAV/dOFtrZlEU80nageNUec93AdUKtr\nJIj+0pPFJPqKvNKNgGc3oHc8TljbCh1sRYCk9kFUW2PevGrDr8tE0nijMYvy93K6\nlgo4REXQ6B+PWSkzKw1xgS1nYwKBgQC6KjnNZKJbb4ud0ZLFOs38QPKXbqOgNJY2\n9hq8P8HL7itjW0cxfCkWFCyGOLNMlr4T+TQYpXAfAEm+Zr7XH5+S+1yFsyjawCD3\nrIRKWMtPKlQ/to2LaMnDMP7rj4X4LfgzIgaeuV9/u4+RWlbPh2K/A0pupOjeRTjF\nx9zi4yyoFwKBgQDF6/q1Us+eHYXtybSFJ5jEvn2BpSE49jEAItVrKpLSnQzDXqiu\n1MPvj1k87NJ8fpYSbNXI8zY/gSHHUOI1pGWbtj5CeFE1xqfbOCqqHeR4gRXHiRHO\nb9XKGTi2Ct+ZCpOm1vwQZcUvqYsa8+7fafZsfHGN14KCDkuUWOWNIv1+UwKBgAHX\nOQsW26Qbzj2ZPOJGWpML8Vod9fA3lOSmOk1yM/BYQoWQ+Xs7xww41tfc56jyNJ7t\n793uhNVJo3EGgwyNe35wjdGkm9rN24WXZxd1GU2HFZ4rp+qg9p2/dkXN/X0etz2K\nMJaRLqiMqja9te4HYKqS1cGST9sixBTwjPaRWHexAoGBAJOcbak+RSYQbbtXqrs5\nBH14oASxCkwRoFOU9/gb3B7az52aKD6d9g5jI6gqN/z9BpfEhDRdiT4V82ZuUXJe\n2PiB/vqEhNj8pvH8V423lrwwXhCxJBMD0GPWw9db/nFc8CbM+1NRNq4xhIdwEiAs\n2WzSsc8okGno/b1CwdaQBcnb\n-----END PRIVATE KEY-----\n",
    });

    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByIndex[0];

    var $a = "";
    // read rows
    const rows = await sheet.getRows();
    for await(let i of rows){
        if(i.userId == $userID && i.name != "Оператор"){
            $a = i.name;
        }
    }
    
    if($a == ""){
        return false;
    }else{
        return $a;
    }
}

async function addNewMessageCloseOperator(userSave){
    
    const { GoogleSpreadsheet } = require('google-spreadsheet');

    // spreadsheet key is the long id in the sheets URL
    const creds = require('./argumentwidjet-011f45de6409.json'); // the file saved above
    const doc = new GoogleSpreadsheet('1iA6eKRha9rPMLtPlilRlbNZV0Dq7MNLRetJvTcYUfTw');
    await doc.useServiceAccountAuth(creds);
    
    // or preferably, loading that info from env vars / config instead of the file
    await doc.useServiceAccountAuth({
      client_email: "widjet-argumentagency@argumentwidjet.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCT/qwpJTX6XjrO\nh4tVEX33E1nIwPn7unJZot9kAuLAoFm3ISQyCP7Y5lxXuxEOfILYQg9Zqsco/FoM\nPHgEqtlPtFx7ArnmlpV4T+tym+mpL8BqAvao43RmCfphtJQMjyS5/FsRJVcuDWl1\niAKMzfM08bIcMJOGmFdy/r47RMIIrvaIwMKPMdlqlzaTOXhqHhbnYDq0U7bolk+N\nuZW7w2z65rl/06sexGxv9PugXGaIgnAcshpjH+NMpI143IzhW+KvYX6sRrQ5IVnb\nBpzNi33nykJ10LAF0NMYe5n8oRJl1q0y1yfkrCUmRkdRSzAdhe1gfSGOmbEVU2qh\ngdj08UHlAgMBAAECggEALApQ1CuxHPDWoige0/FRIWn+QWn/2iO5LKh1vs7HCJiP\nKhpwKX2YzRX8K9VMtZli3JUH+WCDRNSXvWVvN8BZy8i57pc4mAB+uV9bCu+PwJun\nsERyf360YDse6d1xYy1juf75YKhSga9XDzUqwRj2g25bWN0xwY9rEprxJDUJYsiu\nOYWbSgNAaz4x4YSj5VsA/9Ymt4ki/zi/9c2svUUd20hBeLD+TyiXzn35qBgJsHPc\nj4y/WZPZBIGU5SKsRoyDSJtF156sKv6eeDMzsDGHB37PFq6DZXRoNaI6YuQ6jLm5\n77RACwkIIlfx0FQWAJhs/6zacqn2QBqIgHKxbc+4nwKBgQDLguV79658FyrZbZNV\nN/pMRTzOcWGjOXKrJIMjjt7+PHpgZt72UnAV/dOFtrZlEU80nageNUec93AdUKtr\nJIj+0pPFJPqKvNKNgGc3oHc8TljbCh1sRYCk9kFUW2PevGrDr8tE0nijMYvy93K6\nlgo4REXQ6B+PWSkzKw1xgS1nYwKBgQC6KjnNZKJbb4ud0ZLFOs38QPKXbqOgNJY2\n9hq8P8HL7itjW0cxfCkWFCyGOLNMlr4T+TQYpXAfAEm+Zr7XH5+S+1yFsyjawCD3\nrIRKWMtPKlQ/to2LaMnDMP7rj4X4LfgzIgaeuV9/u4+RWlbPh2K/A0pupOjeRTjF\nx9zi4yyoFwKBgQDF6/q1Us+eHYXtybSFJ5jEvn2BpSE49jEAItVrKpLSnQzDXqiu\n1MPvj1k87NJ8fpYSbNXI8zY/gSHHUOI1pGWbtj5CeFE1xqfbOCqqHeR4gRXHiRHO\nb9XKGTi2Ct+ZCpOm1vwQZcUvqYsa8+7fafZsfHGN14KCDkuUWOWNIv1+UwKBgAHX\nOQsW26Qbzj2ZPOJGWpML8Vod9fA3lOSmOk1yM/BYQoWQ+Xs7xww41tfc56jyNJ7t\n793uhNVJo3EGgwyNe35wjdGkm9rN24WXZxd1GU2HFZ4rp+qg9p2/dkXN/X0etz2K\nMJaRLqiMqja9te4HYKqS1cGST9sixBTwjPaRWHexAoGBAJOcbak+RSYQbbtXqrs5\nBH14oASxCkwRoFOU9/gb3B7az52aKD6d9g5jI6gqN/z9BpfEhDRdiT4V82ZuUXJe\n2PiB/vqEhNj8pvH8V423lrwwXhCxJBMD0GPWw9db/nFc8CbM+1NRNq4xhIdwEiAs\n2WzSsc8okGno/b1CwdaQBcnb\n-----END PRIVATE KEY-----\n",
    });

    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByIndex[0];
    
    for await(let i of userSave){
        await sheet.addRow({ name: i[0], userId: i[1], message: i[5], dispetcherId: i[4], sessionId: i[3], time: i[2]});
    }
    
}




//#region TELEGRAM BOT
const TelegramBot = require('node-telegram-bot-api')
const request = require('request');
var users = [
    ["Sergei","42131dfaf3cd","2019.01.23","sessionId23", 1, "Some message"]//name userId  dateOfMessage  sessionId dispetcherId  message  
];
var sessions = [
    [,]
];
const TOKEN = "1126744180:AAEM769XP8dE75HXyPKlhGilmduR45nWTS4";

const botTelegram = new TelegramBot(TOKEN, {polling: true})

botTelegram.on('message', (msg) => {
    var $idUser = "telegram"+msg.chat.id;
    var forCheck = 0;
    var checkForNew = 0;
    var d = new Date(msg.date*1000);

    for(var $i=0;$i<users.length;$i++){
        if(users[$i][1] == ($idUser)){
            checkForNew++;
        }
    }
    if(checkForNew == 0){
        searchUser($idUser).then(tabl => {
            if(tabl == 0){
                //пользователь не найден
                io.sockets.emit('add name', {name: msg.chat.first_name, userID: $idUser});
                if(users[0][3] == "sessionId23"){
                    var $dd = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
                    users[0] = [msg.chat.first_name, $idUser, $dd, 0, 1, msg.text];
                }
                else{
                    var $dd = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
                    users.push([msg.chat.first_name, $idUser, $dd, 0, 1, msg.text]);
                }
                sessions.push([$idUser, msg.chat.id+Math.floor(Math.random() * Math.floor(1000))]);
                io.sockets.emit('add mess', {mess: msg.text, name: msg.chat.first_name, userID: $idUser});
            }else{
                if(users[0][3] == "sessionId23"){
                    var $dd = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
                    users[0] = [msg.chat.first_name, $idUser, $dd, 0, 1, msg.text];
                }
                else{
                    var $dd = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
                    users.push([msg.chat.first_name, $idUser, $dd, 0, 1, msg.text]);
                }
                sessions.push([$idUser, msg.chat.id+Math.floor(Math.random() * Math.floor(1000))]);
            }
        });
    }
    else{
        if(users[0][3] == "sessionId23"){
            var $dd = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
            users[0] = [msg.chat.first_name, $idUser, $dd, 0, 1, msg.text];
        }
        else{
            var $dd = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
            users.push([msg.chat.first_name, $idUser, $dd, 0, 1, msg.text]);
        }
    }

    io.sockets.emit('add mess', {mess: msg.text, name: msg.chat.first_name, userID: $idUser});
})


function botTelegramMessage($userId, $mess){
    if($mess != ""){
        var $niceId = $userId.substring(8, $userId.length);
        var now = new Date();
        if(users[0][3] == "sessionId23"){
            sessions.push([$userId, Math.floor(Math.random(100000000) * Math.floor(999999999))]); 
            users[0] = ["Оператор", $userId, now.getHours()+":"+now.getMinutes()+":"+now.getSeconds(), 234234, 1, $mess];
        }
        else{
            users.push(["Оператор", $userId, now.getHours()+":"+now.getMinutes()+":"+now.getSeconds(), 234234, 1, $mess]);
        }
        botTelegram.sendMessage($niceId, $mess);
    }
}

//#endregion


//#region  VIBER BOT

const ViberBot = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;

var sessionsViber = [
    [,]
];
var usersMessages = [
    [,]
];

const botViber = new ViberBot({
    authToken: "4bbbe321a2a7d3c9-3123030bc9613a9a-29365d819259b043",
    name: "Argument",
    avatar: ""
  });
  
const port = process.env.PORT || 3000;
app.use("/viber/webhook", botViber.middleware());
  
botViber.setWebhook(`https://ff8929c95e4f.ngrok.io/viber/webhook`).catch(error => {
    console.log('Can not set webhook on following server. Is it running?');
    console.error(error);
    process.exit(1);
});

botViber.on(BotEvents.SUBSCRIBED, response => {//ПОЛЬЗОВАТЕЛЬ ПОДПИСАЛСЯ НА БОТА
    response.send(new TextMessage(`Здравствуйте ${response.userProfile.name}. Чем могу помочь?\nПосле того как вы напишите свой вопрос, менеджер ответит вам в скорем времени.`));
});

botViber.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {//ПОЛЬЗОВАТЕЛЬ ОТПРАВИЛ СООБЩЕНИЕ
    botViber.sendMessage(response.userProfile, new TextMessage("Менеджер в скорем времени вам ответит..."));
    console.log(response.userProfile.id+"\n");
    var checkViber = 0;
    var d = new Date();
    let str = response.userProfile.id.replace("==", "");

    for(let i=0;i<usersMessages.length;i++){
        if(usersMessages[i][1] == ("viber"+str)){
            checkViber++;
        }
    }
    
    if(checkViber == 0){//если пользователь не найден в массиве
        searchUser("viber"+str).then(tabl => {
            if(tabl == 0){
                //пользователь не найден в таблицах, а значить он новый
                io.sockets.emit('add name', {name: response.userProfile.name, userID: "viber"+str});
                
            }
            var $dd = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
            usersMessages.push([response.userProfile.name, "viber"+str, $dd, 0, 1, message.text]);
            sessionsViber.push(["viber"+str, "s34s"+Math.floor(Math.random() * Math.floor(1000))]);
            io.sockets.emit('add mess', {mess: message.text, name: response.userProfile.name, userID: "viber"+str});
        });
    }
    else{
        var $dd = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
        usersMessages.push([response.userProfile.name, "viber"+str, $dd, 0, 1, message.text]);
        io.sockets.emit('add mess', {mess: message.text, name: response.userProfile.name, userID: "viber"+str});
    }
});

function botViberMessage($userId, $mess){
    if($mess != ""){
        var $niceId = $userId.substring(5, $userId.length);
        $niceId = $niceId +"==";
        var now = new Date();
        if(usersMessages.length == 0){
            sessionsViber.push([$userId, "s34s"+Math.floor(Math.random() * Math.floor(1000))]);
            usersMessages.push(["Оператор", $userId, now.getHours()+":"+now.getMinutes()+":"+now.getSeconds(), 234234, 1, $mess]);
        }
        else{
            usersMessages.push(["Оператор", $userId, now.getHours()+":"+now.getMinutes()+":"+now.getSeconds(), 234234, 1, $mess]);
        }
        
        let someS = {
            id: $niceId,
            name: "",
            avatar: "",
            country: "",
            language: ""
        };
        botViber.sendMessage(someS, new TextMessage($mess));
    }
}


//#endregion

//#region FACEBOOK BOT

//botId = 104658211327032
var sessionsFacebook = [
    [,]
];
var usersMessagesFacebook = [
    [,]
];
var checkFacebook = 0;

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

app.get("/facebook/webhook", function(req,res){
    if(req.query["hub.verify_token"]=="try"){
        res.send(req.query["hub.challenge"]);
    }
});

app.post("/facebook/webhook", function(req,res){
    var msg_events = req.body.entry;
    msg_events.forEach(function(pageEntry){
        pageEntry.messaging.forEach(function(msg){
            if(msg.sender.id && msg.message.text != ""){
                if(msg.sender.id != '104658211327032'){//Проверка, что сообщение не от бота
                    var nameFacebook = "";
                    var d = new Date();
                    for(let i=0;i<usersMessagesFacebook.length;i++){
                        if(usersMessagesFacebook[i][1] == ("facebook"+msg.sender.id)){
                            checkFacebook++;
                        }
                    }
                    if(checkFacebook == 0){
                        messageClient.getUserProfile(msg.sender.id,[]).then((result) => nameFacebook = result.first_name);
                        searchUser("facebook"+msg.sender.id).then(tabl => {
                            if(tabl == 0){
                                //пользователь не найден в таблицах, а значить он новый
                                io.sockets.emit('add name', {name: nameFacebook, userID: "facebook"+msg.sender.id});
                            }
                            var $dd = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
                            usersMessagesFacebook.push([nameFacebook, "facebook"+msg.sender.id, $dd, 0, 1, msg.message.text]);
                            sessionsFacebook.push(["facebook"+msg.sender.id, "sfaceb"+Math.floor(Math.random() * Math.floor(1000))]);
                            io.sockets.emit('add mess', {mess: msg.message.text, name: nameFacebook, userID: "facebook"+msg.sender.id});
                        });
                    }else{
                        var $chackSes = 0;
                        for(let i=0;i<sessionsFacebook.length;i++){
                            if(("facebook"+msg.sender.id) == sessionsFacebook[i][0]){
                                $chackSes++; 
                            }
                        }
    
                        if($chackSes == 0){
                            sessionsFacebook.push(["facebook"+msg.sender.id, "sfaceb"+Math.floor(Math.random() * Math.floor(1000))]);
                        }
    
                        for(let i=0;i<usersMessagesFacebook.length;i++){
                            if(usersMessagesFacebook[i][1] == "facebook"+msg.sender.id && usersMessagesFacebook[i][0] != "Оператор"){
                                nameFacebook = usersMessagesFacebook[i][0];
                            }
                        }
                        if(nameFacebook == ""){
                            searchNameOfUserFacebook("facebook"+msg.sender.id).then((result) =>{
                                var $dd = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
                                usersMessagesFacebook.push([result, "facebook"+msg.sender.id, $dd, 0, 1, msg.message.text]);
                                io.sockets.emit('add mess', {mess: msg.message.text, name: result, userID: "facebook"+msg.sender.id});
                            });
                        }else{
                            var $dd = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
                                usersMessagesFacebook.push([nameFacebook, "facebook"+msg.sender.id, $dd, 0, 1, msg.message.text]);
                                io.sockets.emit('add mess', {mess: msg.message.text, name: nameFacebook, userID: "facebook"+msg.sender.id});
                        }
                        
                    }
                    sendText(msg.sender.id, "Менеджер в скорем времени вам ответит!");
                }
            }
            res.sendStatus(200);
        });
    });
});


function botFacebookMessage($userId, $mess){
    var $niceId = $userId.substring(8, $userId.length);
    var now = new Date();

    if(usersMessagesFacebook.length == 0){
        sessionsFacebook.push([$userId, "sfaceb"+Math.floor(Math.random() * Math.floor(1000))]);
        usersMessagesFacebook.push(["Оператор", $userId, now.getHours()+":"+now.getMinutes()+":"+now.getSeconds(), 234234, 1, $mess]);
    }
    else{
        usersMessagesFacebook.push(["Оператор", $userId, now.getHours()+":"+now.getMinutes()+":"+now.getSeconds(), 234234, 1, $mess]);
    }

    sendText($niceId, $mess);
}

function sendText(idd,mess){
    request({
        url: "https://graph.facebook.com/v7.0/me/messages",
        qs:{access_token: "EAALULT5RuccBACmSQo3FDC3vY5zukoGUbV9vOvZCaUfP3f16y5jSka9RNvkwNQNHMfcZBidZCGLSyFRQnwO1HtscPZASCla0ZCkGcesmIbIZBCb3ZBOdj14x35ZCGZBW0GkUdUaAp6h2pMeQA5TPqttNGMdaRZBB9XbcrIndyEAunjmVlwWi1dVH7ZA"},
        method:"POST",
        json:{
            recipient:{
                id:idd
            },
            message:{
                text:mess
            }
        }
    });
}
//#endregion

//#region WHATSAPP BOT

//#endregion

async function closeOp(){
    //telegram
    
    if(users[0][3] != "sessionId23"){
        for(var $i=0;$i<users.length;$i++){
            for(var $j=0;$j<sessions.length;$j++){
                if(users[$i][1] == sessions[$j][0]){
                    users[$i][3] = sessions[$j][1];
                }
            }
        }
        await addNewMessageCloseOperator(users);
    }
    //viber
    if(usersMessages.length != 0){
        for(var $i=0;$i<usersMessages.length;$i++){
            for(var $j=0;$j<sessionsViber.length;$j++){
                if(usersMessages[$i][1] == sessionsViber[$j][0]){
                    usersMessages[$i][3] = sessionsViber[$j][1];
                }
            }
        }
        await addNewMessageCloseOperator(usersMessages);
    }

    //facebook
    if(usersMessagesFacebook.length != 0){
        for(var $i=0;$i<usersMessagesFacebook.length;$i++){
            for(var $j=0;$j<sessionsFacebook.length;$j++){
                if(usersMessagesFacebook[$i][1] == sessionsFacebook[$j][0]){
                    usersMessagesFacebook[$i][3] = sessionsFacebook[$j][1];
                }
            }
        }
        
        await addNewMessageCloseOperator(usersMessagesFacebook);
    }

    CANIload = true;
    await io.sockets.emit('canLoadOperator');
}

