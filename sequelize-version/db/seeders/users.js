'use strict';

const uuid = require('uuid4');
const bcrypt = require('bcrypt');

var users = [
  {"name":"Admin","scope":true,"email":"admin@hapi-api.lab","password":"testTEST1"},
  {"name":"Hill","scope":false,"email":"hhugo0@theglobeandmail.com","password":"s0FEqe7fd"},
  {"name":"Cristobal","scope":false,"email":"cfilppetti1@opera.com","password":"zR0V1jpQDj"},
  {"name":"Wendie","scope":false,"email":"wspurge2@cdbaby.com","password":"NnTJ18AFcwy"},
  {"name":"Gwennie","scope":false,"email":"gshropsheir3@istockphoto.com","password":"KT1CLhV9"},
  {"name":"Earle","scope":false,"email":"elitzmann4@rambler.ru","password":"L5MeO4PnE0z"},
  {"name":"Rafe","scope":false,"email":"rkryska5@prlog.org","password":"UGbQPqLg"},
  {"name":"Brantley","scope":false,"email":"bdureden6@instagram.com","password":"UgO9i9iD"},
  {"name":"Avictor","scope":false,"email":"apringuer7@si.edu","password":"MUqFWKQNzL"},
  {"name":"Stevena","scope":false,"email":"sbellham8@ehow.com","password":"EhNnGCFYx6N"},
  {"name":"Gael","scope":false,"email":"gshewan9@usda.gov","password":"XrdRbEUNY36"},
  {"name":"Randie","scope":false,"email":"rrathea@geocities.jp","password":"tyAT5p"},
  {"name":"Stevena","scope":false,"email":"sheymannb@usnews.com","password":"M0vBV7oKDc"},
  {"name":"Dael","scope":false,"email":"dfellmanc@discovery.com","password":"J8QPiDQzw"},
  {"name":"Ferdy","scope":false,"email":"fatkinsd@mtv.com","password":"AV1nMca9h"},
  {"name":"Jessica","scope":false,"email":"jtrayese@hugedomains.com","password":"RsFvEPgWlY"},
  {"name":"Kimberley","scope":false,"email":"kromainf@tinyurl.com","password":"Flha9eRr2Rr"},
  {"name":"Kevan","scope":false,"email":"ktrusseg@people.com.cn","password":"gW2Y51NKixCH"},
  {"name":"Kelly","scope":false,"email":"knarracotth@washington.edu","password":"e3OUz9"},
  {"name":"Hillard","scope":false,"email":"hruggeni@macromedia.com","password":"X3vQeEQIf"},
  {"name":"Jedd","scope":false,"email":"jvaughnj@thetimes.co.uk","password":"sANrcEfI"},
  {"name":"Boo","scope":false,"email":"bgillonk@blog.com","password":"Wjosa9bAiA"},
  {"name":"Grenville","scope":false,"email":"gupstonl@xrea.com","password":"XaO8CCUM"},
  {"name":"Britte","scope":false,"email":"bjaegarm@jiathis.com","password":"PHYhSbvPfz9"},
  {"name":"Sherri","scope":false,"email":"sberntssonn@instagram.com","password":"NVK8Yo"},
  {"name":"Barth","scope":false,"email":"bfleemingo@yandex.ru","password":"wAsZ8GqIv"},
  {"name":"Hermy","scope":false,"email":"hgatusp@psu.edu","password":"5K215z"},
  {"name":"Neron","scope":false,"email":"ngaifordq@angelfire.com","password":"Eq7O06I"},
  {"name":"Moises","scope":false,"email":"mmitchallr@spotify.com","password":"kJVSJLcgr23"},
  {"name":"Julienne","scope":false,"email":"jpalles@un.org","password":"QQ7e7Y0KS"},
  {"name":"Edita","scope":false,"email":"eriddockt@hc360.com","password":"yNIlDtA"},
  {"name":"Stirling","scope":false,"email":"scombeu@bloglovin.com","password":"RcQvlUYeUdQ"},
  {"name":"Yovonnda","scope":false,"email":"ybuxcyv@narod.ru","password":"iw5ZTFrJnt"},
  {"name":"Gaspar","scope":false,"email":"gcleetonw@spiegel.de","password":"WXeYu5C0ghXN"},
  {"name":"Silas","scope":false,"email":"scofaxx@webs.com","password":"wz35hL1a"},
  {"name":"Starla","scope":false,"email":"sstationy@ustream.tv","password":"8iyvd48R35d"},
  {"name":"Homerus","scope":false,"email":"hnoteyoungz@upenn.edu","password":"SYRxxraou"},
  {"name":"Lyndsay","scope":false,"email":"ljahnisch10@dyndns.org","password":"rhKuIJt"},
  {"name":"Shaine","scope":false,"email":"shanssmann11@sphinn.com","password":"kc2kFJtZKuD"},
  {"name":"Grazia","scope":false,"email":"glovejoy12@guardian.co.uk","password":"SJvHgxQMFKp"},
  {"name":"Camellia","scope":false,"email":"ccambridge13@abc.net.au","password":"CReqRetUK3"},
  {"name":"Dallis","scope":false,"email":"dsvanini14@pbs.org","password":"KYujdhN6Y77"},
  {"name":"Giffer","scope":false,"email":"ggilyott15@github.io","password":"INizBw4qd08"},
  {"name":"Alasdair","scope":false,"email":"acuckson16@google.cn","password":"l6veQyoWuT"},
  {"name":"Anthea","scope":false,"email":"agayton17@skyrock.com","password":"AN65lmMf5Y"},
  {"name":"Raye","scope":false,"email":"rshoard18@boston.com","password":"nMAXN5rRw81K"},
  {"name":"Ivar","scope":false,"email":"igerrad19@stanford.edu","password":"hsIPvLwDhEC9"},
  {"name":"Filberte","scope":false,"email":"fgarfath1a@army.mil","password":"GFVeDCCj6j"},
  {"name":"Alexi","scope":false,"email":"adauby1b@friendfeed.com","password":"mMX1Qymit"},
  {"name":"Napoleon","scope":false,"email":"npaladino1c@discovery.com","password":"RKxfvmN9R"},
  {"name":"Emmet","scope":false,"email":"emontfort1d@cnet.com","password":"slQQSXTbbSE"},
  {"name":"Marijo","scope":false,"email":"miskower1e@wikispaces.com","password":"GWuk9s9eTTw"},
  {"name":"Nessa","scope":false,"email":"ngiacomini1f@php.net","password":"SQnUXcgaM"},
  {"name":"Luci","scope":false,"email":"lchorlton1g@seattletimes.com","password":"TV4ZVK24"},
  {"name":"Sebastiano","scope":false,"email":"sfrazer1h@scribd.com","password":"BueLnJnj"},
  {"name":"Cyndie","scope":false,"email":"cleil1i@plala.or.jp","password":"sJ8ivYzt"},
  {"name":"Tandi","scope":false,"email":"tmatijevic1j@freewebs.com","password":"X2FHhIBofh5"},
  {"name":"Arel","scope":false,"email":"agurwood1k@mysql.com","password":"8dUHabQpdq9"},
  {"name":"Antonetta","scope":false,"email":"agerge1l@live.com","password":"JKDtYt"},
  {"name":"Bourke","scope":false,"email":"bdevlin1m@slashdot.org","password":"FlZdoCe"},
  {"name":"Husein","scope":false,"email":"hcrosi1n@aol.com","password":"foyHkf0s"},
  {"name":"Ailee","scope":false,"email":"acausley1o@house.gov","password":"MoHNKgiszYMw"},
  {"name":"Bellina","scope":false,"email":"bpithie1p@webs.com","password":"tS0sZoV"},
  {"name":"Meade","scope":false,"email":"mandroletti1q@reference.com","password":"qT0FjQ0J1j"},
  {"name":"Merna","scope":false,"email":"mrillatt1r@infoseek.co.jp","password":"tjU5PaaLt1"},
  {"name":"Emlynn","scope":false,"email":"ecantle1s@arstechnica.com","password":"jah5zAH9jWL"},
  {"name":"Alick","scope":false,"email":"avilliers1t@wiley.com","password":"2J5GlzU"},
  {"name":"Marleen","scope":false,"email":"mevill1u@nytimes.com","password":"AGuWjz7DNX"},
  {"name":"Coriss","scope":false,"email":"chaquard1v@wired.com","password":"cbuKWU9QfZK"},
  {"name":"Rosalia","scope":false,"email":"rfleischmann1w@rakuten.co.jp","password":"eMxg3zW"},
  {"name":"Ode","scope":false,"email":"oventris1x@baidu.com","password":"gK0XYBWndDJ2"},
  {"name":"Bee","scope":false,"email":"bradborne1y@theatlantic.com","password":"3CyebHAscN0"},
  {"name":"Christye","scope":false,"email":"ctongs1z@soundcloud.com","password":"bQbd4ekJ5loY"},
  {"name":"Neala","scope":false,"email":"nnewby20@123-reg.co.uk","password":"vhj1Irf"},
  {"name":"Linnea","scope":false,"email":"lhampshaw21@a8.net","password":"IE7qbqunfh4"},
  {"name":"Hattie","scope":false,"email":"hewbanche22@bbc.co.uk","password":"RsDRdN5Qoxtk"},
  {"name":"Mitchel","scope":false,"email":"mmanford23@tumblr.com","password":"yiRFO9jiZ"},
  {"name":"Hanan","scope":false,"email":"hcoldwell24@behance.net","password":"UZZGF6"},
  {"name":"Milty","scope":false,"email":"mstanyforth26@addtoany.com","password":"AvIIRqHXY"},
  {"name":"Cleon","scope":false,"email":"csiemons27@xinhuanet.com","password":"EJt0d34"},
  {"name":"Andriana","scope":false,"email":"aduckworth28@usnews.com","password":"IBax1QCby"},
  {"name":"Lotte","scope":false,"email":"lriddiford29@usatoday.com","password":"PnDk3RbI"},
  {"name":"Seamus","scope":false,"email":"solufsen2a@forbes.com","password":"fvzNO6cPI423"},
  {"name":"Crissy","scope":false,"email":"cseals2b@skype.com","password":"m6GlNBf5"},
  {"name":"Alanah","scope":false,"email":"athunnercliff2c@live.com","password":"zxdzTVN0"},
  {"name":"Gaynor","scope":false,"email":"gdodworth2d@phpbb.com","password":"jhjI3tMYUI"},
  {"name":"Bella","scope":false,"email":"bcheavin2e@ifeng.com","password":"SOxID97XQg"},
  {"name":"Trever","scope":false,"email":"tkrysiak2f@t-online.de","password":"mg2dKjd"},
  {"name":"Onfroi","scope":false,"email":"omcqueen2g@arizona.edu","password":"uuWq7A"},
  {"name":"Fleur","scope":false,"email":"fgatsby2h@slate.com","password":"WGCDUNYIf"},
  {"name":"Kristofer","scope":false,"email":"kcowland2i@blogger.com","password":"1Ij2EWE8lsf"},
  {"name":"Clark","scope":false,"email":"clensch2j@illinois.edu","password":"p3ixskgde"},
  {"name":"Reinaldos","scope":false,"email":"rdoxsey2k@constantcontact.com","password":"sycLNygX"},
  {"name":"Reeba","scope":false,"email":"rdabs2l@tiny.cc","password":"plUwc5y0"},
  {"name":"Millicent","scope":false,"email":"mgummary2m@nymag.com","password":"FO3fUBmjcfX"},
  {"name":"Roxie","scope":false,"email":"raukland2n@dion.ne.jp","password":"X6Tfq6qPD"},
  {"name":"Dominique","scope":false,"email":"dcobain2o@weibo.com","password":"LCcaVK8M765"},
  {"name":"Bert","scope":false,"email":"bwillford2p@paginegialle.it","password":"fbFrrVcdlA"},
  {"name":"Barbra","scope":false,"email":"bpennyman2q@exblog.jp","password":"VXioOKxCSFDS"},
  {"name":"Randa","scope":false,"email":"rasson2r@adobe.com","password":"ldd62J1U"}
];

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,255}$/;

var rawUsers = [];

users.map(u => {
  u.id = uuid();
  u.createdAt = new Date();
  u.updatedAt = new Date();
  u.isAdmin = u.scope;
  u.scope = u.scope ? 'admin' : 'user';
  u.firstName = u.name;
  u.lastName = 'Smith';
  
  if(!passwordRegex.test(u.password)) u.password += 'aA1';

  rawUsers.push(Object.assign({}, u));

  u.password = bcrypt.hashSync(u.password, bcrypt.genSaltSync(8), null);
});

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', users, {});
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete({tableName: 'Users'}, null, {});
  },
  users: rawUsers
};
