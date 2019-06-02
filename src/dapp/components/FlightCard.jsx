/**
 * @author hfccr
 * */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import FlightLandIcon from '@material-ui/icons/FlightLand';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import moment from 'moment';

const imageMapping = {
  'Gotham City':
    'https://upload.wikimedia.org/wikipedia/en/2/2c/Gotham_City_Batman_Vol_3_14.png',
  Metropolis:
    'https://upload.wikimedia.org/wikipedia/en/4/41/Superman-Look_Up_in_the_Sky.jpg',
  Duckberg:
    'https://vignette.wikia.nocookie.net/disney/images/5/55/Duckburg.jpg/revision/latest?cb=20140501055656',
  'Star City':
    'https://upload.wikimedia.org/wikipedia/en/f/fd/Star_City_%28DC_Comics_setting%29.jpg',
  'Kamar-Taj':
    'https://vignette.wikia.nocookie.net/marvelcinematicuniverse/images/d/db/DS_Guidebook_Kamar-Taj.png/revision/latest/scale-to-width-down/1000?cb=20170329165841',
  Zion:
    'https://vignette.wikia.nocookie.net/matrix/images/4/4d/Zion-the_living_levels.jpg/revision/latest/scale-to-width-down/1000?cb=20130115024908',
  Hogsmeade: 'https://upload.wikimedia.org/wikipedia/en/6/63/HogsmeadeHP.jpg',
  'Silent Hill':
    'https://starfyshlove.files.wordpress.com/2012/03/welcome-to-silent-hill.jpg',
  'Uda City':
    'https://pbs.twimg.com/profile_images/877421534486315008/8wplWcXI_400x400.jpg',
  'Papaya Island':
    'https://upload.wikimedia.org/wikipedia/en/a/ab/Vegeta_First.PNG',
  Mordor:
    'https://upload.wikimedia.org/wikipedia/en/3/30/Two_Towers-Gollum.jpg',
  Agrabah:
    'https://www.snopes.com/tachyon/2015/12/agrabah.jpg?resize=865,452&quality=65'
};

const statusMap = {
  '103': 'Changing',
  '102': 'Failed',
  '101': 'Fetching',
  '0': 'Not Landed',
  '10': 'On Time',
  '20': 'Late - Airline',
  '30': 'Late - Weather',
  '40': 'Late - Technical',
  '50': 'Late - Other'
};

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 400
  },
  media: {
    height: 0,
    paddingTop: '56.25%' // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main
  },
  keyVals: {
    width: '100%'
  },
  keyVal: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'space-between'
  },
  keyValKey: {},
  keyValVal: {},
  button: {
    margin: theme.spacing(1)
  },
  leftIcon: {
    marginRight: theme.spacing(1)
  },
  rightIcon: {
    marginLeft: theme.spacing(1)
  },
  iconSmall: {
    fontSize: 20
  }
}));

function FlightCard(props) {
  const classes = useStyles();
  const [status, setStatus] = React.useState(101);
  const [statusChange, setStatusChange] = React.useState(false);
  const [bought, setBought] = React.useState(false);
  const { flight } = props;
  const { name, timestamp, source, sink, airlineAddress, airlineName } = flight;
  const day = moment.unix(timestamp);

  const fetchStatus = async () => {
    const contract = window.contractInfo.flightSuretyApp;
    let newStatus;
    try {
      newStatus = await contract.methods
        .getFlightStatusCode(airlineAddress, name, timestamp)
        .call({ from: airlineAddress });
      newStatus = parseInt(newStatus);
    } catch (e) {
      console.log('Status fetch failed');
    }
    if (status === 103 && newStatus === 0) {
      window.setTimeout(10000, () => {
        console.log('Re fetching status');
        fetchStatus();
      });
    } else {
      setStatus(newStatus);
    }
    return status;
  };
  useEffect(() => {
    fetchStatus();
  });

  const handleBuyClick = async () => {
    console.log('Buying insurance');
    console.log(name);
    const contract = window.contractInfo.flightSuretyApp;
    const accounts = window.contractInfo.accounts;
    const GAS = window.contractInfo.GAS;
    const amount = await contract.methods.PREMIUM().call();
    await contract.methods
      .buyInsurance(airlineAddress, name, timestamp)
      .send({ from: accounts[0], value: amount.toString(), gas: GAS });
    console.log('Bought');
    setBought(true);
  };

  const handleStatusClick = async () => {
    setStatus(103);
    setStatusChange(true);
    console.log('Requesting status change');
    const responseJson = await fetch(
      `http://localhost:3000/api/flight/status/change?airline=${airlineAddress}&flight=${name}&timestamp=${timestamp}`
    );
    console.log(responseJson);
    const response = await responseJson.text();
    console.log(response);
    fetchStatus();
  };

  const airlineAddressView =
    airlineAddress.substring(0, 5) +
    '...' +
    airlineAddress.substring(airlineAddress.length - 5, airlineAddress.length);

  return (
    <Card className={classes.card}>
      <CardHeader
        avatar={
          <Avatar aria-label="Recipe" className={classes.avatar}>
            {airlineName[0]}
          </Avatar>
        }
        title={airlineName}
        subheader={airlineAddressView}
      />
      <CardMedia
        className={classes.media}
        image={imageMapping[sink]}
        title={sink}
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="div">
          <div className={classes.keyVals}>
            <div className={classes.keyVal}>
              <div className={classes.keyValKey}>Flight</div>
              <div className={classes.keyValVal}>{name}</div>
            </div>
            <div className={classes.keyVal}>
              <div className={classes.keyValKey}>To</div>
              <div className={classes.keyValVal}>{sink}</div>
            </div>
            <div className={classes.keyVal}>
              <div className={classes.keyValKey}>From</div>
              <div className={classes.keyValVal}>{source}</div>
            </div>
            <div className={classes.keyVal}>
              <div className={classes.keyValKey}>On</div>
              <div className={classes.keyValVal}>
                {day.format('Do MMM YYYY')}
              </div>
            </div>
            <div className={classes.keyVal}>
              <div className={classes.keyValKey}>Status</div>
              <div className={classes.keyValVal}>{statusMap[status]}</div>
            </div>
          </div>
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <Button
          size="small"
          color="primary"
          onClick={handleBuyClick}
          disabled={status !== 0 || bought || statusChange}
        >
          <AttachMoneyIcon
            className={clsx(classes.leftIcon, classes.iconSmall)}
          />
          Buy Insurance
        </Button>
        <Button
          size="small"
          color="primary"
          onClick={handleStatusClick}
          disabled={status !== 0 || statusChange}
        >
          <FlightLandIcon
            className={clsx(classes.leftIcon, classes.iconSmall)}
          />
          Change Status
        </Button>
      </CardActions>
    </Card>
  );
}

export default FlightCard;
