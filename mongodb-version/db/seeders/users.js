'use strict';

const MongoClient = require('mongodb').MongoClient;
const Bcrypt = require('bcrypt');
const User = require('../models/user.js');
const MONGO_URI = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;

var users = [
  {"firstName":"Admin","scope":true,"email":"admin@hapi-api.lab","password":"testTEST1"},
  {"firstName":"Hill","scope":false,"email":"hhugo0@theglobeandmail.com","password":"s0FEqe7fd"},
  {"firstName":"Cristobal","scope":false,"email":"cfilppetti1@opera.com","password":"zR0V1jpQDj"},
  {"firstName":"Wendie","scope":false,"email":"wspurge2@cdbaby.com","password":"NnTJ18AFcwy"},
  {"firstName":"Gwennie","scope":false,"email":"gshropsheir3@istockphoto.com","password":"KT1CLhV9"},
  {"firstName":"Earle","scope":false,"email":"elitzmann4@rambler.ru","password":"L5MeO4PnE0z"},
  {"firstName":"Rafe","scope":false,"email":"rkryska5@prlog.org","password":"UGbQPqLg"},
  {"firstName":"Brantley","scope":false,"email":"bdureden6@instagram.com","password":"UgO9i9iD"},
  {"firstName":"Avictor","scope":false,"email":"apringuer7@si.edu","password":"MUqFWKQNzL"},
  {"firstName":"Stevena","scope":false,"email":"sbellham8@ehow.com","password":"EhNnGCFYx6N"},
  {"firstName":"Gael","scope":false,"email":"gshewan9@usda.gov","password":"XrdRbEUNY36"},
  {"firstName":"Randie","scope":false,"email":"rrathea@geocities.jp","password":"tyAT5p"},
  {"firstName":"Stevena","scope":false,"email":"sheymannb@usnews.com","password":"M0vBV7oKDc"},
  {"firstName":"Dael","scope":false,"email":"dfellmanc@discovery.com","password":"J8QPiDQzw"},
  {"firstName":"Ferdy","scope":false,"email":"fatkinsd@mtv.com","password":"AV1nMca9h"},
  {"firstName":"Jessica","scope":false,"email":"jtrayese@hugedomains.com","password":"RsFvEPgWlY"},
  {"firstName":"Kimberley","scope":false,"email":"kromainf@tinyurl.com","password":"Flha9eRr2Rr"},
  {"firstName":"Kevan","scope":false,"email":"ktrusseg@people.com.cn","password":"gW2Y51NKixCH"},
  {"firstName":"Kelly","scope":false,"email":"knarracotth@washington.edu","password":"e3OUz9"},
  {"firstName":"Hillard","scope":false,"email":"hruggeni@macromedia.com","password":"X3vQeEQIf"},
  {"firstName":"Jedd","scope":false,"email":"jvaughnj@thetimes.co.uk","password":"sANrcEfI"},
  {"firstName":"Boo","scope":false,"email":"bgillonk@blog.com","password":"Wjosa9bAiA"},
  {"firstName":"Grenville","scope":false,"email":"gupstonl@xrea.com","password":"XaO8CCUM"},
  {"firstName":"Britte","scope":false,"email":"bjaegarm@jiathis.com","password":"PHYhSbvPfz9"},
  {"firstName":"Sherri","scope":false,"email":"sberntssonn@instagram.com","password":"NVK8Yo"},
  {"firstName":"Barth","scope":false,"email":"bfleemingo@yandex.ru","password":"wAsZ8GqIv"},
  {"firstName":"Hermy","scope":false,"email":"hgatusp@psu.edu","password":"5K215z"},
  {"firstName":"Neron","scope":false,"email":"ngaifordq@angelfire.com","password":"Eq7O06I"},
  {"firstName":"Moises","scope":false,"email":"mmitchallr@spotify.com","password":"kJVSJLcgr23"},
  {"firstName":"Julienne","scope":false,"email":"jpalles@un.org","password":"QQ7e7Y0KS"},
  {"firstName":"Edita","scope":false,"email":"eriddockt@hc360.com","password":"yNIlDtA"},
  {"firstName":"Stirling","scope":false,"email":"scombeu@bloglovin.com","password":"RcQvlUYeUdQ"},
  {"firstName":"Yovonnda","scope":false,"email":"ybuxcyv@narod.ru","password":"iw5ZTFrJnt"},
  {"firstName":"Gaspar","scope":false,"email":"gcleetonw@spiegel.de","password":"WXeYu5C0ghXN"},
  {"firstName":"Silas","scope":false,"email":"scofaxx@webs.com","password":"wz35hL1a"},
  {"firstName":"Starla","scope":false,"email":"sstationy@ustream.tv","password":"8iyvd48R35d"},
  {"firstName":"Homerus","scope":false,"email":"hnoteyoungz@upenn.edu","password":"SYRxxraou"},
  {"firstName":"Lyndsay","scope":false,"email":"ljahnisch10@dyndns.org","password":"rhKuIJt"},
  {"firstName":"Shaine","scope":false,"email":"shanssmann11@sphinn.com","password":"kc2kFJtZKuD"},
  {"firstName":"Grazia","scope":false,"email":"glovejoy12@guardian.co.uk","password":"SJvHgxQMFKp"},
  {"firstName":"Camellia","scope":false,"email":"ccambridge13@abc.net.au","password":"CReqRetUK3"},
  {"firstName":"Dallis","scope":false,"email":"dsvanini14@pbs.org","password":"KYujdhN6Y77"},
  {"firstName":"Giffer","scope":false,"email":"ggilyott15@github.io","password":"INizBw4qd08"},
  {"firstName":"Alasdair","scope":false,"email":"acuckson16@google.cn","password":"l6veQyoWuT"},
  {"firstName":"Anthea","scope":false,"email":"agayton17@skyrock.com","password":"AN65lmMf5Y"},
  {"firstName":"Raye","scope":false,"email":"rshoard18@boston.com","password":"nMAXN5rRw81K"},
  {"firstName":"Ivar","scope":false,"email":"igerrad19@stanford.edu","password":"hsIPvLwDhEC9"},
  {"firstName":"Filberte","scope":false,"email":"fgarfath1a@army.mil","password":"GFVeDCCj6j"},
  {"firstName":"Alexi","scope":false,"email":"adauby1b@friendfeed.com","password":"mMX1Qymit"},
  {"firstName":"Napoleon","scope":false,"email":"npaladino1c@discovery.com","password":"RKxfvmN9R"},
  {"firstName":"Emmet","scope":false,"email":"emontfort1d@cnet.com","password":"slQQSXTbbSE"},
  {"firstName":"Marijo","scope":false,"email":"miskower1e@wikispaces.com","password":"GWuk9s9eTTw"},
  {"firstName":"Nessa","scope":false,"email":"ngiacomini1f@php.net","password":"SQnUXcgaM"},
  {"firstName":"Luci","scope":false,"email":"lchorlton1g@seattletimes.com","password":"TV4ZVK24"},
  {"firstName":"Sebastiano","scope":false,"email":"sfrazer1h@scribd.com","password":"BueLnJnj"},
  {"firstName":"Cyndie","scope":false,"email":"cleil1i@plala.or.jp","password":"sJ8ivYzt"},
  {"firstName":"Tandi","scope":false,"email":"tmatijevic1j@freewebs.com","password":"X2FHhIBofh5"},
  {"firstName":"Arel","scope":false,"email":"agurwood1k@mysql.com","password":"8dUHabQpdq9"},
  {"firstName":"Antonetta","scope":false,"email":"agerge1l@live.com","password":"JKDtYt"},
  {"firstName":"Bourke","scope":false,"email":"bdevlin1m@slashdot.org","password":"FlZdoCe"},
  {"firstName":"Husein","scope":false,"email":"hcrosi1n@aol.com","password":"foyHkf0s"},
  {"firstName":"Ailee","scope":false,"email":"acausley1o@house.gov","password":"MoHNKgiszYMw"},
  {"firstName":"Bellina","scope":false,"email":"bpithie1p@webs.com","password":"tS0sZoV"},
  {"firstName":"Meade","scope":false,"email":"mandroletti1q@reference.com","password":"qT0FjQ0J1j"},
  {"firstName":"Merna","scope":false,"email":"mrillatt1r@infoseek.co.jp","password":"tjU5PaaLt1"},
  {"firstName":"Emlynn","scope":false,"email":"ecantle1s@arstechnica.com","password":"jah5zAH9jWL"},
  {"firstName":"Alick","scope":false,"email":"avilliers1t@wiley.com","password":"2J5GlzU"},
  {"firstName":"Marleen","scope":false,"email":"mevill1u@nytimes.com","password":"AGuWjz7DNX"},
  {"firstName":"Coriss","scope":false,"email":"chaquard1v@wired.com","password":"cbuKWU9QfZK"},
  {"firstName":"Rosalia","scope":false,"email":"rfleischmann1w@rakuten.co.jp","password":"eMxg3zW"},
  {"firstName":"Ode","scope":false,"email":"oventris1x@baidu.com","password":"gK0XYBWndDJ2"},
  {"firstName":"Bee","scope":false,"email":"bradborne1y@theatlantic.com","password":"3CyebHAscN0"},
  {"firstName":"Christye","scope":false,"email":"ctongs1z@soundcloud.com","password":"bQbd4ekJ5loY"},
  {"firstName":"Neala","scope":false,"email":"nnewby20@123-reg.co.uk","password":"vhj1Irf"},
  {"firstName":"Linnea","scope":false,"email":"lhampshaw21@a8.net","password":"IE7qbqunfh4"},
  {"firstName":"Hattie","scope":false,"email":"hewbanche22@bbc.co.uk","password":"RsDRdN5Qoxtk"},
  {"firstName":"Mitchel","scope":false,"email":"mmanford23@tumblr.com","password":"yiRFO9jiZ"},
  {"firstName":"Hanan","scope":false,"email":"hcoldwell24@behance.net","password":"UZZGF6"},
  {"firstName":"Milty","scope":false,"email":"mstanyforth26@addtoany.com","password":"AvIIRqHXY"},
  {"firstName":"Cleon","scope":false,"email":"csiemons27@xinhuanet.com","password":"EJt0d34"},
  {"firstName":"Andriana","scope":false,"email":"aduckworth28@usnews.com","password":"IBax1QCby"},
  {"firstName":"Lotte","scope":false,"email":"lriddiford29@usatoday.com","password":"PnDk3RbI"},
  {"firstName":"Seamus","scope":false,"email":"solufsen2a@forbes.com","password":"fvzNO6cPI423"},
  {"firstName":"Crissy","scope":false,"email":"cseals2b@skype.com","password":"m6GlNBf5"},
  {"firstName":"Alanah","scope":false,"email":"athunnercliff2c@live.com","password":"zxdzTVN0"},
  {"firstName":"Gaynor","scope":false,"email":"gdodworth2d@phpbb.com","password":"jhjI3tMYUI"},
  {"firstName":"Bella","scope":false,"email":"bcheavin2e@ifeng.com","password":"SOxID97XQg"},
  {"firstName":"Trever","scope":false,"email":"tkrysiak2f@t-online.de","password":"mg2dKjd"},
  {"firstName":"Onfroi","scope":false,"email":"omcqueen2g@arizona.edu","password":"uuWq7A"},
  {"firstName":"Fleur","scope":false,"email":"fgatsby2h@slate.com","password":"WGCDUNYIf"},
  {"firstName":"Kristofer","scope":false,"email":"kcowland2i@blogger.com","password":"1Ij2EWE8lsf"},
  {"firstName":"Clark","scope":false,"email":"clensch2j@illinois.edu","password":"p3ixskgde"},
  {"firstName":"Reinaldos","scope":false,"email":"rdoxsey2k@constantcontact.com","password":"sycLNygX"},
  {"firstName":"Reeba","scope":false,"email":"rdabs2l@tiny.cc","password":"plUwc5y0"},
  {"firstName":"Millicent","scope":false,"email":"mgummary2m@nymag.com","password":"FO3fUBmjcfX"},
  {"firstName":"Roxie","scope":false,"email":"raukland2n@dion.ne.jp","password":"X6Tfq6qPD"},
  {"firstName":"Dominique","scope":false,"email":"dcobain2o@weibo.com","password":"LCcaVK8M765"},
  {"firstName":"Bert","scope":false,"email":"bwillford2p@paginegialle.it","password":"fbFrrVcdlA"},
  {"firstName":"Barbra","scope":false,"email":"bpennyman2q@exblog.jp","password":"VXioOKxCSFDS"},
  {"firstName":"Randa","scope":false,"email":"rasson2r@adobe.com","password":"ldd62J1U"}
];

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,255}$/;

var rawUsers = [];

users.map(u => {
  u.isAdmin = u.scope;
  u.scope = u.scope ? 'admin' : 'user';
  u.lastName = 'Test';
  
  if(!passwordRegex.test(u.password)) u.password += 'aA1';

  rawUsers.push(Object.assign({}, u));

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

module.exports.users = rawUsers;
