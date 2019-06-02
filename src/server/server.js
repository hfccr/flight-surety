/**
 * @author hfccr
 * */
import 'babel-polyfill';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import setup from './contractSetup';
import addFlightStatusChangeApi from './flightStatusChangeApi';

const contractSetupPromise = setup();
const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

addFlightStatusChangeApi(app, contractSetupPromise);

export default app;
