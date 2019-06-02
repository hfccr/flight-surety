/**
 * @author hfccr
 * */
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Flight from './Flight.jsx';
import Grid from '@material-ui/core/Grid';
import Config from './../config.json';

const config = Config.localhost;
const flightInfo = config.flightInfo;
const flightList = flightInfo.flights;

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(6)
  }
});

class Flights extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid
          container
          spacing={4}
          direction="row"
          justify="center"
          alignItems="center"
        >
          {flightList.map((flight, i) => (
            <Grid item key={i}>
              <Flight flight={flight} />
            </Grid>
          ))}
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(Flights);
