const express = require('express'); //get express object
const middleware = require('@line/bot-sdk').middleware; //middleware from line to authorize line token
const Client = require('@line/bot-sdk').Client; //line client
const bodyParser = require('body-parser'); //for json

var gindex = 0; //games number
var ggames = {}; //games storage
var waitTime = 60;

var rol = { penjelajah: 770, pemanah: 651, peramal: 122, tombak: 433, peramu: 524, rakyat: 125, dukun: 656
  , lapendos: 847};
var ev = { voting: 910, daging: 811, ikan: 912, ritual: 183, korban: 584, perang: 485 };



const app = express();

const config = {
  channelAccessToken: 'wwoMYaYpK5Opbm8SioJ+AgOUHSWLiqXKc+VkU1EEipPJn9b1g7tb94V1Hw7CBJwEitt9UZhyUh1KtYngcxjxt3JBsw+y4QFE42YmpjZRCliDcnz5uQGxBUOImfYzm5ExJ4v/UQbt317JwcHADHOKqgdB04t89/1O/w1cDnyilFU=',
  channelSecret: '1567536154'
};

const client = new Client({
  channelAccessToken: 'wwoMYaYpK5Opbm8SioJ+AgOUHSWLiqXKc+VkU1EEipPJn9b1g7tb94V1Hw7CBJwEitt9UZhyUh1KtYngcxjxt3JBsw+y4QFE42YmpjZRCliDcnz5uQGxBUOImfYzm5ExJ4v/UQbt317JwcHADHOKqgdB04t89/1O/w1cDnyilFU=',
  channelSecret: '1567536154'
});

app.use(middleware(config)); //before the bodyparser.json for line authorization
app.use(bodyParser.json()); //for json

const server = app.listen(process.env.PORT || 5000, () => { //opening the server on any port or 5000
  console.log('Listening on port ' + server.address().port);
});




var ggame = function(id) //generate new game
{
  this.rid = id;
  this.nid = gindex;
  this.players = {};
  this.pcount = 0;
  this.gclock = waitTime;
  this.play = false;
  this.minp = 4;
  this.reset = false;
  ggames[gindex] = this;
  ggames[this.rid] = this;
  gindex++;

  new runn(this);
};

var runn = function(gg)
{
  var r = setInterval(function()
  {
    if(gg.reset == true)
    {
      reset = false;
      push(gg.rid, 'Permainan telah dihentikan');
      clearInterval(r);
    }
    if(gg.pcount <= -1)
    {
      clearInterval(r);
    }
    gg.gclock--;
    if(gg.gclock === 30 || gg.gclock === 10 || gg.gclock === 3)
    {
      push(gg.rid, gg.gclock + ' detik hingga permainan dimulai' + getInfog(gg));
    }
    if(gg.gclock <= 1)
    {
      if(gg.pcount < gg.minp)
      {
        gg.gclock = waitTime;
        push(gg.rid, 'Jumlah pemain tidak mencukupi\n' + gg.gclock
        + ' detik hingga permainan dimulai' + getInfog(gg));
      } else
      {
        gg.startGame();
        clearInterval(r);
      }
    }
  }, 1000);

  this.run1 = r;
}

var ppl = function(ei, gabung, n)
{
  this.uid = ei.source.userId;
  this.n = n;
  client.getProfile(ei.source.userId).then((profile) =>
  {
    this.name = profile.displayName;
    if(gabung)
    {
      reply(ei.replyToken, this.name
        + ' telah bergabung dengan permainan\n'
        + getGame(ei).gclock + " detik hingga permainan dimulai" + getInfo(ei));
    }
  });
}

