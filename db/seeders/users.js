'use strict';

const MongoClient = require('mongodb').MongoClient;
const Bcrypt = require('bcrypt');
const User = require('../models/user.js');
const MONGO_URI = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;

var users = [
  {"name":"Admin","scope":true,"email":"admin@hapi-api.lab","password":"testTEST1"},
  {"name":"Hill","scope":false,"email":"hhugo0@theglobeandmail.com","password":"s0FEqe7fd"},
  {"name":"Cristobal","scope":false,"email":"cfilppetti1@opera.com","password":"zR0V1jpQDj"},
  {"name":"Wendie","scope":false,"email":"wspurge2@cdbaby.com","password":"NnTJ18AFcwy"},
  {"name":"Gwennie","scope":true,"email":"gshropsheir3@istockphoto.com","password":"KT1CLhV9"},
  {"name":"Earle","scope":true,"email":"elitzmann4@rambler.ru","password":"L5MeO4PnE0z"},
  {"name":"Rafe","scope":true,"email":"rkryska5@prlog.org","password":"UGbQPqLg"},
  {"name":"Brantley","scope":false,"email":"bdureden6@instagram.com","password":"UgO9i9iD"},
  {"name":"Avictor","scope":true,"email":"apringuer7@si.edu","password":"MUqFWKQNzL"},
  {"name":"Stevena","scope":true,"email":"sbellham8@ehow.com","password":"EhNnGCFYx6N"},
  {"name":"Gael","scope":true,"email":"gshewan9@usda.gov","password":"XrdRbEUNY36"},
  {"name":"Randie","scope":true,"email":"rrathea@geocities.jp","password":"tyAT5p"},
  {"name":"Stevena","scope":true,"email":"sheymannb@usnews.com","password":"M0vBV7oKDc"},
  {"name":"Dael","scope":true,"email":"dfellmanc@discovery.com","password":"J8QPiDQzw"},
  {"name":"Ferdy","scope":true,"email":"fatkinsd@mtv.com","password":"AV1nMca9h"},
  {"name":"Jessica","scope":true,"email":"jtrayese@hugedomains.com","password":"RsFvEPgWlY"},
  {"name":"Kimberley","scope":false,"email":"kromainf@tinyurl.com","password":"Flha9eRr2Rr"},
  {"name":"Kevan","scope":true,"email":"ktrusseg@people.com.cn","password":"gW2Y51NKixCH"},
  {"name":"Kelly","scope":true,"email":"knarracotth@washington.edu","password":"e3OUz9"},
  {"name":"Hillard","scope":false,"email":"hruggeni@macromedia.com","password":"X3vQeEQIf"},
  {"name":"Jedd","scope":false,"email":"jvaughnj@thetimes.co.uk","password":"sANrcEfI"},
  {"name":"Bo","scope":false,"email":"bgillonk@blog.com","password":"Wjosa9bAiA"},
  {"name":"Grenville","scope":false,"email":"gupstonl@xrea.com","password":"XaO8CCUM"},
  {"name":"Britte","scope":true,"email":"bjaegarm@jiathis.com","password":"PHYhSbvPfz9"},
  {"name":"Sherri","scope":false,"email":"sberntssonn@instagram.com","password":"NVK8Yo"},
  {"name":"Barth","scope":true,"email":"bfleemingo@yandex.ru","password":"wAsZ8GqIv"},
  {"name":"Hermy","scope":false,"email":"hgatusp@psu.edu","password":"5K215z"},
  {"name":"Neron","scope":true,"email":"ngaifordq@angelfire.com","password":"Eq7O06I"},
  {"name":"Moises","scope":false,"email":"mmitchallr@spotify.com","password":"kJVSJLcgr23"},
  {"name":"Julienne","scope":false,"email":"jpalles@un.org","password":"QQ7e7Y0KS"},
  {"name":"Edita","scope":false,"email":"eriddockt@hc360.com","password":"yNIlDtA"},
  {"name":"Stirling","scope":true,"email":"scombeu@bloglovin.com","password":"RcQvlUYeUdQ"},
  {"name":"Yovonnda","scope":false,"email":"ybuxcyv@narod.ru","password":"iw5ZTFrJnt"},
  {"name":"Gaspar","scope":true,"email":"gcleetonw@spiegel.de","password":"WXeYu5C0ghXN"},
  {"name":"Silas","scope":false,"email":"scofaxx@webs.com","password":"wz35hL1a"},
  {"name":"Starla","scope":false,"email":"sstationy@ustream.tv","password":"8iyvd48R35d"},
  {"name":"Homerus","scope":false,"email":"hnoteyoungz@upenn.edu","password":"SYRxxraou"},
  {"name":"Lyndsay","scope":true,"email":"ljahnisch10@dyndns.org","password":"rhKuIJt"},
  {"name":"Shaine","scope":true,"email":"shanssmann11@sphinn.com","password":"kc2kFJtZKuD"},
  {"name":"Grazia","scope":true,"email":"glovejoy12@guardian.co.uk","password":"SJvHgxQMFKp"},
  {"name":"Camellia","scope":true,"email":"ccambridge13@abc.net.au","password":"CReqRetUK3"},
  {"name":"Dallis","scope":true,"email":"dsvanini14@pbs.org","password":"KYujdhN6Y77"},
  {"name":"Giffer","scope":false,"email":"ggilyott15@github.io","password":"INizBw4qd08"},
  {"name":"Alasdair","scope":false,"email":"acuckson16@google.cn","password":"l6veQyoWuT"},
  {"name":"Anthea","scope":false,"email":"agayton17@skyrock.com","password":"AN65lmMf5Y"},
  {"name":"Raye","scope":false,"email":"rshoard18@boston.com","password":"nMAXN5rRw81K"},
  {"name":"Ivar","scope":false,"email":"igerrad19@stanford.edu","password":"hsIPvLwDhEC9"},
  {"name":"Filberte","scope":true,"email":"fgarfath1a@army.mil","password":"GFVeDCCj6j"},
  {"name":"Alexi","scope":false,"email":"adauby1b@friendfeed.com","password":"mMX1Qymit"},
  {"name":"Napoleon","scope":false,"email":"npaladino1c@discovery.com","password":"RKxfvmN9R"},
  {"name":"Emmet","scope":false,"email":"emontfort1d@cnet.com","password":"slQQSXTbbSE"},
  {"name":"Marijo","scope":true,"email":"miskower1e@wikispaces.com","password":"GWuk9s9eTTw"},
  {"name":"Nessa","scope":false,"email":"ngiacomini1f@php.net","password":"SQnUXcgaM"},
  {"name":"Luci","scope":true,"email":"lchorlton1g@seattletimes.com","password":"TV4ZVK24"},
  {"name":"Sebastiano","scope":true,"email":"sfrazer1h@scribd.com","password":"BueLnJnj"},
  {"name":"Cyndie","scope":false,"email":"cleil1i@plala.or.jp","password":"sJ8ivYzt"},
  {"name":"Tandi","scope":true,"email":"tmatijevic1j@freewebs.com","password":"X2FHhIBofh5"},
  {"name":"Arel","scope":true,"email":"agurwood1k@mysql.com","password":"8dUHabQpdq9"},
  {"name":"Antonetta","scope":true,"email":"agerge1l@live.com","password":"JKDtYt"},
  {"name":"Bourke","scope":false,"email":"bdevlin1m@slashdot.org","password":"FlZdoCe"},
  {"name":"Husein","scope":true,"email":"hcrosi1n@aol.com","password":"foyHkf0s"},
  {"name":"Ailee","scope":true,"email":"acausley1o@house.gov","password":"MoHNKgiszYMw"},
  {"name":"Bellina","scope":false,"email":"bpithie1p@webs.com","password":"tS0sZoV"},
  {"name":"Meade","scope":false,"email":"mandroletti1q@reference.com","password":"qT0FjQ0J1j"},
  {"name":"Merna","scope":true,"email":"mrillatt1r@infoseek.co.jp","password":"tjU5PaaLt1"},
  {"name":"Emlynn","scope":true,"email":"ecantle1s@arstechnica.com","password":"jah5zAH9jWL"},
  {"name":"Alick","scope":true,"email":"avilliers1t@wiley.com","password":"2J5GlzU"},
  {"name":"Marleen","scope":false,"email":"mevill1u@nytimes.com","password":"AGuWjz7DNX"},
  {"name":"Coriss","scope":true,"email":"chaquard1v@wired.com","password":"cbuKWU9QfZK"},
  {"name":"Rosalia","scope":true,"email":"rfleischmann1w@rakuten.co.jp","password":"eMxg3zW"},
  {"name":"Ode","scope":true,"email":"oventris1x@baidu.com","password":"gK0XYBWndDJ2"},
  {"name":"Bee","scope":true,"email":"bradborne1y@theatlantic.com","password":"3CyebHAscN0"},
  {"name":"Christye","scope":true,"email":"ctongs1z@soundcloud.com","password":"bQbd4ekJ5loY"},
  {"name":"Neala","scope":false,"email":"nnewby20@123-reg.co.uk","password":"vhj1Irf"},
  {"name":"Linnea","scope":true,"email":"lhampshaw21@a8.net","password":"IE7qbqunfh4"},
  {"name":"Hattie","scope":true,"email":"hewbanche22@bbc.co.uk","password":"RsDRdN5Qoxtk"},
  {"name":"Mitchel","scope":true,"email":"mmanford23@tumblr.com","password":"yiRFO9jiZ"},
  {"name":"Hanan","scope":false,"email":"hcoldwell24@behance.net","password":"UZZGF6"},
  {"name":"Ty","scope":true,"email":"tjuliano25@mediafire.com","password":"SeSC85tqi0S"},
  {"name":"Milty","scope":true,"email":"mstanyforth26@addtoany.com","password":"AvIIRqHXY"},
  {"name":"Cleon","scope":false,"email":"csiemons27@xinhuanet.com","password":"EJt0d34"},
  {"name":"Andriana","scope":false,"email":"aduckworth28@usnews.com","password":"IBax1QCby"},
  {"name":"Lotte","scope":true,"email":"lriddiford29@usatoday.com","password":"PnDk3RbI"},
  {"name":"Seamus","scope":true,"email":"solufsen2a@forbes.com","password":"fvzNO6cPI423"},
  {"name":"Crissy","scope":true,"email":"cseals2b@skype.com","password":"m6GlNBf5"},
  {"name":"Alanah","scope":true,"email":"athunnercliff2c@live.com","password":"zxdzTVN0"},
  {"name":"Gaynor","scope":false,"email":"gdodworth2d@phpbb.com","password":"jhjI3tMYUI"},
  {"name":"Bella","scope":false,"email":"bcheavin2e@ifeng.com","password":"SOxID97XQg"},
  {"name":"Trever","scope":false,"email":"tkrysiak2f@t-online.de","password":"mg2dKjd"},
  {"name":"Onfroi","scope":false,"email":"omcqueen2g@arizona.edu","password":"uuWq7A"},
  {"name":"Fleur","scope":true,"email":"fgatsby2h@slate.com","password":"WGCDUNYIf"},
  {"name":"Kristofer","scope":true,"email":"kcowland2i@blogger.com","password":"1Ij2EWE8lsf"},
  {"name":"Clark","scope":false,"email":"clensch2j@illinois.edu","password":"p3ixskgde"},
  {"name":"Reinaldos","scope":false,"email":"rdoxsey2k@constantcontact.com","password":"sycLNygX"},
  {"name":"Reeba","scope":true,"email":"rdabs2l@tiny.cc","password":"plUwc5y0"},
  {"name":"Millicent","scope":true,"email":"mgummary2m@nymag.com","password":"FO3fUBmjcfX"},
  {"name":"Roxie","scope":false,"email":"raukland2n@dion.ne.jp","password":"X6Tfq6qPD"},
  {"name":"Dominique","scope":true,"email":"dcobain2o@weibo.com","password":"LCcaVK8M765"},
  {"name":"Bert","scope":false,"email":"bwillford2p@paginegialle.it","password":"fbFrrVcdlA"},
  {"name":"Barbra","scope":false,"email":"bpennyman2q@exblog.jp","password":"VXioOKxCSFDS"},
  {"name":"Randa","scope":false,"email":"rasson2r@adobe.com","password":"ldd62J1U"}
];

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,255}$/;

users.map(u => {
  u.isAdmin = u.scope;
  u.scope = u.scope ? 'admin' : 'user';
  
  if(!passwordRegex.test(u.password)) u.password += 'aA1';
  u.password = User.generatePasswordHash(u.password);
});

module.exports.Seed = function(done) {
  // Connect using MongoClient
  MongoClient.connect(MONGO_URI, function(err, db) {
    var Users = db.collection('users');

    // Clean the collection first
    Users.remove();
    
    // Insert user with admin rights
    Users.insert(users, (err, result) => {
      if(err) throw err;
      console.log('> Seed complete \n> Inserted', result.insertedCount, 'users\n');
      
      done();
      
      db.close();
    });
  });
};

module.exports.Reset = function(done) {
  // Connect using MongoClient
  MongoClient.connect(MONGO_URI, function(err, db) {
    var Users = db.collection('users');

    // Clean the collection first
    Users.remove({}, (err, ready) => {
      console.log('\n> Clean complete \n> Removed', ready.result.n, 'users');
      
      db.close();
      
      done();
    });
  });
};
