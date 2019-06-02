/**
 * @author hfccr
 * */
const moment = require('moment');

const cities = [
  'Gotham City',
  'Metropolis',
  'Duckberg',
  'Star City',
  'Kamar-Taj',
  'Zion',
  'Hogsmeade',
  'Silent Hill',
  'Uda City',
  'Papaya Island',
  'Mordor',
  'Agrabah'
];
const airlines = [
  {
    address: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
    name: 'Jedi Airlines',
    mediums: ['Space Stone', 'Flying Carpet', 'Floo Network', 'TARDIS']
  },
  {
    address: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
    name: 'Sith Airlines',
    mediums: ['Quinjet', 'Millenium Falcon', 'Instant Transmission', 'DeLorean']
  },
  {
    address: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
    name: 'First Order Airlines',
    mediums: ['Nimbus 2000', 'USS Enterprise', 'Hogwarts Express', 'Trebuchet']
  }
];
const startDate = '2019-05-01';
const endDate = '2019-05-20';

const flightInfo = {
  cities, airlines
};

const flights = [];

const start = moment(startDate);
const end = moment(endDate);

const getRandomElementFromArray = arrayOfElements => {
  return arrayOfElements[Math.floor(Math.random() * arrayOfElements.length)];
};

while (start.isSameOrBefore(end)) {
  const sourceCity = getRandomElementFromArray(cities);
  const destinationCandidates = cities.filter(city => city !== sourceCity);
  const sinkCity = getRandomElementFromArray(destinationCandidates);
  const airline = getRandomElementFromArray(airlines);
  const medium = getRandomElementFromArray(airline.mediums);
  const airlineAddress = airline.address;
  const airlineName = airline.name;
  flights.push({
    name: medium,
    timestamp: start.unix(),
    source: sourceCity,
    sink: sinkCity,
    airlineAddress: airlineAddress,
    airlineName: airlineName
  });
  start.add(1, 'days');
}

flightInfo.flights = flights;

module.exports = flightInfo;