ggame.prototype = //game functions
{
  getId : function() //return the name of the game
          {
            return this.rid;
          },
  resetG : function()
          {
            this.reset = true;
            if(this.nid === gindex-1)
            {
              ggames[this.nid] = null;
              ggames[this.rid] = null;
              gindex--;
            } else
            {
              ggames[this.rid] = null;
              for(i = this.nid; i < gindex; i++)
              {
                if(i === gindex-1)
                {
                  ggames[i] = null;
                  continue;
                }
                ggames[i] = ggames[i+1];
                ggames[i].nid--;
              }
              gindex--;
            }
          },
  startGame : function()
          {
            this.play = true;
            push(this.rid, 'Selamat bermain!');

            this.roles = [];
            for(i = 0; i < this.pcount; i++)
            {
              if((this.pcount/2) < 3)
              {
                switch (i)
                {
                  case 0: this.roles[i] = rol.lapendos;break;
                  case 1: this.roles[i] = rol.peramal;break;
                  case 2: this.roles[i] = rol.peramu;break;
                  case 3: this.roles[i] = rol.rakyat;break;
                  case 4: this.roles[i] = (Math.floor((Math.random() * 2) + 1)) == 1 ? rol.tombak : rol.pemanah;break;
                }
                continue;
              } else
              {
                if(i > 7)
                {
                  roles[i] = rol.rakyat;
                  continue;
                }
                switch (i)
                {
                  case 0: this.roles[i] = rol.lapendos;break;
                  case 1: this.roles[i] = rol.peramal;break;
                  case 2: this.roles[i] = rol.peramu;break;
                  case 3: this.roles[i] = rol.rakyat;break;
                  case 4: this.roles[i] = this.pcount == 6 ?
                    ((Math.floor((Math.random() * 2) + 1)) == 1 ? rol.tombak : rol.pemanah) : rol.tombak;break;
                  case 5: this.roles[i] = rol.dukun;break;
                  case 6: this.roles[i] = rol.pemanah;break;
                  case 7: this.roles[i] = rol.penjelajah;break;
                }
                continue;
              }
            }

            console.log(this.roles);
            this.kepalas = [];
            var j = 0;
            for(i = 0; i < this.pcount; i++)
            {
              var r = Math.floor((Math.random() * this.roles.length))
              this.players[i].role = this.roles[r];
              this.roles.splice(r, 1);
              j = i;
              if(this.players[i].role != rol.dukun && this.players[i].role != rol.lapendos)
              {
                this.kepalas[j] = this.players[i];
              } else
              {
                  j--;
              }

              console.log(this.players[i].role);
              var t = '';
              switch (this.players[i].role)
              {
                case rol.lapendos: t = 'LAPENDOS';break;
                case rol.dukun: t = 'DUKUN SAKTI';break;
                case rol.pemanah: t = 'PEMANAH';break;
                case rol.tombak: t = 'AHLI TOMBAK';break;
                case rol.peramu: t = 'PERAMU OBAT';break;
                case rol.penjelajah: t = 'PENJELAJAH';break;
                case rol.peramal: t = 'PERAMAL';break;
                case rol.rakyat: t = 'RAKYAT';break;
              }
              push(this.players[i].uid, 'Di permainan ini anda berperan sebagai ' + t);
              sendEvents(this.players[i].uid);
            }

            console.log(this.kepalas);
            this.kepala = this.kepalas[Math.floor(Math.random() * this.kepalas.length)];
            this.kepala.kepala = true;
            push(this.rid, 'Suku kita tidak lagi aman. Kekuatan-kekuatan jahat telah merasuki bagian-bagian'
              +  ' dari suku kita. Mereka tidak segan menyakiti isi hati kawan kita yang sedang jatuh '
              + 'dan rapuh. Pengkhianatan jalan terbaik bagi mereka untuk melewati masa sulitnya. Para '
              + 'pengkhianat ini berusaha merampas kekuatan kepala suku kita. Kita harus melindungi kepala'
              + ' suku kita dan jangan sampai tertipu dengan siapapun. Hati-hati, siapapun bisa jadi'
              + ' pengkhianat.\n\n\nKEPALA SUKU kita adalah ' + this.kepala.name);
          },
  addPlayer : function(ei, gabung)
          {
            if(this.pcount === -1)
            {
              this.gclock = waitTime;
              new runn(this);
              this.pcount = 0;
            }
            this.players[this.pcount] = new ppl(ei, gabung, this.pcount);
            this.players[ei.source.userId] = this.players[this.pcount];
            this.pcount++;
          },
  removePlayer : function(ei)
          {
            reply(ei.replyToken, getPpl(ei).name
              + ' telah meninggalkan permainan\n\n\nMinimal ada ' + getGame(ei).minp + ' pemain\n'
              + 'Ketik !gabung untuk ikut bermain\n'
              + 'Ketik !pergi untuk keluar dari permainan\nKetik !pemain untuk melihat daftar pemain\n'
              + (getGame(ei).pcount-1) + ' pemain sudah bergabung');
            n = getPpl(ei).n;
            this.players[n] = null;
            this.players[ei.source.userId] = null;
            if(n != (this.pcount-1))
            {
              for(j = n; j < this.pcount; j++)
              {
                if(j === this.pcount-1)
                {
                  this.players[j] = null;
                  continue;
                }
                this.players[j] = this.players[j+1];
              }
            }
            this.pcount--;
            if(this.pcount === 0)
            {
              this.players = {};
              this.pcount = -1;
              this.play = false;
            }
          }
};

app.post('/', (req,res) => { //what to do in case a http post
  res.status(200).send('$');
  const ei = req.body.events[0];
  console.log(ei);
  if(ei.type === 'message')
  {
    if(ei.message.type === 'text')
    {
      /*client.replyMessage(ei.replyToken,
        {
  "type": "template",
  "altText": "this is a buttons template",
  "template": {
      "type": "buttons",
      "thumbnailImageUrl": "https://www.opednews.com/populum/uploaded/old-ones-ritual-02015_04_02_13_31_08-0.jpg",
      "title": "Menu",
      "text": "Please select",
      "actions": [
          {
            "type": "postback",
            "label": "Buy",
            "data": "action=buy&itemid=123"
          },
          {
            "type": "postback",
            "label": "Add to cart",
            "data": "action=add&itemid=123"
          },
      ]
  }
}
      );*/
      handleMsg(ei);
      return;
    }
  }
  if(ei.type === 'join')
  {
    reply(ei.replyToken, 'Ketik !mulai untuk memulai permainan.');
    return;
  }
  if(ei.type === 'postback')
  {
    
  }
});

function handleMsg(ei)
{
  const msg = ei.message.text;

  /*
-------------------------------------------------------------------------------------------------------------
  */

  if(msg === '!reset')
  {
    client.getProfile(ei.source.userId).then((profile) =>
    {
      if(profile.displayName === 'Nathanael Gavin')
      {
        if((getRoom(ei) != null) && getGame(ei) != null)
        {
          getGame(ei).resetG();
          return;
        }
      }
    });
  }

  /*
-------------------------------------------------------------------------------------------------------------
  */
  if(msg === '!mulai')
  {
    if(getRoom(ei) == null)
    {
      return;
    }
    if(isGame(ei))
    {
      reply(ei.replyToken, 'Permainan sedang berjalan.' + getInfo(ei));
      return;
    }
    if(isPlay(ei))
    {
      client.getProfile(ei.source.userId).then((profile) =>
      {
        reply(ei.replyToken, profile.displayName + ' sedang bermain di tempat lain.');
      });
      return;
    }
    var ff = setTimeout(function()
    {
      if(getGame(ei) != null)
      {
        return;
      }
      var g = new ggame(getRoom(ei));
      g.addPlayer(ei, false);
      reply(ei.replyToken, g.gclock + ' detik hingga permainan dimulai' + getInfo(ei));
      return;
    }, 2000);
    client.pushMessage(ei.source.userId, {type: 'text', text: 'Anda bergabung dengan permainan.'})
    .catch((err) =>
    {
      clearTimeout(ff);
      client.getProfile(ei.source.userId)
      .then((profile) =>
      {
        reply(ei.replyToken, profile.displayName + ' belum menambahkan saya menjadi teman.')
      });
      return;
    });
  }

  /*
-------------------------------------------------------------------------------------------------------------
  */

  if(msg === '!pergi')
  {
    if(isGame(ei))
    {
      if(getGame(ei).players[ei.source.userId] != null)
      {
        getGame(ei).removePlayer(ei);
        return;
      }
      client.getProfile(ei.source.userId).then((profile) =>
      {
        reply(ei.replyToken, profile.displayName + " belum bergabung dengan permainan");
      });
      return;
    }
    reply(ei.replyToken, 'Ketik !mulai terlebih dahulu untuk membuat permainan.');
    return;
  }

  /*
-------------------------------------------------------------------------------------------------------------
  */

  if(msg === '!gabung')
  {
    if(isGame(ei) && getGame(ei).players[ei.source.userId] != null)
    {
      reply(ei.replyToken, getPpl(ei).name
        + " sudah bergabung dengan permainan!\nTunggu hingga permainan dimulai" + getInfo(ei));
      return;
    }
    if(isPlay(ei))
    {
      client.getProfile(ei.source.userId).then((profile) =>
      {
        reply(ei.replyToken, profile.displayName + ' sedang bermain di tempat lain.');
      });
      return;
    }
    if(isGame(ei) && getGame(ei).play)
    {
      client.getProfile(ei.source.userId).then((profile) =>
      {
        reply(ei.replyToken, profile.displayName + '\nPermainan sedang berjalan\n'
        + 'Silahkan ikut yang selanjutnya');
      });
      return;
    }
    if(isGame(ei))
    {
      var ff = setTimeout(function()
      {
        if(getGame(ei) == null)
        {
          return;
        }
        getGame(ei).addPlayer(ei, true);
        return;
      }, 2000);
      client.pushMessage(ei.source.userId, {type: 'text', text: 'Anda bergabung dengan permainan.'})
      .catch((err) =>
      {
        clearTimeout(ff);
        reply(ei.replyToken, 'Anda belum menambahkan saya menjadi teman.');
        return;
      });
      return;
    }
    reply(ei.replyToken, 'Ketik !mulai terlebih dahulu untuk membuat permainan.');
    return;
  }

  /*
-------------------------------------------------------------------------------------------------------------
  */

  if(msg === '!pemain')
  {
    if(isGame(ei))
    {
      var gg = getGame(ei);
      var txt = '';
      for(i = 0; i < gg.pcount; i++)
      {
        if(i != 0)
        {
          txt += '\n';
        }
        txt += (i+1) + '. ' + gg.players[i].name;
      }
      if(txt != '')
      {
        reply(ei.replyToken, txt);
      } else
      {
        reply(ei.replyToken, 'Belum ada pemain yang bergabung')
      }
      return;
    }
    reply(ei.replyToken, 'Ketik !mulai terlebih dahulu untuk membuat permainan.');
    return;
  }

  /*
-------------------------------------------------------------------------------------------------------------
  */
}

function isPlay(ei)
{
  if(gindex > 0)
  {
    for(i = 0; i < gindex; i++)
    {
      gg = ggames[i];
      if(gg.players[ei.source.userId] != null)
      {
        return true;
      }
    }
  }
  return false;
}

function isGame(ei)
{
  return ((getRoom(ei) != null) && (getGame(ei) != null));
}

function getInfo(ei)
{
  if(isGame(ei))
  {
    return ('\n\n\nMinimal ada ' + getGame(ei).minp + ' pemain\nKetik !gabung untuk ikut bermain\n'
    + 'Ketik !pergi untuk keluar dari permainan\nKetik !pemain untuk melihat daftar pemain\n'
    + (getGame(ei).pcount <= -1 ? 0 : getGame(ei).pcount) + ' pemain sudah bergabung')
  }
}

function getInfog(gg)
{
  return ('\n\n\nMinimal ada ' + gg.minp + ' pemain\nKetik !gabung untuk ikut bermain\n'
  + 'Ketik !pergi untuk keluar dari permainan\nKetik !pemain untuk melihat daftar pemain\n'
  + (gg.pcount <= -1 ? 0 : gg.pcount) + ' pemain sudah bergabung')
}

function push(token, msg)
{
  client.pushMessage(token, {type: 'text', text: msg});
  return;
}

function reply(token, msg)
{
  client.replyMessage(token, {type: 'text', text: msg});
  return;
}

function getGame(ei)
{
  return ggames[getRoom(ei)];
}

function getPpl(ei)
{
  return getGame(ei).players[ei.source.userId];
}

function getRoom(ei)
{
  if(ei.source.type === 'room')
  {
    return ei.source.roomId;
  }
  if(ei.source.type === 'group')
  {
    return ei.source.groupId;
  }
  return;
}

function sendEvents(uidd)
{
  client.pushMessage(uidd,
    {
      "type": "template",
      "altText": "Silahkan vote event yang ingin dilakukan!",
      "template": {
          "type": "carousel",
          "columns": [
              {
                "thumbnailImageUrl": "https://guerrillanews.files.wordpress.com/2010/01/11prehistoric-hunting.jpg",
                "title": "Berburu Daging",
                "text": "Mendapat makanan merupakan tujuan dari kegiatan ini.",
                "actions": [
                    {
                        "type": "postback",
                        "label": "Vote",
                        "data": "v-daging"
                    },
                ]
              },
              {
                "thumbnailImageUrl": "https://i.pinimg.com/originals/7a/56/a6/7a56a600d4247ebd183d7c5f5c2e82c8.jpg",
                "title": "Mencari Ikan",
                "text": "Dengan adanya ikan, peramal dapat melakukan bagiannya.",
                "actions": [
                    {
                        "type": "postback",
                        "label": "Vote",
                        "data": "v-ikan"
                    },
                ]
              },
              {
                "thumbnailImageUrl": "https://www.mostluxuriouslist.com/wp-content/uploads/2016/02/The-Aztecs.jpg",
                "title": "Upacara Korban",
                "text": "Sebuah pengorbanan diperlukan tidak hanya sekali.",
                "actions": [
                    {
                        "type": "postback",
                        "label": "Vote",
                        "data": "v-korban"
                    },
                ]
              },
              {
                "thumbnailImageUrl": "https://www.opednews.com/populum/uploaded/old-ones-ritual-02015_04_02_13_31_08-0.jpg",
                "title": "Ritual Suku",
                "text": "Usaha mengembalikan kekuatan sang kepala suku.",
                "actions": [
                    {
                        "type": "postback",
                        "label": "Vote",
                        "data": "v-ritual"
                    },
                ]
              },
              {
                "thumbnailImageUrl": "https://www.indonesiakaya.com/uploads/_images_gallery/Bapak_Yali_melepaskan_anak_panah_kepada_musuh_.jpg",
                "title": "Latihan Perang",
                "text": "Asah kemampuan berperang untuk meraih kemenangan.",
                "actions": [
                    {
                        "type": "postback",
                        "label": "Vote",
                        "data": "v-perang"
                    },
                ]
              }
          ]
      }
    }
  );
}
